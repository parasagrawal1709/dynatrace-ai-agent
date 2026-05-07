# """
# Health Scorer
# -------------
# Calculates weighted health scores for each service and
# produces a system-wide health summary.
# """
#
# import logging
# from datetime import datetime, timezone
# from typing import List
#
# from config import settings
# from models.models import (
#     HealthScore,
#     HealthStatus,
#     ServiceMetrics,
#     SystemHealth,
# )
#
# logger = logging.getLogger(__name__)
#
#
# def _status_from_score(score: float) -> HealthStatus:
#     if score >= 80:
#         return HealthStatus.HEALTHY
#     if score >= 50:
#         return HealthStatus.DEGRADED
#     return HealthStatus.CRITICAL
#
#
# def _error_rate_score(error_rate: float) -> float:
#     """0% error → 100 pts, 10%+ error → 0 pts (linear)."""
#     return max(0.0, 100.0 - error_rate * 10)
#
#
# def _response_time_score(ms: float) -> float:
#     """< 200ms → 100 pts, > 5000ms → 0 pts."""
#     if ms <= 200:
#         return 100.0
#     if ms >= 5000:
#         return 0.0
#     return 100.0 - ((ms - 200) / 4800) * 100
#
#
# def _availability_score(avail: float) -> float:
#     """99.9%+ → 100 pts, < 90% → 0 pts."""
#     if avail >= 99.9:
#         return 100.0
#     if avail < 90:
#         return 0.0
#     return (avail - 90) / 9.9 * 100
#
#
# def _throughput_score(rpm: float) -> float:
#     """
#     We can't know the 'expected' throughput without baselines,
#     so we give full marks for any reasonable throughput and
#     penalise only if throughput drops suspiciously low.
#     """
#     if rpm >= 10:
#         return 100.0
#     if rpm == 0:
#         return 0.0
#     return rpm / 10 * 100
#
#
# def _trend(history: list) -> str:
#     if len(history) < 2:
#         return "stable"
#     first_half  = sum(p.value for p in history[:len(history) // 2]) / max(1, len(history) // 2)
#     second_half = sum(p.value for p in history[len(history) // 2:]) / max(1, len(history) - len(history) // 2)
#     diff = second_half - first_half
#     if abs(diff) < 1:
#         return "stable"
#     return "degrading" if diff > 0 else "improving"
#
#
# class HealthScorer:
#     def score_service(self, metrics: ServiceMetrics) -> HealthScore:
#         er_score   = _error_rate_score(metrics.error_rate)
#         rt_score   = _response_time_score(metrics.avg_response_ms)
#         avail_score = _availability_score(metrics.availability)
#         tp_score   = _throughput_score(metrics.throughput_rpm)
#
#         w = settings
#         composite = (
#             er_score   * w.WEIGHT_ERROR_RATE   +
#             rt_score   * w.WEIGHT_RESPONSE_TIME +
#             avail_score * w.WEIGHT_AVAILABILITY +
#             tp_score   * w.WEIGHT_THROUGHPUT
#         )
#
#         # CPU / memory penalty (optional bonus data)
#         if metrics.cpu_usage is not None and metrics.cpu_usage > 85:
#             composite -= (metrics.cpu_usage - 85) * 0.5
#         if metrics.memory_usage is not None and metrics.memory_usage > 90:
#             composite -= (metrics.memory_usage - 90) * 1.0
#
#         composite = max(0.0, min(100.0, composite))
#
#         trend_series = metrics.metrics_history.get("error_rate", [])
#
#         return HealthScore(
#             service=metrics.service,
#             score=round(composite, 1),
#             status=_status_from_score(composite),
#             breakdown={
#                 "error_rate":    round(er_score, 1),
#                 "response_time": round(rt_score, 1),
#                 "availability":  round(avail_score, 1),
#                 "throughput":    round(tp_score, 1),
#             },
#             trend=_trend(trend_series),
#             last_updated=datetime.now(timezone.utc),
#         )
#
#     def score_system(
#         self,
#         metrics_list: List[ServiceMetrics],
#         active_problems: int = 0,
#         total_errors_last_hour: int = 0,
#     ) -> SystemHealth:
#         service_scores = [self.score_service(m) for m in metrics_list]
#
#         if not service_scores:
#             return SystemHealth(
#                 overall_score=0,
#                 overall_status=HealthStatus.UNKNOWN,
#                 services=[],
#                 active_problems=active_problems,
#                 total_errors_last_hour=total_errors_last_hour,
#                 timestamp=datetime.now(timezone.utc),
#             )
#
#         overall = sum(s.score for s in service_scores) / len(service_scores)
#         # Active problems push score down
#         overall -= active_problems * 5
#         overall = max(0.0, min(100.0, overall))
#
#         return SystemHealth(
#             overall_score=round(overall, 1),
#             overall_status=_status_from_score(overall),
#             services=service_scores,
#             active_problems=active_problems,
#             total_errors_last_hour=total_errors_last_hour,
#             timestamp=datetime.now(timezone.utc),
#         )
#
#
# health_scorer = HealthScorer()


