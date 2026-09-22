from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    database_name: str = "passive_income"
    secret_key: str = "passive-income-super-secret-key-change-in-prod-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    emergent_llm_key: str = ""
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
