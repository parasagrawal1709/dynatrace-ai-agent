"""
Tests for services/health_scorer.py
"""

import pytest
from datetime import datetime, timezone

from services.health_scorer import (
    HealthScorer,
    _error_rate_score,
    _response_time_score,
    _availability_score,
    _throughput_score,
    _status_from_score,
    _trend,
)
from models.models import HealthStatus, MetricPoint


# ── Unit: individual scoring functions ───────────────────────────

class TestErrorRateScore:
    def test_zero_errors_is_perfect(self):
        assert _error_rate_score(0.0) == 100.0

    def test_ten_percent_is_zero(self):
        assert _error_rate_score(10.0) == 0.0

    def test_five_percent_is_fifty(self):
        assert _error_rate_score(5.0) == pytest.approx(50.0)

    def test_above_ten_clamped_to_zero(self):
        assert _error_rate_score(20.0) == 0.0


class TestResponseTimeScore:
    def test_under_200ms_perfect(self):
        assert _response_time_score(100.0) == 100.0
        assert _response_time_score(200.0) == 100.0

    def test_5000ms_is_zero(self):
        assert _response_time_score(5000.0) == 0.0

    def test_above_5000ms_clamped(self):
        assert _response_time_score(9999.0) == 0.0

    def test_midpoint(self):
        score = _response_time_score(2600.0)
        assert 40 < score < 60


class TestAvailabilityScore:
    def test_full_availability(self):
        assert _availability_score(99.9)  == 100.0
        assert _availability_score(100.0) == 100.0

    def test_below_90_is_zero(self):
        assert _availability_score(89.0) == 0.0

    def test_midpoint(self):
        score = _availability_score(95.0)
        assert 40 < score < 60


class TestThroughputScore:
    def test_zero_throughput_is_zero(self):
        assert _throughput_score(0.0) == 0.0

    def test_normal_throughput_perfect(self):
        assert _throughput_score(100.0) == 100.0

    def test_low_throughput_partial(self):
        score = _throughput_score(5.0)
        assert 0 < score < 100


class TestStatusFromScore:
    def test_healthy(self):
        assert _status_from_score(90.0) == HealthStatus.HEALTHY
        assert _status_from_score(80.0) == HealthStatus.HEALTHY

    def test_degraded(self):
        assert _status_from_score(79.9) == HealthStatus.DEGRADED
        assert _status_from_score(50.0) == HealthStatus.DEGRADED

    def test_critical(self):
        assert _status_from_score(49.9) == HealthStatus.CRITICAL
        assert _status_from_score(0.0)  == HealthStatus.CRITICAL


class TestTrendDetection:
    def _pts(self, values):
        return [MetricPoint(timestamp=datetime.now(timezone.utc), value=v) for v in values]

    def test_stable(self):
        assert _trend(self._pts([5.0, 5.1, 4.9, 5.0, 5.0, 4.8])) == "stable"

    def test_degrading(self):
        # Error rate rising = degrading
        pts = self._pts([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
        assert _trend(pts) == "degrading"

    def test_improving(self):
        pts = self._pts([6.0, 5.0, 4.0, 3.0, 2.0, 1.0])
        assert _trend(pts) == "improving"

    def test_single_point_stable(self):
        assert _trend(self._pts([5.0])) == "stable"

    def test_empty_stable(self):
        assert _trend([]) == "stable"


# ── Integration: HealthScorer ─────────────────────────────────────

class TestHealthScorer:
    def setup_method(self):
        self.scorer = HealthScorer()

    def test_healthy_service(self, sample_metrics):
        auth = next(m for m in sample_metrics if m.service == "auth-service")
        score = self.scorer.score_service(auth)
        assert score.score > 80
        assert score.status == HealthStatus.HEALTHY
        assert "error_rate"    in score.breakdown
        assert "response_time" in score.breakdown
        assert "availability"  in score.breakdown
        assert "throughput"    in score.breakdown

    def test_degraded_service(self, sample_metrics):
        payment = next(m for m in sample_metrics if m.service == "payment-service")
        score = self.scorer.score_service(payment)
        # High error rate + slow response should be degraded or critical
        assert score.score < 80

    def test_score_range_always_valid(self, sample_metrics):
        for m in sample_metrics:
            score = self.scorer.score_service(m)
            assert 0.0 <= score.score <= 100.0

    def test_system_health_aggregation(self, sample_metrics):
        health = self.scorer.score_system(
            metrics_list=sample_metrics,
            active_problems=2,
            total_errors_last_hour=15,
        )
        assert len(health.services) == len(sample_metrics)
        assert 0.0 <= health.overall_score <= 100.0
        assert health.active_problems == 2
        assert health.total_errors_last_hour == 15

    def test_active_problems_lower_score(self, sample_metrics):
        h_no_problems   = self.scorer.score_system(sample_metrics, active_problems=0)
        h_many_problems = self.scorer.score_system(sample_metrics, active_problems=5)
        assert h_no_problems.overall_score > h_many_problems.overall_score

    def test_empty_metrics_returns_unknown(self):
        health = self.scorer.score_system([])
        assert health.overall_status == HealthStatus.UNKNOWN
        assert health.services == []

    def test_cpu_penalty_applied(self, sample_metrics):
        """Service with CPU > 85% should score lower than same service at 40% CPU."""
        from copy import deepcopy
        normal = deepcopy(sample_metrics[0])
        normal.cpu_usage = 40.0
        hot    = deepcopy(sample_metrics[0])
        hot.cpu_usage = 95.0

        s_normal = self.scorer.score_service(normal)
        s_hot    = self.scorer.score_service(hot)
        assert s_normal.score > s_hot.score
