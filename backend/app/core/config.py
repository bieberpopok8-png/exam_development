from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./exam_grader.db"
    OLLAMA_URL: str = "http://localhost:11434/api/chat"
    OLLAMA_VISION_MODEL: str = "qwen3-vl:4b-instruct"
    OLLAMA_TEXT_MODEL: str = "qwen3-vl:4b-instruct"  # <-- SAME MODEL!
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8-sig"
        extra = "ignore"

settings = Settings()