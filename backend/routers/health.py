"""
Health Router — /api/health
"""

from fastapi import APIRouter, HTTPException
from services.dynatrace_service import dynatrace_service
from services.health_scorer import health_scorer

router = APIRouter()


@router.get("/system")
async def get_system_health():
    """Full system health — all services scored and ranked."""
    try:
        metrics  = await dynatrace_service.get_metrics()
        problems = await dynatrace_service.get_problems()
        health   = health_scorer.score_system(
            metrics_list=metrics,
            active_problems=len(problems),
        )
        return health.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/service/{service_name}")
async def get_service_health(service_name: str):
    """Health score for a single named service."""
    try:
        metrics = await dynatrace_service.get_metrics(services=[service_name])
        if not metrics:
            raise HTTPException(status_code=404, detail=f"Service '{service_name}' not found")
        score = health_scorer.score_service(metrics[0])
        return score.dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_health_summary():
    """Quick numeric summary — suitable for dashboards and status bars."""
    try:
        metrics  = await dynatrace_service.get_metrics()
        problems = await dynatrace_service.get_problems()
        health   = health_scorer.score_system(metrics, active_problems=len(problems))
        return {
            "overall_score":   health.overall_score,
            "overall_status":  health.overall_status.value,
            "service_count":   len(health.services),
            "healthy":         sum(1 for s in health.services if s.status.value == "HEALTHY"),
            "degraded":        sum(1 for s in health.services if s.status.value == "DEGRADED"),
            "critical":        sum(1 for s in health.services if s.status.value == "CRITICAL"),
            "active_problems": health.active_problems,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
