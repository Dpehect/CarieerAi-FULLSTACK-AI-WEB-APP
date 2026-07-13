"""
KariyerAI — Ollama LLM handler + memory + analiz orkestrasyonu.
API key yok. Token tasarrufu: kısa context, sıkı truncate.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Generator, List, Optional

from config import (
    DEFAULT_MODEL,
    DEFAULT_TEMPERATURE,
    MAX_CTX_CHARS,
    MAX_DOC_CHARS,
    MODEL_PREFERENCE,
    OLLAMA_HOST,
)
from prompts import (
    ATS_LLM_PROMPT,
    CAREER_ANALYSIS_PROMPT,
    CHAT_PROMPT,
    COVER_LETTER_PROMPT,
    CV_IMPROVE_PROMPT,
    FULL_REPORT_PROMPT,
    GAP_ANALYSIS_PROMPT,
    INTERVIEW_PREP_PROMPT,
    LINKEDIN_PROMPT,
    ROADMAP_PROMPT,
    SUMMARY_PROMPT,
    SYSTEM_PROMPT,
    build_prompt,
)
from rag_engine import RAGEngine


@dataclass
class ChatMessage:
    role: str
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat(timespec="seconds"))

    def to_dict(self) -> dict:
        return {"role": self.role, "content": self.content, "timestamp": self.timestamp}


@dataclass
class ConversationMemory:
    messages: List[ChatMessage] = field(default_factory=list)
    max_messages: int = 24

    def add(self, role: str, content: str) -> None:
        self.messages.append(ChatMessage(role=role, content=content))
        non_sys = [m for m in self.messages if m.role != "system"]
        if len(non_sys) > self.max_messages:
            overflow = len(non_sys) - self.max_messages
            kept_sys = [m for m in self.messages if m.role == "system"]
            self.messages = kept_sys + non_sys[overflow:]

    def clear(self) -> None:
        self.messages.clear()

    def history_text(self, last_n: int = 6) -> str:
        recent = [m for m in self.messages if m.role in ("user", "assistant")][-last_n:]
        if not recent:
            return "(yok)"
        lines = []
        for m in recent:
            label = "K" if m.role == "user" else "AI"
            body = m.content if len(m.content) < 400 else m.content[:400] + "…"
            lines.append(f"{label}: {body}")
        return "\n".join(lines)

    def to_list(self) -> List[dict]:
        return [m.to_dict() for m in self.messages]

    @classmethod
    def from_list(cls, data: List[dict], max_messages: int = 24) -> "ConversationMemory":
        mem = cls(max_messages=max_messages)
        for item in data or []:
            mem.messages.append(
                ChatMessage(
                    role=item.get("role", "user"),
                    content=item.get("content", ""),
                    timestamp=item.get("timestamp", datetime.now().isoformat(timespec="seconds")),
                )
            )
        return mem


class LLMHandler:
    def __init__(
        self,
        model: str = DEFAULT_MODEL,
        ollama_host: str = OLLAMA_HOST,
        temperature: float = DEFAULT_TEMPERATURE,
        rag: Optional[RAGEngine] = None,
    ):
        self.model = model
        self.ollama_host = ollama_host.rstrip("/")
        self.temperature = temperature
        self.rag = rag or RAGEngine(ollama_host=ollama_host)
        self.memory = ConversationMemory()
        self._client = None
        self.cv_text = ""
        self.job_text = ""
        self.cv_summary = "(CV yok)"
        self.job_summary = "(İlan yok)"

    def _get_client(self):
        if self._client is None:
            import ollama
            self._client = ollama.Client(host=self.ollama_host)
        return self._client

    @staticmethod
    def _parse_model_names(listing) -> List[str]:
        raw = listing.get("models") if isinstance(listing, dict) else getattr(listing, "models", []) or []
        names = []
        for m in raw:
            if isinstance(m, dict):
                names.append(m.get("name") or m.get("model") or "")
            else:
                names.append(getattr(m, "model", None) or getattr(m, "name", "") or "")
        return [n for n in names if n]

    @classmethod
    def pick_best_model(cls, available: List[str], preferred: str = DEFAULT_MODEL) -> str:
        """Yüklü modellerden tercih listesine göre en iyisini seç."""
        if not available:
            return preferred
        if any(preferred == n or n.startswith(preferred.split(":")[0]) for n in available):
            for n in available:
                if n == preferred or n.startswith(preferred + ":") or preferred.startswith(n.split(":")[0]):
                    if preferred in n or n.startswith(preferred.split(":")[0]):
                        # exact-ish match
                        if n == preferred or n.startswith(preferred):
                            return n
            for n in available:
                if n.startswith(preferred.split(":")[0]):
                    return n
        for cand in MODEL_PREFERENCE:
            for n in available:
                if n == cand or n.startswith(cand.split(":")[0]):
                    return n
        return available[0]

    def check_connection(self) -> dict:
        try:
            client = self._get_client()
            names = self._parse_model_names(client.list())
            if not names:
                return {"ok": False, "message": f"Model yok. ollama pull {self.model}", "models": []}
            model_ok = any(
                self.model == n or n.startswith(self.model.split(":")[0]) for n in names
            )
            suggested = self.pick_best_model(names, self.model)
            if not model_ok:
                return {
                    "ok": False,
                    "message": f"'{self.model}' yok. Öneri: {suggested}. Yüklü: {', '.join(names[:6])}",
                    "models": names,
                    "suggested": suggested,
                }
            return {
                "ok": True,
                "message": f"Ollama OK · {self.model}",
                "models": names,
                "suggested": suggested,
            }
        except Exception as e:
            return {
                "ok": False,
                "message": f"Ollama kapalı mı? {self.ollama_host} · {e}",
                "models": [],
                "suggested": self.model,
            }

    def set_cv_text(self, text: str) -> None:
        self.cv_text = text or ""
        self.cv_summary = self._short(self.cv_text, 500) if self.cv_text else "(CV yok)"

    def set_job_text(self, text: str) -> None:
        self.job_text = text or ""
        self.job_summary = self._short(self.job_text, 500) if self.job_text else "(İlan yok)"

    @staticmethod
    def _short(text: str, n: int = 500) -> str:
        t = " ".join((text or "").split())
        return t if len(t) <= n else t[:n] + "…"

    @staticmethod
    def _trunc(text: str, max_chars: int = MAX_DOC_CHARS) -> str:
        if not text:
            return ""
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "\n[...kısaltıldı...]"

    def _ctx(self, query: str, top_k: int = 5) -> str:
        return self.rag.build_context(query, top_k=top_k, max_chars=MAX_CTX_CHARS)

    def _docs(self, query: str) -> dict:
        return {
            "cv_text": self._trunc(self.cv_text),
            "job_text": self._trunc(self.job_text),
            "context": self._ctx(query),
        }

    def generate(self, prompt: str, system: str = SYSTEM_PROMPT, temperature: Optional[float] = None) -> str:
        client = self._get_client()
        temp = self.temperature if temperature is None else temperature
        resp = client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            options={"temperature": temp, "num_ctx": 6144, "num_predict": 2048},
        )
        return self._extract_content(resp)

    def generate_stream(
        self, prompt: str, system: str = SYSTEM_PROMPT, temperature: Optional[float] = None
    ) -> Generator[str, None, None]:
        client = self._get_client()
        temp = self.temperature if temperature is None else temperature
        try:
            stream = client.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                stream=True,
                options={"temperature": temp, "num_ctx": 6144, "num_predict": 2048},
            )
            for chunk in stream:
                c = self._extract_stream_delta(chunk)
                if c:
                    yield c
        except Exception as e:
            yield f"\n\n⚠️ Hata: {e}"

    def chat_stream(self, user_message: str, use_rag: bool = True, top_k: int = 5) -> Generator[str, None, None]:
        context = self._ctx(user_message, top_k=top_k) if use_rag else ""
        prompt = build_prompt(
            CHAT_PROMPT,
            question=user_message,
            chat_history=self.memory.history_text(),
            context=context,
            cv_summary=self.cv_summary,
            job_summary=self.job_summary,
        )
        self.memory.add("user", user_message)
        full: List[str] = []
        for token in self.generate_stream(prompt):
            full.append(token)
            yield token
        self.memory.add("assistant", "".join(full))

    def career_analysis(self, stream: bool = True):
        p = build_prompt(CAREER_ANALYSIS_PROMPT, **self._docs("uyum deneyim beceri skor"))
        return self.generate_stream(p) if stream else self.generate(p)

    def gap_analysis(self, stream: bool = True):
        p = build_prompt(GAP_ANALYSIS_PROMPT, **self._docs("eksik beceri gereksinim gap"))
        return self.generate_stream(p) if stream else self.generate(p)

    def roadmap(self, extra_notes: str = "", stream: bool = True):
        d = self._docs("yol haritası öğrenme plan")
        p = build_prompt(ROADMAP_PROMPT, **d, extra_notes=extra_notes or "Yok")
        return self.generate_stream(p) if stream else self.generate(p)

    def improve_cv(self, stream: bool = True):
        p = build_prompt(CV_IMPROVE_PROMPT, **self._docs("cv iyileştir anahtar kelime"))
        return self.generate_stream(p) if stream else self.generate(p)

    def interview_prep(self, stream: bool = True):
        p = build_prompt(INTERVIEW_PREP_PROMPT, **self._docs("mülakat STAR teknik"))
        return self.generate_stream(p) if stream else self.generate(p)

    def ats_commentary(self, ats_local_score: int, ats_summary: str, stream: bool = True):
        d = self._docs("ATS anahtar kelime format")
        p = build_prompt(
            ATS_LLM_PROMPT,
            **d,
            ats_local_score=str(ats_local_score),
            ats_summary=ats_summary,
        )
        return self.generate_stream(p) if stream else self.generate(p)

    def full_report(self, ats_local_score: int, ats_summary: str, stream: bool = True):
        d = self._docs("özet gap aksiyon plan")
        p = build_prompt(
            FULL_REPORT_PROMPT,
            **d,
            ats_local_score=str(ats_local_score),
            ats_summary=ats_summary,
        )
        return self.generate_stream(p) if stream else self.generate(p)

    def cover_letter(self, stream: bool = True):
        p = build_prompt(COVER_LETTER_PROMPT, **self._docs("motivasyon mektubu başvuru"))
        return self.generate_stream(p) if stream else self.generate(p)

    def linkedin_profile(self, stream: bool = True):
        p = build_prompt(LINKEDIN_PROMPT, **self._docs("linkedin headline about skills"))
        return self.generate_stream(p) if stream else self.generate(p)

    def export_memory_json(self) -> str:
        return json.dumps(self.memory.to_list(), ensure_ascii=False, indent=2)

    def clear_memory(self) -> None:
        self.memory.clear()

    @staticmethod
    def _extract_content(resp: Any) -> str:
        if resp is None:
            return ""
        if isinstance(resp, dict):
            msg = resp.get("message") or {}
            return ((msg.get("content") if isinstance(msg, dict) else getattr(msg, "content", None)) or "").strip()
        msg = getattr(resp, "message", None)
        return ((getattr(msg, "content", None) if msg else None) or "").strip()

    @staticmethod
    def _extract_stream_delta(chunk: Any) -> str:
        if chunk is None:
            return ""
        if isinstance(chunk, dict):
            msg = chunk.get("message") or {}
            return (msg.get("content") if isinstance(msg, dict) else getattr(msg, "content", None)) or ""
        msg = getattr(chunk, "message", None)
        return (getattr(msg, "content", None) if msg else None) or ""
