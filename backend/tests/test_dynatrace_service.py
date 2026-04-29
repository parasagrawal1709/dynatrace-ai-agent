"""
Tests for services/dynatrace_service.py (demo mode)
"""

import pytest
import asyncio
from datetime import datetime, timezone

from services.dynatrace_service import DynatraceService, dynatrace_service


@pytest.fixture
def svc():
    """Fresh DynatraceService instance (demo mode forced by conftest env)."""
    return DynatraceService()


class TestDemoLogs:
    def test_returns_log_entries(self, svc):
        logs = asyncio.get_event_loop().run_until_complete(svc.get_logs())
        assert len(logs) > 0

    def test_log_fields_populated(self, svc):
        logs = asyncio.get_event_loop().run_until_complete(svc.get_logs(limit=5))
        for log in logs:
            assert log.id
            assert log.timestamp
            assert log.level   in ("ERROR", "WARN", "INFO", "DEBUG", "CRITICAL")
            assert log.service
            assert log.message

    def test_limit_respected(self, svc):
        logs = asyncio.get_event_loop().run_until_complete(svc.get_logs(limit=10))
        assert len(logs) <= 10

    def test_timestamps_are_recent(self, svc):
        from datetime import timedelta
        logs = asyncio.get_event_loop().run_until_complete(svc.get_logs())
        now = datetime.now(timezone.utc)
        for log in logs:
            diff = now - log.timestamp
            # All logs should be within the last 10 minutes
            assert diff.total_seconds() < 600, f"Log timestamp too old: {log.timestamp}"

    def test_mixed_log_levels(self, svc):
        """Demo logs should include both errors and info-level entries."""
        logs = asyncio.get_event_loop().run_until_complete(svc.get_logs(limit=100))
        levels = {l.level for l in logs}
        # Should have at least 2 different levels across 100 demo logs
        assert len(levels) >= 2


class TestDemoMetrics:
    def test_returns_metrics_for_all_services(self, svc):
        metrics = asyncio.get_event_loop().run_until_complete(svc.get_metrics())
        assert len(metrics) > 0

    def test_metrics_fields_valid(self, svc):
        metrics = asyncio.get_event_loop().run_until_complete(svc.get_metrics())
        for m in metrics:
            assert 0.0 <= m.error_rate      <= 100.0
            assert m.avg_response_ms        >  0
            assert 0.0 <= m.availability    <= 100.0
            assert m.throughput_rpm         >= 0
            assert 0.0 <= (m.cpu_usage or 0)    <= 100.0
            assert 0.0 <= (m.memory_usage or 0) <= 100.0

    def test_service_filter(self, svc):
        metrics = asyncio.get_event_loop().run_until_complete(
            svc.get_metrics(services=["api-gateway"])
        )
        assert len(metrics) == 1
        assert metrics[0].service == "api-gateway"

    def test_metrics_history_present(self, svc):
        metrics = asyncio.get_event_loop().run_until_complete(svc.get_metrics())
        for m in metrics:
            assert "error_rate"  in m.metrics_history
            assert "response_ms" in m.metrics_history
            assert len(m.metrics_history["error_rate"]) > 0


class TestDemoProblems:
    def test_returns_problems(self, svc):
        problems = asyncio.get_event_loop().run_until_complete(svc.get_problems())
        assert isinstance(problems, list)

    def test_problem_fields(self, svc):
        problems = asyncio.get_event_loop().run_until_complete(svc.get_problems())
        for p in problems:
            assert p.problemId
            assert p.title
            assert p.severityLevel
            assert p.status in ("OPEN", "RESOLVED", "CLOSED")

    def test_problems_have_start_time(self, svc):
        problems = asyncio.get_event_loop().run_until_complete(svc.get_problems())
        for p in problems:
            assert p.startTime > 0


class TestDemoEvents:
    def test_returns_events(self, svc):
        events = asyncio.get_event_loop().run_until_complete(svc.get_events())
        assert isinstance(events, list)
        assert len(events) > 0

    def test_event_fields(self, svc):
        events = asyncio.get_event_loop().run_until_complete(svc.get_events())
        for e in events:
            assert "eventId"   in e
            assert "eventType" in e
            assert "title"     in e