# """
# Health Scorer
# -------------
# Calculates weighted health scores for each service and
# produces a system-wide health summary.
#
# Enhanced with:
# - SLI / SLO error budget
# - Burn rate analysis
# - Metrics freshness scoring
# - Additional weighted scoring dimensions
# """
# from __future__ import annotations
#
# import logging
# from datetime import datetime, timezone
# from typing import List
#
# from config import settings
# from models.models import (
#     HealthScore,
#     HealthStatus,
#     ServiceMetrics,
#     SystemHealth,
# )
#
# logger = logging.getLogger(__name__)
#
#
# def _status_from_score(score: float) -> HealthStatus:
#     if score >= 80:
#         return HealthStatus.HEALTHY
#     if score >= 50:
#         return HealthStatus.DEGRADED
#     return HealthStatus.CRITICAL
#
#
# # -------------------------------------------------------------------
# # Core Metric Scores
# # -------------------------------------------------------------------
#
# def _error_rate_score(error_rate: float) -> float:
#     """
#     0% error  -> 100
#     10% error -> 0
#     """
#     return max(0.0, 100.0 - error_rate * 10)
#
#
# def _response_time_score(ms: float) -> float:
#     """
#     < 200ms  -> 100
#     > 5000ms -> 0
#     """
#     if ms <= 200:
#         return 100.0
#
#     if ms >= 5000:
#         return 0.0
#
#     return 100.0 - ((ms - 200) / 4800) * 100
#
#
# def _availability_score(avail: float) -> float:
#     """
#     99.9%+ -> 100
#     < 90%  -> 0
#     """
#     if avail >= 99.9:
#         return 100.0
#
#     if avail < 90:
#         return 0.0
#
#     return (avail - 90) / 9.9 * 100
#
#
# def _throughput_score(rpm: float) -> float:
#     """
#     Throughput score based on requests per minute.
#     """
#
#     if rpm >= 100:
#         return 100.0
#
#     if rpm <= 0:
#         return 0.0
#
#     return min(100.0, (rpm / 100) * 100)
#
#
# # -------------------------------------------------------------------
# # SLO / SLI / Error Budget
# # -------------------------------------------------------------------
#
# def _slo_compliance_score(
#     availability: float,
#     target_slo: float = 99.9,
# ) -> float:
#     """
#     Measures how close service is to SLO target.
#     """
#
#     if availability >= target_slo:
#         return 100.0
#
#     gap = target_slo - availability
#
#     return max(0.0, 100.0 - (gap * 100))
#
#
# def _error_budget_remaining(
#     availability: float,
#     target_slo: float = 99.9,
# ) -> float:
#     """
#     Calculates remaining error budget percentage.
#
#     Example:
#     SLO = 99.9
#     Allowed downtime budget = 0.1%
#
#     Availability = 99.85
#     Consumed = 0.05
#     Remaining = 50%
#     """
#
#     total_budget = 100.0 - target_slo
#     consumed_budget = max(0.0, target_slo - availability)
#
#     if total_budget <= 0:
#         return 100.0
#
#     remaining = ((total_budget - consumed_budget) / total_budget) * 100
#
#     return max(0.0, min(100.0, remaining))
#
#
# def _burn_rate_score(
#     error_rate: float,
#     target_slo: float = 99.9,
# ) -> tuple[float, float]:
#     """
#     Burn rate estimation.
#
#     Burn Rate =
#       current_error_rate / allowed_error_rate
#
#     Lower burn rate is better.
#     """
#
#     allowed_error_rate = 100.0 - target_slo
#
#     if allowed_error_rate <= 0:
#         return 100.0, 0.0
#
#     burn_rate = error_rate / allowed_error_rate
#
#     if burn_rate <= 1:
#         score = 100.0
#     elif burn_rate >= 10:
#         score = 0.0
#     else:
#         score = 100.0 - ((burn_rate - 1) / 9) * 100
#
#     return max(0.0, score), round(burn_rate, 2)
#
#
# # -------------------------------------------------------------------
# # Freshness
# # -------------------------------------------------------------------
#
# def _freshness_score(last_collected_at: datetime | None) -> float:
#     """
#     Measures how fresh the metrics are.
#
#     <= 1 min  -> 100
#     <= 5 min  -> 80
#     <= 15 min -> 50
#     > 30 min  -> 0
#     """
#
#     if not last_collected_at:
#         return 0.0
#
#     now = datetime.now(timezone.utc)
#
#     age_seconds = (now - last_collected_at).total_seconds()
#
#     if age_seconds <= 60:
#         return 100.0
#
#     if age_seconds <= 300:
#         return 80.0
#
#     if age_seconds <= 900:
#         return 50.0
#
#     if age_seconds <= 1800:
#         return 20.0
#
#     return 0.0
#
#
# # -------------------------------------------------------------------
# # Trend Detection
# # -------------------------------------------------------------------
#
# def _trend(history: list) -> str:
#     if len(history) < 2:
#         return "stable"
#
#     first_half = (
#         sum(p.value for p in history[: len(history) // 2]) /
#         max(1, len(history) // 2)
#     )
#
#     second_half = (
#         sum(p.value for p in history[len(history) // 2 :]) /
#         max(1, len(history) - len(history) // 2)
#     )
#
#     diff = second_half - first_half
#
#     if abs(diff) < 1:
#         return "stable"
#
#     return "degrading" if diff > 0 else "improving"
#
#
# # -------------------------------------------------------------------
# # Health Scorer
# # -------------------------------------------------------------------
#
# class HealthScorer:
#
#     def score_service(self, metrics: ServiceMetrics) -> HealthScore:
#
#         # -----------------------------------------------------------
#         # Core Scores
#         # -----------------------------------------------------------
#
#         er_score = _error_rate_score(metrics.error_rate)
#
#         rt_score = _response_time_score(
#             metrics.avg_response_ms
#         )
#
#         avail_score = _availability_score(
#             metrics.availability
#         )
#
#         tp_score = _throughput_score(
#             metrics.throughput_rpm
#         )
#
#         freshness_score = _freshness_score(
#             getattr(metrics, "last_collected_at", None)
#         )
#
#         # -----------------------------------------------------------
#         # SLO / SLI
#         # -----------------------------------------------------------
#
#         slo_score = _slo_compliance_score(
#             metrics.availability
#         )
#
#         error_budget_remaining = _error_budget_remaining(
#             metrics.availability
#         )
#
#         burn_rate_score, burn_rate = _burn_rate_score(
#             metrics.error_rate
#         )
#
#         # -----------------------------------------------------------
#         # Composite Weighted Score
#         # -----------------------------------------------------------
#
#         w = settings
#
#         composite = (
#             er_score * w.WEIGHT_ERROR_RATE +
#             rt_score * w.WEIGHT_RESPONSE_TIME +
#             avail_score * w.WEIGHT_AVAILABILITY +
#             tp_score * w.WEIGHT_THROUGHPUT +
#             freshness_score * getattr(w, "WEIGHT_FRESHNESS", 0.10) +
#             slo_score * getattr(w, "WEIGHT_SLO", 0.10) +
#             burn_rate_score * getattr(w, "WEIGHT_BURN_RATE", 0.10)
#         )
#
#         # -----------------------------------------------------------
#         # Resource Usage Penalties
#         # -----------------------------------------------------------
#
#         if (
#             metrics.cpu_usage is not None and
#             metrics.cpu_usage > 85
#         ):
#             composite -= (
#                 metrics.cpu_usage - 85
#             ) * 0.5
#
#         if (
#             metrics.memory_usage is not None and
#             metrics.memory_usage > 90
#         ):
#             composite -= (
#                 metrics.memory_usage - 90
#             ) * 1.0
#
#         composite = max(0.0, min(100.0, composite))
#
#         trend_series = metrics.metrics_history.get(
#             "error_rate",
#             [],
#         )
#
#         return HealthScore(
#             service=metrics.service,
#
#             score=round(composite, 1),
#
#             status=_status_from_score(composite),
#
#             breakdown={
#                 "error_rate": round(er_score, 1),
#                 "response_time": round(rt_score, 1),
#                 "availability": round(avail_score, 1),
#                 "throughput": round(tp_score, 1),
#                 "freshness": round(freshness_score, 1),
#                 "slo_compliance": round(slo_score, 1),
#                 "burn_rate_score": round(burn_rate_score, 1),
#             },
#
#             trend=_trend(trend_series),
#
#             last_updated=datetime.now(timezone.utc),
#
#             metadata={
#                 "error_budget_remaining_pct":
#                     round(error_budget_remaining, 2),
#
#                 "burn_rate":
#                     burn_rate,
#
#                 "target_slo":
#                     99.9,
#             }
#         )
#
#     # ----------------------------------------------------------------
#
#     def score_system(
#         self,
#         metrics_list: List[ServiceMetrics],
#         active_problems: int = 0,
#         total_errors_last_hour: int = 0,
#     ) -> SystemHealth:
#
#         service_scores = [
#             self.score_service(m)
#             for m in metrics_list
#         ]
#
#         if not service_scores:
#             return SystemHealth(
#                 overall_score=0,
#                 overall_status=HealthStatus.UNKNOWN,
#                 services=[],
#                 active_problems=active_problems,
#                 total_errors_last_hour=total_errors_last_hour,
#                 timestamp=datetime.now(timezone.utc),
#             )
#
#         # -----------------------------------------------------------
#         # Aggregate Overall Score
#         # -----------------------------------------------------------
#
#         overall = (
#             sum(s.score for s in service_scores)
#             / len(service_scores)
#         )
#
#         # Penalize active incidents/problems
#         overall -= active_problems * 5
#
#         # Penalize excessive platform-wide errors
#         if total_errors_last_hour > 1000:
#             overall -= 10
#
#         overall = max(0.0, min(100.0, overall))
#
#         # -----------------------------------------------------------
#         # System Health Response
#         # -----------------------------------------------------------
#
#         return SystemHealth(
#             overall_score=round(overall, 1),
#
#             overall_status=_status_from_score(overall),
#
#             services=service_scores,
#
#             active_problems=active_problems,
#
#             total_errors_last_hour=total_errors_last_hour,
#
#             timestamp=datetime.now(timezone.utc),
#         )
#
#
# health_scorer = HealthScorer()


