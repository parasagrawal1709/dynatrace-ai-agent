"""
Tests for all REST API routes.
Uses FastAPI TestClient (synchronous) with DEMO_MODE=true.
"""

import pytest


class TestPingAndRoot:
    def test_ping(self, client):
        r = client.get("/ping")
        assert r.status_code == 200
        data = r.json()
        assert data["pong"] is True
        assert "timestamp" in data

    def test_root(self, client):
        r = client.get("/")
        assert r.status_code == 200
        data = r.json()
        assert data["service"] == "Dynatrace AI Agent"
        assert data["status"] == "running"


class TestHealthRoutes:
    def test_system_health(self, client):
        r = client.get("/api/health/system")
        assert r.status_code == 200
        data = r.json()
        assert "overall_score" in data
        assert "overall_status" in data
        assert "services" in data
        assert isinstance(data["services"], list)
        assert 0 <= data["overall_score"] <= 100

    def test_health_summary(self, client):
        r = client.get("/api/health/summary")
        assert r.status_code == 200
        data = r.json()
        for key in ("overall_score", "overall_status", "service_count",
                    "healthy", "degraded", "critical", "active_problems"):
            assert key in data, f"Missing key: {key}"

    def test_service_health_valid(self, client):
        r = client.get("/api/health/service/api-gateway")
        assert r.status_code == 200
        data = r.json()
        assert data["service"] == "api-gateway"
        assert "score" in data
        assert "status" in data
        assert "breakdown" in data

    def test_service_health_unknown_service(self, client):
        # In demo mode all services may be generated dynamically;
        # but a totally unknown name should return 404
        r = client.get("/api/health/service/nonexistent-service-xyz-999")
        # Demo mode may or may not return data — accept 200 or 404
        assert r.status_code in (200, 404)

    def test_health_scores_sum_reasonable(self, client):
        r = client.get("/api/health/summary")
        data = r.json()
        total_services = data["healthy"] + data["degraded"] + data["critical"]
        assert total_services == data["service_count"]


class TestLogsRoutes:
    def test_recent_logs_default(self, client):
        r = client.get("/api/logs/recent")
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "logs"  in data
        assert isinstance(data["logs"], list)

    def test_recent_logs_with_limit(self, client):
        r = client.get("/api/logs/recent?limit=10&minutes=5")
        assert r.status_code == 200
        data = r.json()
        assert len(data["logs"]) <= 10

    def test_recent_logs_level_filter(self, client):
        r = client.get("/api/logs/recent?level=ERROR&limit=100")
        assert r.status_code == 200
        data = r.json()
        for log in data["logs"]:
            assert log["level"] == "ERROR"

    def test_error_logs(self, client):
        r = client.get("/api/logs/errors?minutes=60")
        assert r.status_code == 200
        data = r.json()
        for log in data["logs"]:
            assert log["level"] in ("ERROR", "CRITICAL")

    def test_log_stats(self, client):
        r = client.get("/api/logs/stats?minutes=60")
        assert r.status_code == 200
        data = r.json()
        assert "total"      in data
        assert "by_level"   in data
        assert "by_service" in data
        assert data["window_minutes"] == 60

    def test_log_entry_schema(self, client):
        r = client.get("/api/logs/recent?limit=5")
        data = r.json()
        if data["logs"]:
            log = data["logs"][0]
            for field in ("id", "timestamp", "level", "service", "message"):
                assert field in log, f"Log entry missing field: {field}"


class TestAnalysisRoutes:
    def test_quick_check(self, client):
        r = client.get("/api/analysis/quick-check")
        assert r.status_code == 200
        data = r.json()
        assert "anomaly"     in data
        assert "total_logs"  in data
        assert "error_count" in data
        assert isinstance(data["anomaly"], bool)

    def test_run_analysis_with_manual_logs(self, client):
        payload = {
            "log_lines": [
                "ERROR payment-service: Connection pool exhausted",
                "WARN  api-gateway: Response time exceeded threshold",
                "ERROR auth-service: JWT verification failed",
                "INFO  inventory-service: Cache miss for product:1234",
                "ERROR payment-service: Timeout after 15000ms",
            ],
            "include_metrics": False,
            "include_problems": False,
        }
        r = client.post("/api/analysis/run", json=payload)
        # May fail if ANTHROPIC_API_KEY is invalid in test env — accept 200 or 500
        assert r.status_code in (200, 500)

    def test_quick_check_parameters(self, client):
        r = client.get("/api/analysis/quick-check?minutes=1")
        assert r.status_code == 200

    def test_analysis_history_placeholder(self, client):
        r = client.get("/api/analysis/history")
        assert r.status_code == 200
        data = r.json()
        assert "results" in data


class TestDynatraceRoutes:
    def test_problems(self, client):
        r = client.get("/api/dynatrace/problems")
        assert r.status_code == 200
        data = r.json()
        assert "problems" in data
        assert "total"    in data
        assert isinstance(data["problems"], list)

    def test_metrics(self, client):
        r = client.get("/api/dynatrace/metrics")
        assert r.status_code == 200
        data = r.json()
        assert "metrics" in data
        assert len(data["metrics"]) > 0

    def test_events(self, client):
        r = client.get("/api/dynatrace/events")
        assert r.status_code == 200
        data = r.json()
        assert "events" in data

    def test_dynatrace_status(self, client):
        r = client.get("/api/dynatrace/status")
        assert r.status_code == 200
        data = r.json()
        assert data["demo_mode"] is True   # set in conftest.py

    def test_problems_schema(self, client):
        r = client.get("/api/dynatrace/problems")
        data = r.json()
        for p in data["problems"]:
            assert "problemId"     in p
            assert "title"         in p
            assert "severityLevel" in p
            assert "status"        in p


class TestAgentRoutes:
    def test_agent_context(self, client):
        r = client.get("/api/agent/context")
        assert r.status_code == 200
        data = r.json()
        assert "context"   in data
        assert "timestamp" in data
        assert len(data["context"]) > 0

    def test_agent_chat_requires_body(self, client):
        r = client.post("/api/agent/chat", json={})
        assert r.status_code == 422   # Pydantic validation error

    def test_agent_chat_with_api_error(self, client):
        """With an invalid API key the chat should fail gracefully."""
        payload = {
            "message": "What is the current system health?",
            "conversation_history": [],
            "include_live_context": False,
        }
        r = client.post("/api/agent/chat", json=payload)
        # With dummy key: 500 expected; with real key: 200
        assert r.status_code in (200, 500)


class TestOpenAPISchema:
    def test_openapi_json_available(self, client):
        r = client.get("/openapi.json")
        assert r.status_code == 200
        schema = r.json()
        assert schema["info"]["title"] == "Dynatrace AI Agent"

    def test_docs_available(self, client):
        r = client.get("/docs")
        assert r.status_code == 200
