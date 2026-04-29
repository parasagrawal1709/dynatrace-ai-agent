"""
Dynatrace Router — /api/dynatrace
Expose raw Dynatrace data directly to the frontend.
"""

from fastapi import APIRouter, HTTPException, Query
from services.dynatrace_service import dynatrace_service

router = APIRouter()


@router.get("/problems")
async def get_problems():
    try:
        problems = await dynatrace_service.get_problems()
        return {"total": len(problems), "problems": [p.dict() for p in problems]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics(service: str = Query(default=None)):
    try:
        services = [service] if service else None
        metrics = await dynatrace_service.get_metrics(services=services)
        return {"total": len(metrics), "metrics": [m.dict() for m in metrics]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events")
async def get_events(minutes: int = Query(default=60, ge=5, le=1440)):
    try:
        events = await dynatrace_service.get_events(from_minutes_ago=minutes)
        return {"total": len(events), "events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def dynatrace_status():
    """Check whether Dynatrace connectivity is working."""
    from config import settings
    return {
        "demo_mode": settings.DEMO_MODE,
        "env_url_configured": bool(settings.DT_ENV_URL),
        "api_token_configured": bool(settings.DT_API_TOKEN),
    }