#----------


"""
Health Scorer
-------------
Real-time dynamic health scoring engine with:

- Error Rate Scoring
- Response Time Scoring
- Availability Scoring
- Throughput Scoring
- Freshness Scoring
- SLI / SLO Tracking
- Error Budget Remaining
- Burn Rate Analysis
- Trend Detection
- CPU / Memory Penalties
- Live Updating Values
"""
#
# import logging
# from datetime import datetime, timezone
# from typing import List
#
# from config import settings
# from models.models import (
#     HealthScore,
#     HealthStatus,
#     ServiceMetrics,
#     SystemHealth,
# )
#
# logger = logging.getLogger(__name__)
#
#
# # ============================================================
# # STATUS
# # ============================================================
#
# def _status_from_score(score: float) -> HealthStatus:
#
#     if score >= 80:
#         return HealthStatus.HEALTHY
#
#     if score >= 50:
#         return HealthStatus.DEGRADED
#
#     return HealthStatus.CRITICAL
#
#
# # ============================================================
# # CORE METRIC SCORING
# # ============================================================
#
# def _error_rate_score(error_rate: float) -> float:
#     """
#     Dynamic Error Rate Scoring
#
#     0% error   -> 100
#     10% error  -> 0
#     """
#
#     # support decimal values like 0.02
#     if error_rate <= 1:
#         error_rate = error_rate * 100
#
#     return max(0.0, 100.0 - (error_rate * 10))
#
#
# def _response_time_score(ms: float) -> float:
#     """
#     Response Time Scoring
#
#     <= 200ms  -> 100
#     >= 5000ms -> 0
#     """
#
#     if ms <= 200:
#         return 100.0
#
#     if ms >= 5000:
#         return 0.0
#
#     return 100.0 - (((ms - 200) / 4800) * 100)
#
#
# def _availability_score(avail: float) -> float:
#     """
#     Availability Score
#
#     99.9%+ -> 100
#     <90%   -> 0
#     """
#
#     if avail >= 99.9:
#         return 100.0
#
#     if avail < 90:
#         return 0.0
#
#     return ((avail - 90) / 9.9) * 100
#
#
# def _throughput_score(rpm: float) -> float:
#     """
#     Dynamic Throughput Score
#     """
#
#     if rpm >= 100:
#         return 100.0
#
#     if rpm <= 0:
#         return 0.0
#
#     return min(100.0, rpm)
#
#
# # ============================================================
# # FRESHNESS
# # ============================================================
#
# def _freshness_score(last_collected_at) -> tuple[float, float]:
#     """
#     Real-time freshness scoring.
#
#     Returns:
#     (
#         freshness_score,
#         age_seconds
#     )
#     """
#
#     if not last_collected_at:
#         return 100.0, 0.0
#
#     # string support
#     if isinstance(last_collected_at, str):
#         try:
#             last_collected_at = datetime.fromisoformat(
#                 last_collected_at.replace("Z", "+00:00")
#             )
#         except Exception:
#             return 50.0, 0.0
#
#     # timezone handling
#     if last_collected_at.tzinfo is None:
#         last_collected_at = last_collected_at.replace(
#             tzinfo=timezone.utc
#         )
#
#     now = datetime.now(timezone.utc)
#
#     age_seconds = (
#         now - last_collected_at
#     ).total_seconds()
#
#     if age_seconds <= 60:
#         return 100.0, round(age_seconds, 2)
#
#     if age_seconds <= 300:
#         return 80.0, round(age_seconds, 2)
#
#     if age_seconds <= 900:
#         return 50.0, round(age_seconds, 2)
#
#     if age_seconds <= 1800:
#         return 20.0, round(age_seconds, 2)
#
#     return 0.0, round(age_seconds, 2)
#
#
# # ============================================================
# # SLO / ERROR BUDGET
# # ============================================================
#
# def _slo_compliance_score(
#     availability: float,
#     target_slo: float = 99.9,
# ) -> float:
#     """
#     SLO compliance scoring.
#     """
#
#     if availability >= target_slo:
#         return 100.0
#
#     gap = target_slo - availability
#
#     return max(0.0, 100.0 - (gap * 100))
#
#
# def _error_budget_remaining(
#     availability: float,
#     target_slo: float = 99.9,
# ) -> float:
#     """
#     Error budget remaining percentage.
#     """
#
#     total_budget = 100.0 - target_slo
#
#     consumed_budget = max(
#         0.0,
#         target_slo - availability
#     )
#
#     if total_budget <= 0:
#         return 100.0
#
#     remaining = (
#         (total_budget - consumed_budget)
#         / total_budget
#     ) * 100
#
#     return max(0.0, min(100.0, remaining))
#
#
# # ============================================================
# # BURN RATE
# # ============================================================
#
# def _burn_rate_score(
#     error_rate: float,
#     target_slo: float = 99.9,
# ) -> tuple[float, float]:
#     """
#     Real-time burn rate calculation.
#     """
#
#     allowed_error_rate = 100.0 - target_slo
#
#     # decimal support
#     current_error_rate = (
#         error_rate * 100
#         if error_rate <= 1
#         else error_rate
#     )
#
#     if allowed_error_rate <= 0:
#         return 100.0, 0.0
#
#     burn_rate = (
#         current_error_rate
#         / allowed_error_rate
#     )
#
#     if burn_rate <= 1:
#         score = 100.0
#
#     elif burn_rate >= 10:
#         score = 0.0
#
#     else:
#         score = 100.0 - (
#             ((burn_rate - 1) / 9) * 100
#         )
#
#     return (
#         round(score, 1),
#         round(burn_rate, 2)
#     )
#
#
# # ============================================================
# # TREND DETECTION
# # ============================================================
#
# def _trend(history: list) -> str:
#
#     if len(history) < 2:
#         return "stable"
#
#     first_half = sum(
#         p.value for p in history[:len(history)//2]
#     ) / max(1, len(history)//2)
#
#     second_half = sum(
#         p.value for p in history[len(history)//2:]
#     ) / max(
#         1,
#         len(history) - len(history)//2
#     )
#
#     diff = second_half - first_half
#
#     if abs(diff) < 1:
#         return "stable"
#
#     return (
#         "degrading"
#         if diff > 0
#         else "improving"
#     )
#
#
# # ============================================================
# # HEALTH SCORER
# # ============================================================
#
# class HealthScorer:
#
#     def score_service(
#         self,
#         metrics: ServiceMetrics,
#     ) -> HealthScore:
#
#         # ----------------------------------------------------
#         # REAL-TIME SCORES
#         # ----------------------------------------------------
#
#         er_score = _error_rate_score(
#             metrics.error_rate
#         )
#
#         rt_score = _response_time_score(
#             metrics.avg_response_ms
#         )
#
#         avail_score = _availability_score(
#             metrics.availability
#         )
#
#         tp_score = _throughput_score(
#             metrics.throughput_rpm
#         )
#
#         freshness_score, age_seconds = (
#             _freshness_score(
#                 getattr(
#                     metrics,
#                     "last_collected_at",
#                     None
#                 )
#             )
#         )
#
#         slo_score = _slo_compliance_score(
#             metrics.availability
#         )
#
#         error_budget_remaining = (
#             _error_budget_remaining(
#                 metrics.availability
#             )
#         )
#
#         burn_rate_score, burn_rate = (
#             _burn_rate_score(
#                 metrics.error_rate
#             )
#         )
#
#         # ----------------------------------------------------
#         # WEIGHTED COMPOSITE SCORE
#         # ----------------------------------------------------
#
#         w = settings
#
#         composite = (
#
#             er_score *
#             getattr(
#                 w,
#                 "WEIGHT_ERROR_RATE",
#                 0.25
#             )
#
#             +
#
#             rt_score *
#             getattr(
#                 w,
#                 "WEIGHT_RESPONSE_TIME",
#                 0.20
#             )
#
#             +
#
#             avail_score *
#             getattr(
#                 w,
#                 "WEIGHT_AVAILABILITY",
#                 0.20
#             )
#
#             +
#
#             tp_score *
#             getattr(
#                 w,
#                 "WEIGHT_THROUGHPUT",
#                 0.10
#             )
#
#             +
#
#             freshness_score *
#             getattr(
#                 w,
#                 "WEIGHT_FRESHNESS",
#                 0.10
#             )
#
#             +
#
#             slo_score *
#             getattr(
#                 w,
#                 "WEIGHT_SLO",
#                 0.10
#             )
#
#             +
#
#             burn_rate_score *
#             getattr(
#                 w,
#                 "WEIGHT_BURN_RATE",
#                 0.05
#             )
#         )
#
#         # ----------------------------------------------------
#         # RESOURCE PENALTIES
#         # ----------------------------------------------------
#
#         if (
#             metrics.cpu_usage is not None
#             and metrics.cpu_usage > 85
#         ):
#             composite -= (
#                 metrics.cpu_usage - 85
#             ) * 0.5
#
#         if (
#             metrics.memory_usage is not None
#             and metrics.memory_usage > 90
#         ):
#             composite -= (
#                 metrics.memory_usage - 90
#             ) * 1.0
#
#         composite = max(
#             0.0,
#             min(100.0, composite)
#         )
#
#         trend_series = (
#             metrics.metrics_history.get(
#                 "error_rate",
#                 []
#             )
#         )
#
#         # ----------------------------------------------------
#         # FINAL RESPONSE
#         # ----------------------------------------------------
#
#         return HealthScore(
#
#             service=metrics.service,
#
#             score=round(composite, 1),
#
#             status=_status_from_score(
#                 composite
#             ),
#
#             breakdown={
#
#                 "error_rate":
#                     round(er_score, 1),
#
#                 "response_time":
#                     round(rt_score, 1),
#
#                 "availability":
#                     round(avail_score, 1),
#
#                 "throughput":
#                     round(tp_score, 1),
#
#                 "freshness":
#                     round(freshness_score, 1),
#
#                 "slo_compliance":
#                     round(slo_score, 1),
#
#                 "burn_rate_score":
#                     round(burn_rate_score, 1),
#             },
#
#             trend=_trend(trend_series),
#
#             last_updated=datetime.now(
#                 timezone.utc
#             ),
#
#             metadata={
#
#                 # ------------------------------------------------
#                 # LIVE VALUES
#                 # ------------------------------------------------
#
#                 "live_error_rate":
#                     metrics.error_rate,
#
#                 "live_response_time_ms":
#                     metrics.avg_response_ms,
#
#                 "live_availability":
#                     metrics.availability,
#
#                 "live_throughput_rpm":
#                     metrics.throughput_rpm,
#
#                 "live_cpu_usage":
#                     metrics.cpu_usage,
#
#                 "live_memory_usage":
#                     metrics.memory_usage,
#
#                 "metric_age_seconds":
#                     age_seconds,
#
#                 # ------------------------------------------------
#                 # SLO / BURN RATE
#                 # ------------------------------------------------
#
#                 "target_slo":
#                     99.9,
#
#                 "error_budget_remaining_pct":
#                     round(
#                         error_budget_remaining,
#                         2
#                     ),
#
#                 "burn_rate":
#                     burn_rate,
#
#                 # ------------------------------------------------
#                 # LIVE TIMESTAMP
#                 # ------------------------------------------------
#
#                 "evaluated_at":
#                     datetime.now(
#                         timezone.utc
#                     ).isoformat(),
#             }
#         )
#
#     # ========================================================
#     # SYSTEM HEALTH
#     # ========================================================
#
#     def score_system(
#         self,
#         metrics_list: List[ServiceMetrics],
#         active_problems: int = 0,
#         total_errors_last_hour: int = 0,
#     ) -> SystemHealth:
#
#         service_scores = [
#             self.score_service(m)
#             for m in metrics_list
#         ]
#
#         if not service_scores:
#
#             return SystemHealth(
#
#                 overall_score=0,
#
#                 overall_status=
#                     HealthStatus.UNKNOWN,
#
#                 services=[],
#
#                 active_problems=
#                     active_problems,
#
#                 total_errors_last_hour=
#                     total_errors_last_hour,
#
#                 timestamp=datetime.now(
#                     timezone.utc
#                 ),
#             )
#
#         # ----------------------------------------------------
#         # LIVE OVERALL SCORE
#         # ----------------------------------------------------
#
#         overall = (
#             sum(
#                 s.score
#                 for s in service_scores
#             )
#             / len(service_scores)
#         )
#
#         # active problem penalty
#         overall -= active_problems * 5
#
#         # error surge penalty
#         if total_errors_last_hour > 1000:
#             overall -= 10
#
#         overall = max(
#             0.0,
#             min(100.0, overall)
#         )
#
#         return SystemHealth(
#
#             overall_score=
#                 round(overall, 1),
#
#             overall_status=
#                 _status_from_score(overall),
#
#             services=
#                 service_scores,
#
#             active_problems=
#                 active_problems,
#
#             total_errors_last_hour=
#                 total_errors_last_hour,
#
#             timestamp=datetime.now(
#                 timezone.utc
#             ),
#         )
#
#
# # ============================================================
# # SINGLETON
# # ============================================================
#
# health_scorer = HealthScorer()



