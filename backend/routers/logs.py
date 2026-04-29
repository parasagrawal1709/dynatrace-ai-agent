"""
Logs Router — /api/logs
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from services.dynatrace_service import dynatrace_service

router = APIRouter()


@router.get("/recent")
async def get_recent_logs(
    minutes: int = Query(default=5, ge=1, le=1440),
    limit:   int = Query(default=200, ge=1, le=1000),
    query:   Optional[str] = None,
    level:   Optional[str] = None,   # ERROR, WARN, INFO, DEBUG
    service: Optional[str] = None,
):
    """Fetch recent log entries with optional filtering."""
    try:
        logs = await dynatrace_service.get_logs(
            from_minutes_ago=minutes,
            limit=limit,
            query=query,
        )

        # Client-side filters (Dynatrace advanced filtering needs DQL in paid tiers)
        if level:
            lvl_upper = level.upper()
            logs = [l for l in logs if l.level == lvl_upper]
        if service:
            logs = [l for l in logs if service.lower() in l.service.lower()]

        return {
            "total": len(logs),
            "logs": [l.dict() for l in logs],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/errors")
async def get_error_logs(
    minutes: int = Query(default=60, ge=1, le=1440),
    limit:   int = Query(default=100, ge=1, le=500),
):
    """Convenience endpoint — errors and criticals only."""
    try:
        logs = await dynatrace_service.get_logs(from_minutes_ago=minutes, limit=limit * 5)
        errors = [l for l in logs if l.level in ("ERROR", "CRITICAL")][:limit]
        return {"total": len(errors), "logs": [l.dict() for l in errors]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_log_stats(minutes: int = Query(default=60, ge=1, le=1440)):
    """Log volume stats broken down by level and service."""
    try:
        logs = await dynatrace_service.get_logs(from_minutes_ago=minutes, limit=1000)

        by_level: dict = {}
        by_service: dict = {}
        for l in logs:
            by_level[l.level] = by_level.get(l.level, 0) + 1
            by_service[l.service] = by_service.get(l.service, 0) + 1

        return {
            "total":      len(logs),
            "by_level":   by_level,
            "by_service": dict(sorted(by_service.items(), key=lambda x: -x[1])),
            "window_minutes": minutes,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
