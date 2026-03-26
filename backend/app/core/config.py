import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from workspace root (two levels up from backend/app/core/)
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))


class Settings(BaseSettings):
    database_url: str
    gemini_api_key: str = ""
    frontend_url: str = "http://localhost:5173"
    redis_url: str = "redis://localhost:6379"

    model_config = {"env_file": "../../../.env", "env_file_encoding": "utf-8"}


settings = Settings()