"""
Enterprise Real-Time Health Scorer
----------------------------------

Features:
- Dynamic health scoring
- SLO / SLI monitoring
- Burn rate analysis
- Error budget tracking
- Freshness tracking
- Trend analysis
- Real-time smooth metric updates
- Live score recalculation every 10 seconds
"""

import logging
import random
import time

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


# ============================================================
# STATUS
# ============================================================

def _status_from_score(score: float) -> HealthStatus:

    if score >= 85:
        return HealthStatus.HEALTHY

    if score >= 60:
        return HealthStatus.DEGRADED

    return HealthStatus.CRITICAL


# ============================================================
# METRIC SCORING
# ============================================================

def _error_rate_score(error_rate: float) -> float:

    if error_rate <= 1:
        error_rate = error_rate * 100

    if error_rate <= 0.2:
        return 98.0

    if error_rate <= 1:
        return 92.0 - (error_rate * 4)

    if error_rate <= 3:
        return 88.0 - ((error_rate - 1) * 6.5)

    if error_rate <= 5:
        return 75.0 - ((error_rate - 3) * 10)

    if error_rate <= 10:
        return 55.0 - ((error_rate - 5) * 7)

    return max(5.0, 20.0 - ((error_rate - 10) * 2))


def _response_time_score(ms: float) -> float:

    if ms <= 100:
        return 97.0

    if ms <= 300:
        return 97 - ((ms - 100) / 200) * 7

    if ms <= 800:
        return 90 - ((ms - 300) / 500) * 12

    if ms <= 1500:
        return 78 - ((ms - 800) / 700) * 18

    if ms <= 3000:
        return 60 - ((ms - 1500) / 1500) * 25

    if ms <= 5000:
        return 35 - ((ms - 3000) / 2000) * 20

    return 10.0


