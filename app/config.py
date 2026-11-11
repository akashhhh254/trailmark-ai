"""Trailmark configuration module."""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = os.getenv("APP_NAME", "Trailmark")
    PORT: int = int(os.getenv("PORT", "3000"))
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    MAX_FILE_BYTES: int = int(os.getenv("MAX_FILE_BYTES", "5242880"))
    MAX_INPUT_CHARS: int = int(os.getenv("MAX_INPUT_CHARS", "500000"))
    RUNS_PER_HOUR: int = int(os.getenv("RUNS_PER_HOUR", "60"))
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.8-flash")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", os.getenv("GEMINI_API_KEY", ""))

settings = Settings()
