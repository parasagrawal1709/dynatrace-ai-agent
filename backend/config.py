"""
Central configuration — all values read from environment variables or .env file.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── Anthropic ──────────────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_MAX_TOKENS: int = 4096

    # ── Dynatrace ──────────────────────────────────────────────────────────────
    DT_ENV_URL: str = ""          # e.g. https://xxxxx.live.dynatrace.com
    DT_API_TOKEN: str = ""        # Dynatrace API token
    DT_LOG_ENDPOINT: str = "/api/v2/logs/search"
    DT_METRICS_ENDPOINT: str = "/api/v2/metrics/query"
    DT_PROBLEMS_ENDPOINT: str = "/api/v2/problems"
    DT_EVENTS_ENDPOINT: str = "/api/v2/events"

    # ── Polling ────────────────────────────────────────────────────────────────
    POLL_INTERVAL_SECONDS: int = 30    # How often to fetch new data
    LOG_LOOKBACK_MINUTES: int = 5      # How far back to fetch logs each poll

    # ── App ────────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:80"]

    # ── Health scoring weights ─────────────────────────────────────────────────
    WEIGHT_ERROR_RATE: float = 0.35
    WEIGHT_RESPONSE_TIME: float = 0.25
    WEIGHT_AVAILABILITY: float = 0.30
    WEIGHT_THROUGHPUT: float = 0.10

    # ── Demo / Mock mode (no real Dynatrace needed for local testing) ──────────
    DEMO_MODE: bool = True   # Set False when real Dynatrace env is available

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
