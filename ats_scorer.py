"""
KariyerAI — Yerel ATS skoru (LLM yok, anında, ücretsiz).

Yöntem:
- İlan metninden anahtar kelime / skill çıkarımı (heuristic)
- CV'de geçme oranı + format sinyalleri
- 0-100 skor + kaçılabilir detay
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple


# Yaygın skill / teknoloji sözlüğü (TR+EN) — genişletilebilir
KNOWN_SKILLS: Tuple[str, ...] = (
    "python", "java", "javascript", "typescript", "react", "vue", "angular",
    "node", "nodejs", "django", "flask", "fastapi", "spring", "sql", "postgresql",
    "mysql", "mongodb", "redis", "docker", "kubernetes", "k8s", "aws", "azure",
    "gcp", "git", "linux", "ci/cd", "jenkins", "github actions", "terraform",
    "html", "css", "tailwind", "next.js", "nextjs", "graphql", "rest", "api",
    "machine learning", "deep learning", "nlp", "pytorch", "tensorflow",
    "pandas", "numpy", "spark", "kafka", "elasticsearch", "scrum", "agile",
    "jira", "figma", "excel", "power bi", "tableau", "c#", "c++", ".net",
    "go", "golang", "rust", "php", "laravel", "kotlin", "swift", "android",
    "ios", "selenium", "pytest", "unittest", "microservices", "oop",
    "veri analizi", "proje yönetimi", "iletişim", "liderlik", "sunum",
    "müşteri ilişkileri", "satış", "pazarlama", "seo", "crm", "erp",
    "english", "ingilizce", "almanca", "devops", "sre", "security",
    "llm", "rag", "langchain", "chromadb", "streamlit", "ollama",
)

# CV yapı sinyalleri
SECTION_PATTERNS = {
    "deneyim": r"\b(experience|deneyim|iş deneyimi|work history|professional experience)\b",
    "egitim": r"\b(education|eğitim|öğrenim|university|üniversite)\b",
    "beceri": r"\b(skills|yetenek|beceri|teknolojiler|competencies)\b",
    "iletisim": r"(\+?\d[\d\s\-()]{8,}|\b[\w.+-]+@[\w.-]+\.\w{2,}\b)",
}


@dataclass
class ATSResult:
    score: int
    keyword_score: int
    format_score: int
    coverage: float
    matched: List[str] = field(default_factory=list)
    missing: List[str] = field(default_factory=list)
    format_notes: List[str] = field(default_factory=list)
    summary: str = ""

    def to_dict(self) -> dict:
        return {
            "score": self.score,
            "keyword_score": self.keyword_score,
            "format_score": self.format_score,
            "coverage": self.coverage,
            "matched": self.matched,
            "missing": self.missing,
            "format_notes": self.format_notes,
            "summary": self.summary,
        }


def _normalize(text: str) -> str:
    t = (text or "").lower()
    t = t.replace("ı", "i").replace("İ", "i")
    return t


def extract_keywords_from_job(job_text: str, max_keywords: int = 40) -> List[str]:
    """İlan + bilinen skill listesinden anahtar kelime çıkar."""
    text = _normalize(job_text)
    found: List[str] = []
    seen: Set[str] = set()

    # Bilinen skill'ler
    for sk in KNOWN_SKILLS:
        if sk in text and sk not in seen:
            seen.add(sk)
            found.append(sk)

    # Büyük harfle yazılmış / teknik token'lar (orijinal metinden)
    for m in re.findall(r"\b[A-Za-z][A-Za-z0-9+#.]{1,24}\b", job_text or ""):
        low = m.lower()
        if len(low) < 2 or low in seen:
            continue
        # Çok genel kelimeleri at
        if low in {"and", "the", "with", "for", "you", "our", "will", "this", "that",
                   "ile", "ve", "bir", "için", "olan", "gibi", "daha", "çok"}:
            continue
        if low in {s.lower() for s in KNOWN_SKILLS} or (m.isupper() and len(m) >= 2):
            if low not in seen:
                seen.add(low)
                found.append(low)

    return found[:max_keywords]


def score_format(cv_text: str) -> Tuple[int, List[str]]:
    """Format / parse edilebilirlik sinyalleri (0-30)."""
    notes: List[str] = []
    score = 0
    raw = cv_text or ""
    low = _normalize(raw)

    if len(raw) >= 400:
        score += 6
    else:
        notes.append("CV çok kısa görünüyor; içerik zayıf olabilir.")

    if len(raw) <= 12000:
        score += 4
    else:
        notes.append("CV aşırı uzun; ATS ve okuyucu için sadeleştirin.")

    # E-posta / telefon
    if re.search(SECTION_PATTERNS["iletisim"], raw, re.I):
        score += 6
    else:
        notes.append("İletişim bilgisi (e-posta/telefon) zayıf veya yok.")

    for key, pat in SECTION_PATTERNS.items():
        if key == "iletisim":
            continue
        if re.search(pat, low, re.I):
            score += 4
        else:
            labels = {"deneyim": "Deneyim", "egitim": "Eğitim", "beceri": "Beceriler"}
            notes.append(f"'{labels.get(key, key)}' bölümü net değil.")

    # Madde işareti / satır yapısı
    if re.search(r"(^|\n)\s*[-•*]\s+\S", raw):
        score += 4
    else:
        notes.append("Madde işaretli deneyim satırları az; ATS/okunabilirlik için ekleyin.")

    # Tablo/çok kolonlu bozucu karakterler (basit)
    if raw.count("|") > 30 or raw.count("\t") > 40:
        score = max(0, score - 4)
        notes.append("Tablo/çok kolon izi var; düz metin ATS için daha güvenli.")

    return min(30, score), notes


def compute_ats(cv_text: str, job_text: str) -> ATSResult:
    """
    Toplam skor:
    - Anahtar kelime kapsamı: 0-70
    - Format: 0-30
    """
    keywords = extract_keywords_from_job(job_text)
    cv_low = _normalize(cv_text)

    matched: List[str] = []
    missing: List[str] = []
    for kw in keywords:
        if kw in cv_low:
            matched.append(kw)
        else:
            missing.append(kw)

    if keywords:
        coverage = len(matched) / len(keywords)
    else:
        coverage = 0.5  # ilan zayıfsa nötr

    keyword_score = int(round(coverage * 70))
    format_score, format_notes = score_format(cv_text)
    total = max(0, min(100, keyword_score + format_score))

    summary = (
        f"Kapsam %{int(coverage * 100)} ({len(matched)}/{len(keywords) or 0} kelime) · "
        f"Format {format_score}/30"
    )

    return ATSResult(
        score=total,
        keyword_score=keyword_score,
        format_score=format_score,
        coverage=round(coverage, 3),
        matched=matched[:25],
        missing=missing[:25],
        format_notes=format_notes,
        summary=summary,
    )


def score_label(score: int) -> str:
    if score >= 80:
        return "Güçlü uyum"
    if score >= 65:
        return "İyi — iyileştirilebilir"
    if score >= 45:
        return "Orta — kritik gap var"
    return "Düşük — ciddi revizyon"