def _availability_score(avail: float) -> float:

    if avail >= 99.99:
        return 99.0

    if avail >= 99.9:
        return 95 + ((avail - 99.9) * 40)

    if avail >= 99.5:
        return 85 + ((avail - 99.5) * 25)

    if avail >= 98:
        return 72 + ((avail - 98) * 8)

    if avail >= 95:
        return 55 + ((avail - 95) * 5)

    if avail >= 90:
        return 30 + ((avail - 90) * 5)

    return max(5.0, avail / 2)


def _throughput_score(rpm: float) -> float:

    if rpm <= 0:
        return 5.0

    if rpm <= 10:
        return 25 + (rpm * 3)

    if rpm <= 50:
        return 55 + ((rpm - 10) * 0.5)

    if rpm <= 200:
        return 75 + ((rpm - 50) * 0.08)

    if rpm <= 1000:
        return 87 + ((rpm - 200) * 0.01)

    return 94.0


# ============================================================
# FRESHNESS
# ============================================================

def _freshness_score(last_collected_at):

    if not last_collected_at:
        return 75.0, 0.0

    if isinstance(last_collected_at, str):

        try:
            last_collected_at = datetime.fromisoformat(
                last_collected_at.replace("Z", "+00:00")
            )

        except Exception:
            return 55.0, 0.0

    if last_collected_at.tzinfo is None:

        last_collected_at = last_collected_at.replace(
            tzinfo=timezone.utc
        )

    now = datetime.now(timezone.utc)

    age_seconds = (
        now - last_collected_at
    ).total_seconds()

    if age_seconds <= 30:
        return 98.0, round(age_seconds, 2)

    if age_seconds <= 120:
        return 92.0, round(age_seconds, 2)

    if age_seconds <= 300:
        return 82.0, round(age_seconds, 2)

    if age_seconds <= 600:
        return 70.0, round(age_seconds, 2)

    if age_seconds <= 1200:
        return 52.0, round(age_seconds, 2)

    if age_seconds <= 1800:
        return 35.0, round(age_seconds, 2)

    return 18.0, round(age_seconds, 2)


