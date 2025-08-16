from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017/handwriting_ocr_db"
    jwt_secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
