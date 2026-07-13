"""
KariyerAI - RAG Motoru
ChromaDB + Ollama nomic-embed-text ile vektör depolama ve anlamsal arama.
Tamamen yerel; API key gerekmez.
"""

from __future__ import annotations

import hashlib
import shutil
from pathlib import Path
from typing import List, Optional, Sequence

import chromadb
from chromadb.config import Settings

from document_processor import DocumentChunk, ProcessedDocument


# Varsayılan kalıcı depo (proje klasöründe)
DEFAULT_PERSIST_DIR = Path(__file__).resolve().parent / "data" / "chroma_db"
COLLECTION_NAME = "kariyerai_docs"
EMBED_MODEL = "nomic-embed-text"


class RAGEngine:
    """
    ChromaDB tabanlı RAG motoru.

    - Embedding: Ollama üzerinden nomic-embed-text
    - Depolama: disk üzerinde kalıcı Chroma koleksiyonu
    - Kaynaklar: cv / job etiketli chunk'lar
    """

    def __init__(
        self,
        persist_dir: Optional[Path] = None,
        collection_name: str = COLLECTION_NAME,
        embed_model: str = EMBED_MODEL,
        ollama_host: str = "http://localhost:11434",
    ):
        self.persist_dir = Path(persist_dir) if persist_dir else DEFAULT_PERSIST_DIR
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self.collection_name = collection_name
        self.embed_model = embed_model
        self.ollama_host = ollama_host.rstrip("/")

        # Chroma kalıcı istemci
        self._client = chromadb.PersistentClient(
            path=str(self.persist_dir),
            settings=Settings(anonymized_telemetry=False, allow_reset=True),
        )

        # Koleksiyon: embedding fonksiyonu harici (biz üretiyoruz)
        self._collection = self._client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine", "app": "Pathora"},
        )

        # Ollama istemcisi (lazy import hatalarını net mesajla ver)
        self._ollama = None

    # ------------------------------------------------------------------
    # Ollama embedding
    # ------------------------------------------------------------------
    def _get_ollama(self):
        if self._ollama is None:
            try:
                import ollama
            except ImportError as e:
                raise ImportError(
                    "ollama paketi yüklü değil. Şunu çalıştırın: pip install ollama"
                ) from e
            self._ollama = ollama.Client(host=self.ollama_host)
        return self._ollama

    def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        """Bir veya daha fazla metni embedding vektörüne çevirir."""
        client = self._get_ollama()
        vectors: List[List[float]] = []
        for t in texts:
            # Boş metin için sıfır vektör üretme; atla veya hata
            clean = (t or "").strip()
            if not clean:
                raise ValueError("Boş metin embed edilemez.")
            try:
                resp = client.embeddings(model=self.embed_model, prompt=clean)
            except Exception as e:
                raise RuntimeError(
                    f"Embedding başarısız. Ollama çalışıyor mu ve "
                    f"'{self.embed_model}' modeli yüklü mü?\n"
                    f"  ollama pull {self.embed_model}\n"
                    f"Hata: {e}"
                ) from e
            # ollama python API: resp["embedding"] veya resp.embedding
            emb = resp["embedding"] if isinstance(resp, dict) else resp.embedding
            vectors.append(list(emb))
        return vectors

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]

    # ------------------------------------------------------------------
    # ID üretimi
    # ------------------------------------------------------------------
    @staticmethod
    def _make_id(source: str, chunk_index: int, content: str) -> str:
        h = hashlib.sha256(content.encode("utf-8")).hexdigest()[:12]
        return f"{source}_{chunk_index}_{h}"

    # ------------------------------------------------------------------
    # Ekleme / silme
    # ------------------------------------------------------------------
    def add_document(self, doc: ProcessedDocument, replace_source: bool = True) -> int:
        """
        ProcessedDocument chunk'larını vektör DB'ye ekler.
        replace_source=True ise aynı source_type (cv/job) eski kayıtları silinir.
        Returns: eklenen chunk sayısı
        """
        if replace_source:
            self.delete_by_source(doc.source_type)

        if not doc.chunks:
            return 0

        ids: List[str] = []
        documents: List[str] = []
        metadatas: List[dict] = []

        for ch in doc.chunks:
            ids.append(self._make_id(ch.source, ch.chunk_index, ch.content))
            documents.append(ch.content)
            metadatas.append(
                {
                    "source": ch.source,
                    "chunk_index": ch.chunk_index,
                    "file_name": ch.metadata.get("file_name", doc.file_name),
                    "char_len": len(ch.content),
                }
            )

        embeddings = self.embed_texts(documents)

        # Chroma batch limit'e dikkat — pratikte CV/ilan küçük
        self._collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return len(ids)

    def add_chunks(self, chunks: List[DocumentChunk], replace_source: Optional[str] = None) -> int:
        """Ham chunk listesi ekler. replace_source verilirse o kaynak silinir."""
        if replace_source:
            self.delete_by_source(replace_source)
        if not chunks:
            return 0

        ids, documents, metadatas = [], [], []
        for ch in chunks:
            ids.append(self._make_id(ch.source, ch.chunk_index, ch.content))
            documents.append(ch.content)
            metadatas.append(
                {
                    "source": ch.source,
                    "chunk_index": ch.chunk_index,
                    "file_name": ch.metadata.get("file_name", ""),
                    "char_len": len(ch.content),
                }
            )

        embeddings = self.embed_texts(documents)
        self._collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return len(ids)

    def delete_by_source(self, source: str) -> None:
        """source == 'cv' veya 'job' olan tüm kayıtları siler."""
        try:
            existing = self._collection.get(where={"source": source})
            ids = existing.get("ids") or []
            if ids:
                self._collection.delete(ids=ids)
        except Exception:
            # Koleksiyon boş veya filtre hatası — sessiz geç
            pass

    def clear_all(self) -> None:
        """Koleksiyonu tamamen sıfırlar."""
        try:
            self._client.delete_collection(self.collection_name)
        except Exception:
            pass
        self._collection = self._client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine", "app": "Pathora"},
        )

    def reset_disk(self) -> None:
        """Disk klasörünü silip yeniden oluşturur (sert reset)."""
        try:
            self._client.reset()
        except Exception:
            pass
        if self.persist_dir.exists():
            shutil.rmtree(self.persist_dir, ignore_errors=True)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(
            path=str(self.persist_dir),
            settings=Settings(anonymized_telemetry=False, allow_reset=True),
        )
        self._collection = self._client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine", "app": "Pathora"},
        )

    # ------------------------------------------------------------------
    # Arama
    # ------------------------------------------------------------------
    def search(
        self,
        query: str,
        top_k: int = 6,
        source_filter: Optional[str] = None,
    ) -> List[dict]:
        """
        Anlamsal arama.

        Returns:
            [{"content": str, "source": str, "distance": float, "metadata": dict}, ...]
        """
        count = self._collection.count()
        if count == 0:
            return []

        k = min(top_k, count)
        query_emb = self.embed_query(query)

        where = {"source": source_filter} if source_filter else None
        kwargs = {
            "query_embeddings": [query_emb],
            "n_results": k,
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            kwargs["where"] = where

        results = self._collection.query(**kwargs)

        hits: List[dict] = []
        docs = (results.get("documents") or [[]])[0]
        metas = (results.get("metadatas") or [[]])[0]
        dists = (results.get("distances") or [[]])[0]

        for doc, meta, dist in zip(docs, metas, dists):
            meta = meta or {}
            hits.append(
                {
                    "content": doc or "",
                    "source": meta.get("source", "unknown"),
                    "distance": float(dist) if dist is not None else 1.0,
                    "metadata": meta,
                }
            )
        return hits

    def build_context(
        self,
        query: str,
        top_k: int = 6,
        source_filter: Optional[str] = None,
        max_chars: int = 6000,
    ) -> str:
        """
        LLM prompt'una eklenecek birleştirilmiş bağlam metni.
        Kaynak etiketleri ile okunabilir format.
        """
        hits = self.search(query, top_k=top_k, source_filter=source_filter)
        if not hits:
            return "(Henüz indekslenmiş belge yok veya eşleşme bulunamadı.)"

        parts: List[str] = []
        total = 0
        for i, h in enumerate(hits, 1):
            label = "CV" if h["source"] == "cv" else (
                "İŞ İLANI" if h["source"] == "job" else h["source"].upper()
            )
            block = f"[Parça {i} | {label}]\n{h['content'].strip()}\n"
            if total + len(block) > max_chars:
                break
            parts.append(block)
            total += len(block)

        return "\n".join(parts) if parts else "(Bağlam boş.)"

    def get_stats(self) -> dict:
        """Koleksiyon istatistikleri."""
        count = self._collection.count()
        cv_n, job_n = 0, 0
        if count > 0:
            try:
                all_meta = self._collection.get(include=["metadatas"])
                for m in all_meta.get("metadatas") or []:
                    if not m:
                        continue
                    if m.get("source") == "cv":
                        cv_n += 1
                    elif m.get("source") == "job":
                        job_n += 1
            except Exception:
                pass
        return {
            "total_chunks": count,
            "cv_chunks": cv_n,
            "job_chunks": job_n,
            "persist_dir": str(self.persist_dir),
            "embed_model": self.embed_model,
        }

    def has_source(self, source: str) -> bool:
        """Belirli bir kaynak tipi yüklü mü?"""
        try:
            res = self._collection.get(where={"source": source}, limit=1)
            return bool(res.get("ids"))
        except Exception:
            return False