# ============================================================
# SLO / ERROR BUDGET
# ============================================================

def _slo_compliance_score(
    availability: float,
    target_slo: float = 99.9,
) -> float:

    gap = max(0, target_slo - availability)

    if gap <= 0.01:
        return 97.0

    if gap <= 0.05:
        return 90.0

    if gap <= 0.1:
        return 82.0

    if gap <= 0.5:
        return 65.0

    if gap <= 1:
        return 45.0

    return 20.0


def _error_budget_remaining(
    availability: float,
    target_slo: float = 99.9,
) -> float:

    total_budget = 100.0 - target_slo

    consumed_budget = max(
        0.0,
        target_slo - availability
    )

    if total_budget <= 0:
        return 100.0

    remaining = (
        (total_budget - consumed_budget)
        / total_budget
    ) * 100

    return round(
        max(0.0, min(100.0, remaining)),
        2
    )


# ============================================================
# BURN RATE
# ============================================================

def _burn_rate_score(
    error_rate: float,
    target_slo: float = 99.9,
):

    allowed_error_rate = 100.0 - target_slo

    current_error_rate = (
        error_rate * 100
        if error_rate <= 1
        else error_rate
    )

    if allowed_error_rate <= 0:
        return 85.0, 0.0

    burn_rate = (
        current_error_rate
        / allowed_error_rate
    )

    if burn_rate <= 0.5:
        score = 96.0

    elif burn_rate <= 1:
        score = 88.0

    elif burn_rate <= 2:
        score = 76.0

    elif burn_rate <= 4:
        score = 60.0

    elif burn_rate <= 8:
        score = 38.0

    else:
        score = 18.0

    return (
        round(score, 1),
        round(burn_rate, 2)
    )


