"""
Health Scorer
-------------
Calculates weighted health scores for each service and
produces a system-wide health summary.
"""

import logging
from datetime import datetime, timezone
from typing import List

from config import settings
from models.models import (
    HealthScore,
    HealthStatus,
    ServiceMetrics,
    SystemHealth,
)

logger = logging.getLogger(__name__)


def _status_from_score(score: float) -> HealthStatus:
    if score >= 80:
        return HealthStatus.HEALTHY
    if score >= 50:
        return HealthStatus.DEGRADED
    return HealthStatus.CRITICAL


def _error_rate_score(error_rate: float) -> float:
    """0% error → 100 pts, 10%+ error → 0 pts (linear)."""
    return max(0.0, 100.0 - error_rate * 10)


def _response_time_score(ms: float) -> float:
    """< 200ms → 100 pts, > 5000ms → 0 pts."""
    if ms <= 200:
        return 100.0
    if ms >= 5000:
        return 0.0
    return 100.0 - ((ms - 200) / 4800) * 100


def _availability_score(avail: float) -> float:
    """99.9%+ → 100 pts, < 90% → 0 pts."""
    if avail >= 99.9:
        return 100.0
    if avail < 90:
        return 0.0
    return (avail - 90) / 9.9 * 100


def _throughput_score(rpm: float) -> float:
    """
    We can't know the 'expected' throughput without baselines,
    so we give full marks for any reasonable throughput and
    penalise only if throughput drops suspiciously low.
    """
    if rpm >= 10:
        return 100.0
    if rpm == 0:
        return 0.0
    return rpm / 10 * 100


def _trend(history: list) -> str:
    if len(history) < 2:
        return "stable"
    first_half  = sum(p.value for p in history[:len(history) // 2]) / max(1, len(history) // 2)
    second_half = sum(p.value for p in history[len(history) // 2:]) / max(1, len(history) - len(history) // 2)
    diff = second_half - first_half
    if abs(diff) < 1:
        return "stable"
    return "degrading" if diff > 0 else "improving"


class HealthScorer:
    def score_service(self, metrics: ServiceMetrics) -> HealthScore:
        er_score   = _error_rate_score(metrics.error_rate)
        rt_score   = _response_time_score(metrics.avg_response_ms)
        avail_score = _availability_score(metrics.availability)
        tp_score   = _throughput_score(metrics.throughput_rpm)

        w = settings
        composite = (
            er_score   * w.WEIGHT_ERROR_RATE   +
            rt_score   * w.WEIGHT_RESPONSE_TIME +
            avail_score * w.WEIGHT_AVAILABILITY +
            tp_score   * w.WEIGHT_THROUGHPUT
        )

        # CPU / memory penalty (optional bonus data)
        if metrics.cpu_usage is not None and metrics.cpu_usage > 85:
            composite -= (metrics.cpu_usage - 85) * 0.5
        if metrics.memory_usage is not None and metrics.memory_usage > 90:
            composite -= (metrics.memory_usage - 90) * 1.0

        composite = max(0.0, min(100.0, composite))

        trend_series = metrics.metrics_history.get("error_rate", [])

        return HealthScore(
            service=metrics.service,
            score=round(composite, 1),
            status=_status_from_score(composite),
            breakdown={
                "error_rate":    round(er_score, 1),
                "response_time": round(rt_score, 1),
                "availability":  round(avail_score, 1),
                "throughput":    round(tp_score, 1),
            },
            trend=_trend(trend_series),
            last_updated=datetime.now(timezone.utc),
        )

    def score_system(
        self,
        metrics_list: List[ServiceMetrics],
        active_problems: int = 0,
        total_errors_last_hour: int = 0,
    ) -> SystemHealth:
        service_scores = [self.score_service(m) for m in metrics_list]

        if not service_scores:
            return SystemHealth(
                overall_score=0,
                overall_status=HealthStatus.UNKNOWN,
                services=[],
                active_problems=active_problems,
                total_errors_last_hour=total_errors_last_hour,
                timestamp=datetime.now(timezone.utc),
            )

        overall = sum(s.score for s in service_scores) / len(service_scores)
        # Active problems push score down
        overall -= active_problems * 5
        overall = max(0.0, min(100.0, overall))

        return SystemHealth(
            overall_score=round(overall, 1),
            overall_status=_status_from_score(overall),
            services=service_scores,
            active_problems=active_problems,
            total_errors_last_hour=total_errors_last_hour,
            timestamp=datetime.now(timezone.utc),
        )


health_scorer = HealthScorer()
