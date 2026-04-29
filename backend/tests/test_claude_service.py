"""
Tests for services/claude_service.py — only the non-API parts
(formatting helpers, quick_anomaly_check, fallback_analysis).
Actual Claude API calls are not exercised in unit tests.
"""

import pytest
import asyncio
from datetime import datetime, timezone

from services.claude_service import ClaudeService
from models.models import LogEntry, ServiceMetrics


@pytest.fixture
def svc():
    return ClaudeService()


def _make_log(level="INFO", message="test message", service="test-svc"):
    return LogEntry(
        id="x",
        timestamp=datetime.now(timezone.utc),
        level=level,
        service=service,
        message=message,
    )


class TestFormatLogs:
    def test_basic_format(self, svc):
        logs = [_make_log("ERROR", "Something failed", "api-gateway")]
        text = svc._format_logs_for_prompt(logs)
        assert "ERROR" in text
        assert "api-gateway" in text
        assert "Something failed" in text

    def test_capped_at_150(self, svc):
        logs = [_make_log() for _ in range(200)]
        text = svc._format_logs_for_prompt(logs)
        lines = [l for l in text.splitlines() if l.strip()]
        assert len(lines) <= 150

    def test_empty_logs(self, svc):
        assert svc._format_logs_for_prompt([]) == ""


class TestFormatMetrics:
    def test_basic_format(self, svc, sample_metrics):
        text = svc._format_metrics_for_prompt(sample_metrics)
        assert "api-gateway"      in text
        assert "payment-service"  in text
        assert "error_rate"       in text

    def test_empty_metrics(self, svc):
        assert svc._format_metrics_for_prompt([]) == "No metrics available."


class TestFormatProblems:
    def test_no_problems(self, svc):
        assert svc._format_problems_for_prompt([]) == "No active Dynatrace problems."

    def test_with_problems(self, svc):
        problems = [{"severityLevel": "ERROR", "title": "High error rate", "problemId": "P-001", "status": "OPEN"}]
        text = svc._format_problems_for_prompt(problems)
        assert "ERROR" in text
        assert "High error rate" in text
        assert "P-001" in text


class TestQuickAnomalyCheck:
    def test_no_logs(self, svc):
        result = asyncio.get_event_loop().run_until_complete(svc.quick_anomaly_check([]))
        assert result["anomaly"] is False
        assert result["description"] == "No logs to analyse."

    def test_mostly_info_no_anomaly(self, svc):
        logs = [_make_log("INFO") for _ in range(20)]
        result = asyncio.get_event_loop().run_until_complete(svc.quick_anomaly_check(logs))
        assert result["anomaly"] is False

    def test_many_errors_triggers_anomaly(self, svc):
        logs = (
            [_make_log("ERROR", f"Error #{i}") for i in range(15)] +
            [_make_log("INFO")  for _ in range(5)]
        )
        result = asyncio.get_event_loop().run_until_complete(svc.quick_anomaly_check(logs))
        assert result["anomaly"] is True
        assert result["error_count"] == 15

    def test_severity_classification(self, svc):
        # >20% error rate → HIGH severity
        logs = (
            [_make_log("ERROR") for _ in range(30)] +
            [_make_log("INFO")  for _ in range(70)]
        )
        result = asyncio.get_event_loop().run_until_complete(svc.quick_anomaly_check(logs))
        assert result["severity"] == "HIGH"

    def test_returns_sample_errors(self, svc):
        logs = [_make_log("ERROR", f"Error message {i}") for i in range(5)]
        result = asyncio.get_event_loop().run_until_complete(svc.quick_anomaly_check(logs))
        assert len(result["sample_errors"]) <= 3
        assert all("Error message" in e for e in result["sample_errors"])

    def test_error_rate_calculation(self, svc):
        logs = (
            [_make_log("ERROR") for _ in range(10)] +
            [_make_log("INFO")  for _ in range(90)]
        )
        result = asyncio.get_event_loop().run_until_complete(svc.quick_anomaly_check(logs))
        assert result["error_rate_pct"] == pytest.approx(10.0)
        assert result["total_logs"] == 100


class TestFallbackAnalysis:
    def test_fallback_returns_analysis_result(self, svc, sample_log_batch):
        result = svc._fallback_analysis(sample_log_batch)
        assert result.analyzed_log_count == len(sample_log_batch)
        assert result.model_used == "fallback"
        assert "fallback" in result.summary.lower() or "error" in result.summary.lower()

    def test_fallback_with_no_logs(self, svc):
        result = svc._fallback_analysis([])
        assert result.analyzed_log_count == 0