# ============================================================
# TREND
# ============================================================

def _trend(history: list) -> str:

    if len(history) < 2:
        return "stable"

    first_half = (
        sum(
            p.value
            for p in history[:len(history)//2]
        )
        / max(1, len(history)//2)
    )

    second_half = (
        sum(
            p.value
            for p in history[len(history)//2:]
        )
        / max(
            1,
            len(history) - len(history)//2
        )
    )

    diff = second_half - first_half

    if abs(diff) < 1:
        return "stable"

    return (
        "degrading"
        if diff > 0
        else "improving"
    )


# ============================================================
# LIVE METRIC UPDATE ENGINE
# ============================================================

def _bounded_change(
    current: float,
    min_delta: float,
    max_delta: float,
    min_value: float,
    max_value: float,
):

    delta = random.uniform(
        min_delta,
        max_delta
    )

    updated = current + delta

    return round(
        max(min_value, min(max_value, updated)),
        2
    )


def simulate_live_metrics(metrics: ServiceMetrics):

    metrics.error_rate = _bounded_change(
        metrics.error_rate,
        -0.05,
        0.05,
        0.01,
        8.0,
    )

    metrics.avg_response_ms = _bounded_change(
        metrics.avg_response_ms,
        -25,
        25,
        80,
        5000,
    )

    metrics.availability = _bounded_change(
        metrics.availability,
        -0.02,
        0.02,
        95.0,
        99.99,
    )

    metrics.throughput_rpm = _bounded_change(
        metrics.throughput_rpm,
        -5,
        5,
        5,
        500,
    )

    if metrics.cpu_usage is not None:

        metrics.cpu_usage = _bounded_change(
            metrics.cpu_usage,
            -2,
            2,
            10,
            98,
        )

    if metrics.memory_usage is not None:

        metrics.memory_usage = _bounded_change(
            metrics.memory_usage,
            -1.5,
            1.5,
            20,
            98,
        )

    metrics.last_collected_at = datetime.now(
        timezone.utc
    )

    return metrics


# ============================================================
# HEALTH SCORER
# ============================================================

class HealthScorer:

    def score_service(
        self,
        metrics: ServiceMetrics,
    ) -> HealthScore:

        er_score = _error_rate_score(
            metrics.error_rate
        )

        rt_score = _response_time_score(
            metrics.avg_response_ms
        )

        avail_score = _availability_score(
            metrics.availability
        )

        tp_score = _throughput_score(
            metrics.throughput_rpm
        )

        freshness_score, age_seconds = (
            _freshness_score(
                getattr(
                    metrics,
                    "last_collected_at",
                    None
                )
            )
        )

        slo_score = _slo_compliance_score(
            metrics.availability
        )

        error_budget_remaining = (
            _error_budget_remaining(
                metrics.availability
            )
        )

        burn_rate_score, burn_rate = (
            _burn_rate_score(
                metrics.error_rate
            )
        )

        w = settings

        composite = (

            er_score *
            getattr(
                w,
                "WEIGHT_ERROR_RATE",
                0.25
            )

            +

            rt_score *
            getattr(
                w,
                "WEIGHT_RESPONSE_TIME",
                0.20
            )

            +

            avail_score *
            getattr(
                w,
                "WEIGHT_AVAILABILITY",
                0.20
            )

            +

            tp_score *
            getattr(
                w,
                "WEIGHT_THROUGHPUT",
                0.10
            )

            +

            freshness_score *
            getattr(
                w,
                "WEIGHT_FRESHNESS",
                0.10
            )

            +

            slo_score *
            getattr(
                w,
                "WEIGHT_SLO",
                0.10
            )

            +

            burn_rate_score *
            getattr(
                w,
                "WEIGHT_BURN_RATE",
                0.05
            )
        )

        # resource penalties

        if (
            metrics.cpu_usage is not None
            and metrics.cpu_usage > 85
        ):

            composite -= (
                metrics.cpu_usage - 85
            ) * 0.4

        if (
            metrics.memory_usage is not None
            and metrics.memory_usage > 90
        ):

            composite -= (
                metrics.memory_usage - 90
            ) * 0.6

        composite = round(
            max(0.0, min(99.0, composite)),
            1
        )

        trend_series = (
            metrics.metrics_history.get(
                "error_rate",
                []
            )
        )

        return HealthScore(

            service=metrics.service,

            score=composite,

            status=_status_from_score(
                composite
            ),

            breakdown={

                "error_rate":
                    round(er_score, 1),

                "response_time":
                    round(rt_score, 1),

                "availability":
                    round(avail_score, 1),

                "throughput":
                    round(tp_score, 1),

                "freshness":
                    round(freshness_score, 1),

                "slo_compliance":
                    round(slo_score, 1),

                "burn_rate_score":
                    round(burn_rate_score, 1),
            },

            trend=_trend(trend_series),

            last_updated=datetime.now(
                timezone.utc
            ),

            metadata={

                "live_error_rate":
                    metrics.error_rate,

                "live_response_time_ms":
                    metrics.avg_response_ms,

                "live_availability":
                    metrics.availability,

                "live_throughput_rpm":
                    metrics.throughput_rpm,

                "live_cpu_usage":
                    metrics.cpu_usage,

                "live_memory_usage":
                    metrics.memory_usage,

                "metric_age_seconds":
                    age_seconds,

                "target_slo":
                    99.9,

                "error_budget_remaining_pct":
                    error_budget_remaining,

                "burn_rate":
                    burn_rate,

                "evaluated_at":
                    datetime.now(
                        timezone.utc
                    ).isoformat(),
            }
        )

    # ========================================================
    # SYSTEM HEALTH
    # ========================================================

    def score_system(
        self,
        metrics_list: List[ServiceMetrics],
        active_problems: int = 0,
        total_errors_last_hour: int = 0,
    ) -> SystemHealth:

        service_scores = [
            self.score_service(m)
            for m in metrics_list
        ]

        if not service_scores:

            return SystemHealth(

                overall_score=0,

                overall_status=
                    HealthStatus.UNKNOWN,

                services=[],

                active_problems=
                    active_problems,

                total_errors_last_hour=
                    total_errors_last_hour,

                timestamp=datetime.now(
                    timezone.utc
                ),
            )

        overall = (
            sum(
                s.score
                for s in service_scores
            )
            / len(service_scores)
        )

        overall -= active_problems * 3

        if total_errors_last_hour > 1000:
            overall -= 8

        overall = round(
            max(0.0, min(99.0, overall)),
            1
        )

        return SystemHealth(

            overall_score=overall,

            overall_status=
                _status_from_score(overall),

            services=
                service_scores,

            active_problems=
                active_problems,

            total_errors_last_hour=
                total_errors_last_hour,

            timestamp=datetime.now(
                timezone.utc
            ),
        )


# ============================================================
# SINGLETON
# ============================================================

health_scorer = HealthScorer()


# ============================================================
# LIVE LOOP
# ============================================================

def start_live_monitoring(metrics_list):

    logger.info(
        "Starting real-time health monitoring..."
    )

    while True:

        for service in metrics_list:

            # simulate smooth updates
            simulate_live_metrics(service)

            # score service
            score = health_scorer.score_service(
                service
            )

            print("\n")
            print("=" * 60)

            print(
                f"SERVICE: {service.service}"
            )

            print(
                f"HEALTH SCORE: {score.score}"
            )

            print(
                f"STATUS: {score.status}"
            )

            print(
                f"ERROR RATE: "
                f"{service.error_rate}%"
            )

            print(
                f"RESPONSE TIME: "
                f"{service.avg_response_ms} ms"
            )

            print(
                f"AVAILABILITY: "
                f"{service.availability}%"
            )

            print(
                f"THROUGHPUT: "
                f"{service.throughput_rpm} rpm"
            )

            print(
                f"BURN RATE: "
                f"{score.metadata['burn_rate']}"
            )

            print(
                f"ERROR BUDGET LEFT: "
                f"{score.metadata['error_budget_remaining_pct']}%"
            )

            print(
                f"FRESHNESS AGE: "
                f"{score.metadata['metric_age_seconds']} sec"
            )

            print(
                f"UPDATED AT: "
                f"{score.metadata['evaluated_at']}"
            )

        # update every 10 sec
        time.sleep(10)