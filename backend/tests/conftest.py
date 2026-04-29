"""
Shared pytest fixtures for the Dynatrace AI Agent backend.
"""

import os
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

# Force demo mode and dummy API key for all tests
os.environ.setdefault("DEMO_MODE",           "true")
os.environ.setdefault("ANTHROPIC_API_KEY",   "sk-ant-test-key")
os.environ.setdefault("APP_ENV",             "test")

from main import app                                # noqa: E402 — must come after env setup
from models.models import LogEntry, ServiceMetrics  # noqa: E402


@pytest.fixture(scope="module")
def client():
    """Synchronous TestClient — works for all non-WebSocket routes."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def sample_log_entry() -> LogEntry:
    return LogEntry(
        id="abc123",
        timestamp=datetime.now(timezone.utc),
        level="ERROR",
        service="payment-service",
        message="NullPointerException at OrderController.java:142",
        host="host-1.internal",
        trace_id="abc123def456",
        span_id="span001",
        attributes={"env": "production"},
    )


@pytest.fixture
def sample_log_batch(sample_log_entry) -> list:
    from models.models import LogEntry
    entries = [sample_log_entry]
    levels = ["INFO", "WARN", "ERROR", "INFO", "INFO", "WARN", "DEBUG", "ERROR"]
    for i, lvl in enumerate(levels):
        entries.append(LogEntry(
            id=f"id-{i}",
            timestamp=datetime.now(timezone.utc),
            level=lvl,
            service=["api-gateway", "auth-service", "db-proxy"][i % 3],
            message=f"Sample {lvl} log message #{i}",
        ))
    return entries


@pytest.fixture
def sample_metrics() -> list:
    from models.models import ServiceMetrics
    return [
        ServiceMetrics(
            service="api-gateway",
            error_rate=2.5,
            avg_response_ms=180.0,
            availability=99.9,
            throughput_rpm=850.0,
            cpu_usage=42.0,
            memory_usage=55.0,
        ),
        ServiceMetrics(
            service="payment-service",
            error_rate=8.0,
            avg_response_ms=3200.0,
            availability=95.0,
            throughput_rpm=120.0,
            cpu_usage=87.0,
            memory_usage=82.0,
        ),
        ServiceMetrics(
            service="auth-service",
            error_rate=0.1,
            avg_response_ms=90.0,
            availability=99.99,
            throughput_rpm=1100.0,
            cpu_usage=28.0,
            memory_usage=40.0,
        ),
    ]
