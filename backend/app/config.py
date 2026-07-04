import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./marketpulse.db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    GEMINI_API_KEY: Optional[str] = None
    JWT_SECRET_KEY: str = "super_secret_marketpulse_key_for_demo_purposes_12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        extra = "ignore"

settings = Settings()
