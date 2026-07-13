"""Pathora — merkezi ayarlar (ücretsiz / yerel)."""

from pathlib import Path

APP_NAME = "Pathora"
APP_TAGLINE = "Local AI career intelligence · no API key"

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
SESSION_PATH = DATA_DIR / "last_session.json"

DEFAULT_MODEL = "llama3.1:8b"
EMBED_MODEL = "nomic-embed-text"
OLLAMA_HOST = "http://localhost:11434"

# Tercih sırası: önce bunlar denenir
MODEL_PREFERENCE = (
    "llama3.1:8b",
    "llama3.2",
    "qwen2.5:14b",
    "qwen2.5:7b",
    "mistral",
    "gemma2:9b",
    "phi3",
)

MAX_DOC_CHARS = 7000
MAX_CTX_CHARS = 3500
DEFAULT_TEMPERATURE = 0.35
DEFAULT_TOP_K = 5
