"""
KariyerAI - LLM Handler
Ollama üzerinden yerel LLM çağrıları, sohbet geçmişi ve analiz orkestrasyonu.
API key YOK — sadece localhost Ollama.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional

from prompts import (
    CAREER_ANALYSIS_PROMPT,
    CHAT_PROMPT,
    CV_IMPROVE_PROMPT,
    GAP_ANALYSIS_PROMPT,
    INTERVIEW_PREP_PROMPT,
    ROADMAP_PROMPT,
    SUMMARY_PROMPT,
    SYSTEM_PROMPT,
    build_prompt,
)
from rag_engine import RAGEngine


# Desteklenen modeller (kullanıcı Ollama'da hangisini indirdiyse onu seçer)
DEFAULT_MODEL = "llama3.1:8b"
FALLBACK_MODELS = ["llama3.1:8b", "qwen2.5:14b", "llama3.2", "mistral", "gemma2:9b"]


@dataclass
class ChatMessage:
    """Tek bir sohbet mesajı."""

    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat(timespec="seconds"))

    def to_dict(self) -> dict:
        return {"role": self.role, "content": self.content, "timestamp": self.timestamp}


@dataclass
class ConversationMemory:
    """
    Oturum içi konuşma geçmişi.
    Streamlit session_state ile senkron tutulur.
    """

    messages: List[ChatMessage] = field(default_factory=list)
    max_messages: int = 40  # son N mesaj (user+assistant)

    def add(self, role: str, content: str) -> None:
        self.messages.append(ChatMessage(role=role, content=content))
        # Sistem mesajları hariç kırp
        non_system = [m for m in self.messages if m.role != "system"]
        if len(non_system) > self.max_messages:
            # En eski user/assistant çiftlerini at
            overflow = len(non_system) - self.max_messages
            kept_system = [m for m in self.messages if m.role == "system"]
            kept_rest = non_system[overflow:]
            self.messages = kept_system + kept_rest

    def clear(self) -> None:
        self.messages.clear()

    def as_ollama_messages(self, system: str = SYSTEM_PROMPT) -> List[dict]:
        """Ollama chat API formatı."""
        out = [{"role": "system", "content": system}]
        for m in self.messages:
            if m.role in ("user", "assistant"):
                out.append({"role": m.role, "content": m.content})
        return out

    def history_text(self, last_n: int = 8) -> str:
        """Prompt içine gömülecek kısa geçmiş metni."""
        recent = [m for m in self.messages if m.role in ("user", "assistant")][-last_n:]
        if not recent:
            return "(Henüz geçmiş yok.)"
        lines = []
        for m in recent:
            label = "Kullanıcı" if m.role == "user" else "KariyerAI"
            # Çok uzun mesajları kısalt
            body = m.content if len(m.content) < 800 else m.content[:800] + "…"
            lines.append(f"{label}: {body}")
        return "\n".join(lines)

    def to_list(self) -> List[dict]:
        return [m.to_dict() for m in self.messages]

    @classmethod
    def from_list(cls, data: List[dict], max_messages: int = 40) -> "ConversationMemory":
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
    """
    Ollama LLM sarmalayıcısı + RAG ile analiz fonksiyonları.
    """

    def __init__(
        self,
        model: str = DEFAULT_MODEL,
        ollama_host: str = "http://localhost:11434",
        temperature: float = 0.4,
        rag: Optional[RAGEngine] = None,
    ):
        self.model = model
        self.ollama_host = ollama_host.rstrip("/")
        self.temperature = temperature
        self.rag = rag or RAGEngine(ollama_host=ollama_host)
        self.memory = ConversationMemory()
        self._client = None

        # Oturumda tutulan tam metinler (RAG chunk'larından bağımsız özet/prompt için)
        self.cv_text: str = ""
        self.job_text: str = ""
        self.cv_summary: str = ""
        self.job_summary: str = ""

    # ------------------------------------------------------------------
    # Ollama bağlantısı
    # ------------------------------------------------------------------
    def _get_client(self):
        if self._client is None:
            try:
                import ollama
            except ImportError as e:
                raise ImportError(
                    "ollama paketi yok. Kurulum: pip install ollama"
                ) from e
            self._client = ollama.Client(host=self.ollama_host)
        return self._client

    def check_connection(self) -> dict:
        """
        Ollama erişilebilir mi, model yüklü mü kontrol eder.
        Returns: {"ok": bool, "message": str, "models": list}
        """
        try:
            client = self._get_client()
            listing = client.list()
            # ollama lib sürümüne göre dict veya object
            raw_models = []
            if isinstance(listing, dict):
                raw_models = listing.get("models") or []
            else:
                raw_models = getattr(listing, "models", []) or []

            names = []
            for m in raw_models:
                if isinstance(m, dict):
                    names.append(m.get("name") or m.get("model") or "")
                else:
                    names.append(getattr(m, "model", None) or getattr(m, "name", "") or "")

            names = [n for n in names if n]
            model_ok = any(
                self.model == n or self.model in n or n.startswith(self.model.split(":")[0])
                for n in names
            )
            if not names:
                return {
                    "ok": False,
                    "message": "Ollama çalışıyor ama hiç model yok. "
                    f"Şunu çalıştırın: ollama pull {self.model}",
                    "models": [],
                }
            if not model_ok:
                return {
                    "ok": False,
                    "message": (
                        f"Seçili model '{self.model}' bulunamadı. "
                        f"Yüklü modeller: {', '.join(names)}. "
                        f"İndirmek için: ollama pull {self.model}"
                    ),
                    "models": names,
                }
            return {
                "ok": True,
                "message": f"Bağlantı OK — model: {self.model}",
                "models": names,
            }
        except Exception as e:
            return {
                "ok": False,
                "message": (
                    "Ollama'ya bağlanılamadı. Ollama uygulamasının açık olduğundan emin olun.\n"
                    f"Host: {self.ollama_host}\nHata: {e}"
                ),
                "models": [],
            }

    def list_local_models(self) -> List[str]:
        info = self.check_connection()
        return info.get("models") or []

    # ------------------------------------------------------------------
    # Belge bağlamı
    # ------------------------------------------------------------------
    def set_cv_text(self, text: str) -> None:
        self.cv_text = text or ""
        self.cv_summary = self._short_local_summary(self.cv_text, label="CV")

    def set_job_text(self, text: str) -> None:
        self.job_text = text or ""
        self.job_summary = self._short_local_summary(self.job_text, label="İş ilanı")

    def _short_local_summary(self, text: str, label: str = "", max_len: int = 600) -> str:
        """LLM çağırmadan kaba özet (hızlı UI)."""
        if not text:
            return f"({label} yok)" if label else "(yok)"
        t = " ".join(text.split())
        if len(t) <= max_len:
            return t
        return t[:max_len] + "…"

    def _truncate(self, text: str, max_chars: int = 12000) -> str:
        if not text:
            return ""
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "\n\n[... metin uzun olduğu için kısaltıldı ...]"

    # ------------------------------------------------------------------
    # Temel generate
    # ------------------------------------------------------------------
    def generate(
        self,
        prompt: str,
        system: str = SYSTEM_PROMPT,
        temperature: Optional[float] = None,
    ) -> str:
        """Tek seferlik (stateless) tamamla."""
        client = self._get_client()
        temp = self.temperature if temperature is None else temperature
        try:
            resp = client.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                options={
                    "temperature": temp,
                    "num_ctx": 8192,
                },
            )
        except Exception as e:
            raise RuntimeError(
                f"LLM yanıt üretemedi. Model: {self.model}. Hata: {e}"
            ) from e

        return self._extract_content(resp)

    def generate_stream(
        self,
        prompt: str,
        system: str = SYSTEM_PROMPT,
        temperature: Optional[float] = None,
    ) -> Generator[str, None, None]:
        """Streaming token üretici (Streamlit için)."""
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
                options={
                    "temperature": temp,
                    "num_ctx": 8192,
                },
            )
            for chunk in stream:
                content = self._extract_stream_delta(chunk)
                if content:
                    yield content
        except Exception as e:
            yield f"\n\n⚠️ Hata: {e}"

    def chat(
        self,
        user_message: str,
        use_rag: bool = True,
        top_k: int = 6,
    ) -> str:
        """Hafızalı sohbet (non-stream)."""
        context = ""
        if use_rag:
            context = self.rag.build_context(user_message, top_k=top_k)

        prompt = build_prompt(
            CHAT_PROMPT,
            question=user_message,
            chat_history=self.memory.history_text(),
            context=context,
            cv_summary=self.cv_summary,
            job_summary=self.job_summary,
        )

        self.memory.add("user", user_message)
        answer = self.generate(prompt)
        self.memory.add("assistant", answer)
        return answer

    def chat_stream(
        self,
        user_message: str,
        use_rag: bool = True,
        top_k: int = 6,
    ) -> Generator[str, None, None]:
        """Hafızalı sohbet (stream). Bitince memory'ye yazar."""
        context = ""
        if use_rag:
            context = self.rag.build_context(user_message, top_k=top_k)

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

    # ------------------------------------------------------------------
    # Analiz modları
    # ------------------------------------------------------------------
    def _analysis_context(self, query: str) -> str:
        return self.rag.build_context(query, top_k=8)

    def career_analysis(self, stream: bool = False):
        query = "kariyer analizi uyum beceriler deneyim"
        ctx = self._analysis_context(query)
        prompt = build_prompt(
            CAREER_ANALYSIS_PROMPT,
            cv_text=self._truncate(self.cv_text),
            job_text=self._truncate(self.job_text),
            context=ctx,
        )
        return self._run(prompt, stream)

    def gap_analysis(self, stream: bool = False):
        query = "eksik beceriler gereksinimler gap teknik soft skill"
        ctx = self._analysis_context(query)
        prompt = build_prompt(
            GAP_ANALYSIS_PROMPT,
            cv_text=self._truncate(self.cv_text),
            job_text=self._truncate(self.job_text),
            context=ctx,
        )
        return self._run(prompt, stream)

    def roadmap(self, extra_notes: str = "", stream: bool = False):
        query = "kariyer yol haritası öğrenme planı hedefler"
        ctx = self._analysis_context(query)
        prompt = build_prompt(
            ROADMAP_PROMPT,
            cv_text=self._truncate(self.cv_text),
            job_text=self._truncate(self.job_text),
            context=ctx,
            extra_notes=extra_notes or "Yok",
        )
        return self._run(prompt, stream)

    def improve_cv(self, stream: bool = False):
        query = "CV iyileştirme anahtar kelimeler deneyim maddeleri"
        ctx = self._analysis_context(query)
        prompt = build_prompt(
            CV_IMPROVE_PROMPT,
            cv_text=self._truncate(self.cv_text),
            job_text=self._truncate(self.job_text),
            context=ctx,
        )
        return self._run(prompt, stream)

    def interview_prep(self, stream: bool = False):
        query = "mülakat soruları STAR teknik davranışsal"
        ctx = self._analysis_context(query)
        prompt = build_prompt(
            INTERVIEW_PREP_PROMPT,
            cv_text=self._truncate(self.cv_text),
            job_text=self._truncate(self.job_text),
            context=ctx,
        )
        return self._run(prompt, stream)

    def summarize(self, text: str) -> str:
        prompt = build_prompt(SUMMARY_PROMPT, text=self._truncate(text, 8000))
        return self.generate(prompt, temperature=0.2)

    def _run(self, prompt: str, stream: bool):
        if stream:
            return self.generate_stream(prompt)
        return self.generate(prompt)

    # ------------------------------------------------------------------
    # Yanıt parse yardımcıları
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_content(resp: Any) -> str:
        if resp is None:
            return ""
        if isinstance(resp, dict):
            msg = resp.get("message") or {}
            if isinstance(msg, dict):
                return (msg.get("content") or "").strip()
            return (getattr(msg, "content", None) or "").strip()
        # object
        msg = getattr(resp, "message", None)
        if msg is not None:
            return (getattr(msg, "content", None) or "").strip()
        return str(resp).strip()

    @staticmethod
    def _extract_stream_delta(chunk: Any) -> str:
        if chunk is None:
            return ""
        if isinstance(chunk, dict):
            msg = chunk.get("message") or {}
            if isinstance(msg, dict):
                return msg.get("content") or ""
            return getattr(msg, "content", None) or ""
        msg = getattr(chunk, "message", None)
        if msg is not None:
            return getattr(msg, "content", None) or ""
        return ""

    # ------------------------------------------------------------------
    # Memory export
    # ------------------------------------------------------------------
    def export_memory_json(self) -> str:
        return json.dumps(self.memory.to_list(), ensure_ascii=False, indent=2)

    def clear_memory(self) -> None:
        self.memory.clear()
