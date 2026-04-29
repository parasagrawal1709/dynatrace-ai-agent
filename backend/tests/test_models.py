"""
Tests for models/models.py — Pydantic validation and enums.
"""

import pytest
from datetime import datetime, timezone

from models.models import (
    LogEntry, ServiceMetrics, HealthScore, SystemHealth,
    PredictedIssue, AnalysisResult, AgentMessage, AgentRequest,
    HealthStatus, SeverityLevel, IssueCategory,
)


class TestLogEntry:
    def test_valid_entry(self):
        log = LogEntry(
            id="abc",
            timestamp=datetime.now(timezone.utc),
            level="ERROR",
            service="api-gateway",
            message="Something went wrong",
        )
        assert log.id == "abc"
        assert log.level == "ERROR"

    def test_optional_fields_default(self):
        log = LogEntry(
            id="x",
            timestamp=datetime.now(timezone.utc),
            level="INFO",
            service="svc",
            message="msg",
        )
        assert log.trace_id   is None
        assert log.span_id    is None
        assert log.host       is None
        assert log.attributes == {}

    def test_missing_required_field(self):
        with pytest.raises(Exception):
            LogEntry(id="x", level="INFO", service="svc", message="msg")


class TestServiceMetrics:
    def test_valid_metrics(self):
        m = ServiceMetrics(
            service="payment-service",
            error_rate=3.5,
            avg_response_ms=200.0,
            availability=99.5,
            throughput_rpm=500.0,
        )
        assert m.service == "payment-service"
        assert m.cpu_usage is None

    def test_with_optional_fields(self):
        m = ServiceMetrics(
            service="s",
            error_rate=0,
            avg_response_ms=100,
            availability=100,
            throughput_rpm=1000,
            cpu_usage=50.0,
            memory_usage=60.0,
        )
        assert m.cpu_usage    == 50.0
        assert m.memory_usage == 60.0


class TestPredictedIssue:
    def test_valid_issue(self):
        issue = PredictedIssue(
            id="issue-1",
            category=IssueCategory.PERFORMANCE,
            severity=SeverityLevel.HIGH,
            title="Slow response time",
            description="p95 > 5s",
            affected_services=["api-gateway"],
            confidence=0.85,
            evidence=["Response time 4823ms"],
            recommendation="Scale horizontally",
            estimated_impact="~200 users/min affected",
            predicted_at=datetime.now(timezone.utc),
        )
        assert issue.confidence == 0.85
        assert issue.category == IssueCategory.PERFORMANCE

    def test_all_severity_levels(self):
        for level in SeverityLevel:
            issue = PredictedIssue(
                id="x",
                category=IssueCategory.CPU,
                severity=level,
                title="t",
                description="d",
                affected_services=[],
                confidence=0.5,
                evidence=[],
                recommendation="r",
                estimated_impact="i",
                predicted_at=datetime.now(timezone.utc),
            )
            assert issue.severity == level

    def test_all_categories(self):
        for cat in IssueCategory:
            issue = PredictedIssue(
                id="x",
                category=cat,
                severity=SeverityLevel.LOW,
                title="t",
                description="d",
                affected_services=[],
                confidence=0.5,
                evidence=[],
                recommendation="r",
                estimated_impact="i",
                predicted_at=datetime.now(timezone.utc),
            )
            assert issue.category == cat


class TestAnalysisResult:
    def test_valid_result(self):
        result = AnalysisResult(
            summary="All good",
            health_assessment="System healthy",
            issues_detected=[],
            anomalies=[],
            recommendations=["Keep monitoring"],
            analyzed_log_count=150,
            analysis_timestamp=datetime.now(timezone.utc),
            model_used="claude-sonnet-4-20250514",
        )
        assert result.analyzed_log_count == 150
        assert result.root_cause_hypothesis is None


class TestAgentModels:
    def test_agent_message(self):
        msg = AgentMessage(role="user", content="hello")
        assert msg.role == "user"
        assert msg.timestamp is not None

    def test_agent_request_defaults(self):
        req = AgentRequest(message="what is going on?")
        assert req.conversation_history == []
        assert req.include_live_context is True

    def test_agent_request_with_history(self):
        history = [
            AgentMessage(role="user",      content="hello"),
            AgentMessage(role="assistant", content="hi there"),
        ]
        req = AgentRequest(message="follow-up?", conversation_history=history)
        assert len(req.conversation_history) == 2


class TestEnums:
    def test_health_status_values(self):
        assert HealthStatus.HEALTHY.value   == "HEALTHY"
        assert HealthStatus.DEGRADED.value  == "DEGRADED"
        assert HealthStatus.CRITICAL.value  == "CRITICAL"
        assert HealthStatus.UNKNOWN.value   == "UNKNOWN"

    def test_severity_level_values(self):
        levels = {l.value for l in SeverityLevel}
        assert levels == {"CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"}

    def test_issue_category_count(self):
        assert len(list(IssueCategory)) == 10
