"""
KariyerAI - Belge İşleme Modülü
PDF (ve düz metin) dosyalarından metin çıkarır, temizler ve chunk'lara böler.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Union

import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ---------------------------------------------------------------------------
# Veri yapıları
# ---------------------------------------------------------------------------
@dataclass
class DocumentChunk:
    """Tek bir metin parçası + metadata."""

    content: str
    source: str  # "cv" | "job" | dosya adı
    chunk_index: int
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "content": self.content,
            "source": self.source,
            "chunk_index": self.chunk_index,
            **self.metadata,
        }


@dataclass
class ProcessedDocument:
    """İşlenmiş tam belge."""

    raw_text: str
    cleaned_text: str
    chunks: List[DocumentChunk]
    source_type: str  # "cv" | "job"
    file_name: str
    page_count: int = 0
    char_count: int = 0


# ---------------------------------------------------------------------------
# PDF okuma
# ---------------------------------------------------------------------------
def extract_text_from_pdf(file_path: Union[str, Path]) -> tuple[str, int]:
    """
    PyMuPDF ile PDF'den düz metin çıkarır.

    Returns:
        (tüm_metin, sayfa_sayısı)
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF bulunamadı: {path}")
    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Sadece PDF desteklenir, gelen: {path.suffix}")

    parts: List[str] = []
    page_count = 0

    with fitz.open(path) as doc:
        page_count = doc.page_count
        for page in doc:
            text = page.get_text("text") or ""
            if text.strip():
                parts.append(text)

    full_text = "\n\n".join(parts)
    return full_text, page_count


def extract_text_from_pdf_bytes(data: bytes, file_name: str = "upload.pdf") -> tuple[str, int]:
    """
    Streamlit dosya yüklemesinden gelen baytlardan metin çıkarır.
    Diske yazmadan çalışır.
    """
    parts: List[str] = []
    page_count = 0

    with fitz.open(stream=data, filetype="pdf") as doc:
        page_count = doc.page_count
        for page in doc:
            text = page.get_text("text") or ""
            if text.strip():
                parts.append(text)

    full_text = "\n\n".join(parts)
    return full_text, page_count


def extract_text_from_txt(file_path: Union[str, Path], encoding: str = "utf-8") -> str:
    """Düz metin dosyası okur."""
    path = Path(file_path)
    return path.read_text(encoding=encoding, errors="replace")


# ---------------------------------------------------------------------------
# Metin temizleme
# ---------------------------------------------------------------------------
def clean_text(text: str) -> str:
    """
    OCR/PDF artefaktlarını azaltır, boşlukları normalize eder.
    Anlamı bozmadan okunabilir metin üretir.
    """
    if not text:
        return ""

    # Null ve kontrol karakterleri
    text = text.replace("\x00", " ")
    text = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f]", " ", text)

    # Windows satır sonları
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Tire ile satır bölünmesi (kelime- \n devami → kelime-devami değil; genelde birleştir)
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

    # 3+ boş satırı 2'ye indir
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Satır içi fazla boşluk
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Satır başı/sonu boşluk
    lines = [ln.strip() for ln in text.split("\n")]
    text = "\n".join(lines)

    return text.strip()


# ---------------------------------------------------------------------------
# Chunking (RAG için parçalama)
# ---------------------------------------------------------------------------
def split_into_chunks(
    text: str,
    source: str,
    chunk_size: int = 800,
    chunk_overlap: int = 150,
    file_name: str = "",
) -> List[DocumentChunk]:
    """
    RecursiveCharacterTextSplitter ile anlamsal parçalara böler.
    Türkçe / genel metin için paragraf ve cümle ayırıcıları öncelikli.
    """
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
    )

    pieces = splitter.split_text(text)
    chunks: List[DocumentChunk] = []

    for i, piece in enumerate(pieces):
        piece = piece.strip()
        if len(piece) < 20:  # çok kısa gürültüyü atla
            continue
        chunks.append(
            DocumentChunk(
                content=piece,
                source=source,
                chunk_index=i,
                metadata={
                    "file_name": file_name,
                    "char_len": len(piece),
                },
            )
        )

    return chunks


# ---------------------------------------------------------------------------
# Yüksek seviye API
# ---------------------------------------------------------------------------
def process_pdf_bytes(
    data: bytes,
    source_type: str,
    file_name: str = "document.pdf",
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> ProcessedDocument:
    """
    Streamlit upload için ana giriş noktası.
    source_type: "cv" veya "job"
    """
    if source_type not in ("cv", "job"):
        raise ValueError("source_type 'cv' veya 'job' olmalı")

    raw, pages = extract_text_from_pdf_bytes(data, file_name)
    cleaned = clean_text(raw)

    if not cleaned:
        raise ValueError(
            f"'{file_name}' dosyasından metin çıkarılamadı. "
            "Taranmış (görüntü) PDF olabilir; metin tabanlı PDF yükleyin."
        )

    chunks = split_into_chunks(
        cleaned,
        source=source_type,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        file_name=file_name,
    )

    return ProcessedDocument(
        raw_text=raw,
        cleaned_text=cleaned,
        chunks=chunks,
        source_type=source_type,
        file_name=file_name,
        page_count=pages,
        char_count=len(cleaned),
    )


def process_upload_bytes(
    data: bytes,
    file_name: str,
    source_type: str,
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> ProcessedDocument:
    """
    PDF / TXT / MD yüklemesini tek yerden işler (Streamlit uploader).
    """
    ext = Path(file_name or "").suffix.lower()
    if ext == ".pdf":
        return process_pdf_bytes(
            data,
            source_type=source_type,
            file_name=file_name,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
    if ext in (".txt", ".md", ".markdown", ".text", ""):
        text = data.decode("utf-8", errors="replace")
        return process_plain_text(
            text,
            source_type=source_type,
            file_name=file_name or "upload.txt",
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
    raise ValueError(
        f"Desteklenmeyen dosya: {ext or '(uzantısız)'}. PDF, TXT veya MD yükleyin."
    )


def process_plain_text(
    text: str,
    source_type: str,
    file_name: str = "pasted.txt",
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> ProcessedDocument:
    """Kullanıcı metin kutusundan yapıştırdığında kullanılır."""
    if source_type not in ("cv", "job"):
        raise ValueError("source_type 'cv' veya 'job' olmalı")

    cleaned = clean_text(text)
    if not cleaned:
        raise ValueError("Boş metin işlenemez.")

    chunks = split_into_chunks(
        cleaned,
        source=source_type,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        file_name=file_name,
    )

    return ProcessedDocument(
        raw_text=text,
        cleaned_text=cleaned,
        chunks=chunks,
        source_type=source_type,
        file_name=file_name,
        page_count=1,
        char_count=len(cleaned),
    )


def preview_text(text: str, max_chars: int = 500) -> str:
    """UI'da kısa önizleme."""
    if not text:
        return "(boş)"
    text = text.strip()
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + "…"


def get_document_stats(doc: ProcessedDocument) -> dict:
    """Sidebar / debug için istatistikler."""
    return {
        "file_name": doc.file_name,
        "source_type": doc.source_type,
        "pages": doc.page_count,
        "characters": doc.char_count,
        "words_approx": len(doc.cleaned_text.split()),
        "chunks": len(doc.chunks),
    }
