from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str  # Keep uppercase to match .env
    OLLAMA_URL: str = "http://localhost:11434/api/chat"
    OLLAMA_VISION_MODEL: str = "qwen3-vl:4b-instruct"
    OLLAMA_TEXT_MODEL: str = "qwen3:4b"
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra fields

settings = Settings()