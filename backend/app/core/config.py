from pathlib import Path

from pydantic_settings import BaseSettings

# The .env lives at the repo root, three levels above backend/app/core/.
# Resolved absolutely so settings load the same way regardless of the
# working directory uvicorn, pytest or alembic happen to start from.
ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    database_url: str
    gemini_api_key: str = ""
    frontend_url: str = "http://localhost:5173"
    # 127.0.0.1, not localhost: on Windows "localhost" resolves to ::1 first,
    # and a Docker-published port does not answer over IPv6 — the connection
    # hangs until it times out rather than being refused, so the cache probe
    # stalls startup and then reports Redis as unavailable while it is running.
    redis_url: str = "redis://127.0.0.1:6379"

    model_config = {
        "env_file": ENV_FILE,
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
