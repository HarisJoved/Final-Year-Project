from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://mongodb:27017"
    database_name: str = "handwriting_ocr"
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    class Config:
        env_file = ".env"


settings = Settings()
