"""
Runtime-safe configuration loader.

Uses config.py when available (for local development), and falls back to
environment variables/defaults in deployment environments where config.py
is intentionally excluded.
"""

import os

try:
    import config as _user_config
except Exception:
    _user_config = None


def _cfg(name: str, default):
    if _user_config is not None and hasattr(_user_config, name):
        return getattr(_user_config, name)
    return os.getenv(name, default)


def _cfg_int(name: str, default: int) -> int:
    value = _cfg(name, default)
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _cfg_float(name: str, default: float) -> float:
    value = _cfg(name, default)
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


# Directory settings
PDF_DIRECTORY = _cfg("PDF_DIRECTORY", "data")
VECTORSTORE_DIRECTORY = _cfg("VECTORSTORE_DIRECTORY", "data/vectorstore")

# Document processing settings
CHUNK_SIZE = _cfg_int("CHUNK_SIZE", 1000)
CHUNK_OVERLAP = _cfg_int("CHUNK_OVERLAP", 200)

# Retrieval settings
NUM_RETRIEVED_DOCS = _cfg_int("NUM_RETRIEVED_DOCS", 4)

# Model settings
EMBEDDING_MODEL = _cfg("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# Groq LLM settings
GROQ_API_KEY = _cfg("GROQ_API_KEY", "")
GROQ_MODEL = _cfg("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_TEMPERATURE = _cfg_float("GROQ_TEMPERATURE", 0.7)
GROQ_MAX_TOKENS = _cfg_int("GROQ_MAX_TOKENS", 1024)

# Chat settings
MAX_HISTORY_LENGTH = _cfg_int("MAX_HISTORY_LENGTH", 10)

# UI settings
APP_TITLE = _cfg("APP_TITLE", "Mental Health & Well-being AI Companion")
APP_ICON = _cfg("APP_ICON", "AI")
WELCOME_MESSAGE = _cfg(
    "WELCOME_MESSAGE",
    "Welcome to your AI Mental Health Companion."
)
