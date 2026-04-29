"""
Background Task Manager
-----------------------
Runs a continuous polling loop that:
  1. Fetches logs + metrics from Dynatrace
  2. Runs quick anomaly check
  3. Calculates health scores
  4. Triggers full AI analysis when anomalies are found
  5. Broadcasts updates to all connected WebSocket clients
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict

from config import settings
from services.dynatrace_service import dynatrace_service
from services.claude_service import claude_service
from services.health_scorer import health_scorer

logger = logging.getLogger(__name__)


class BackgroundTaskManager:
    def __init__(self, ws_manager):
        self.ws_manager = ws_manager
        self._running = False
        self._analysis_counter = 0
        self._full_analysis_every_n = 3   # full AI analysis every N polls

    async def start_polling(self):
        self._running = True
        logger.info(f"Background poller started — interval={settings.POLL_INTERVAL_SECONDS}s")
        while self._running:
            try:
                await self._poll_cycle()
            except Exception as e:
                logger.error(f"Poll cycle error: {e}", exc_info=True)
            await asyncio.sleep(settings.POLL_INTERVAL_SECONDS)

    async def stop(self):
        self._running = False

    # ── Core poll cycle ────────────────────────────────────────────────────────

    async def _poll_cycle(self):
        self._analysis_counter += 1
        logger.info(f"Poll cycle #{self._analysis_counter} starting …")

        # Fetch data concurrently
        logs_task     = asyncio.create_task(
            dynatrace_service.get_logs(from_minutes_ago=settings.LOG_LOOKBACK_MINUTES))
        metrics_task  = asyncio.create_task(dynatrace_service.get_metrics())
        problems_task = asyncio.create_task(dynatrace_service.get_problems())

        logs, metrics, problems = await asyncio.gather(
            logs_task, metrics_task, problems_task, return_exceptions=True
        )

        # Gracefully handle partial failures
        if isinstance(logs, Exception):
            logger.warning(f"Logs fetch failed: {logs}")
            logs = []
        if isinstance(metrics, Exception):
            logger.warning(f"Metrics fetch failed: {metrics}")
            metrics = []
        if isinstance(problems, Exception):
            logger.warning(f"Problems fetch failed: {problems}")
            problems = []

        # ── Health scoring (fast, no AI) ───────────────────────────────────────
        system_health = health_scorer.score_system(
            metrics_list=metrics,
            active_problems=len(problems),
            total_errors_last_hour=sum(1 for l in logs if l.level in ("ERROR", "CRITICAL")),
        )

        await self.ws_manager.broadcast({
            "type": "health_update",
            "payload": {
                "overall_score":  system_health.overall_score,
                "overall_status": system_health.overall_status.value,
                "active_problems": system_health.active_problems,
                "total_errors":   system_health.total_errors_last_hour,
                "services": [
                    {
                        "service": s.service,
                        "score":   s.score,
                        "status":  s.status.value,
                        "trend":   s.trend,
                        "breakdown": s.breakdown,
                    }
                    for s in system_health.services
                ],
                "timestamp": system_health.timestamp.isoformat(),
            },
        })

        # ── Quick anomaly check (fast) ─────────────────────────────────────────
        anomaly = await claude_service.quick_anomaly_check(logs)
        await self.ws_manager.broadcast({
            "type": "anomaly_check",
            "payload": anomaly,
        })

        # ── Live log stream ────────────────────────────────────────────────────
        if logs:
            await self.ws_manager.broadcast({
                "type": "log_batch",
                "payload": {
                    "count": len(logs),
                    "logs": [
                        {
                            "id":        l.id,
                            "timestamp": l.timestamp.isoformat(),
                            "level":     l.level,
                            "service":   l.service,
                            "message":   l.message,
                            "host":      l.host,
                        }
                        for l in logs[:50]   # cap WS payload
                    ],
                },
            })

        # ── Full AI analysis (every N cycles or when anomaly detected) ─────────
        run_full = (
            self._analysis_counter % self._full_analysis_every_n == 0
            or anomaly.get("anomaly", False)
        )

        if run_full and settings.ANTHROPIC_API_KEY:
            logger.info("Running full AI analysis …")
            try:
                problems_dicts = [p.dict() for p in problems]
                result = await claude_service.analyze_logs(logs, metrics, problems_dicts)
                await self.ws_manager.broadcast({
                    "type": "ai_analysis",
                    "payload": {
                        "summary":           result.summary,
                        "health_assessment": result.health_assessment,
                        "anomalies":         result.anomalies,
                        "recommendations":   result.recommendations,
                        "root_cause":        result.root_cause_hypothesis,
                        "analyzed_logs":     result.analyzed_log_count,
                        "issues": [
                            {
                                "id":              i.id,
                                "category":        i.category.value,
                                "severity":        i.severity.value,
                                "title":           i.title,
                                "description":     i.description,
                                "services":        i.affected_services,
                                "confidence":      i.confidence,
                                "evidence":        i.evidence,
                                "recommendation":  i.recommendation,
                                "impact":          i.estimated_impact,
                                "predicted_at":    i.predicted_at.isoformat(),
                            }
                            for i in result.issues_detected
                        ],
                        "timestamp": result.analysis_timestamp.isoformat(),
                    },
                })
            except Exception as e:
                logger.error(f"AI analysis failed: {e}", exc_info=True)
        elif run_full and not settings.ANTHROPIC_API_KEY:
            logger.warning("ANTHROPIC_API_KEY not set — skipping AI analysis")

        logger.info(
            f"Poll #{self._analysis_counter} done — "
            f"logs={len(logs)}, metrics={len(metrics)}, "
            f"problems={len(problems)}, health={system_health.overall_score:.1f}"
        )
