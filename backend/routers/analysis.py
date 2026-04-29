"""
Analysis Router — /api/analysis
Trigger AI-powered log analysis on demand.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

from services.dynatrace_service import dynatrace_service
from services.claude_service import claude_service

router = APIRouter()


class ManualAnalysisRequest(BaseModel):
    log_lines: Optional[List[str]] = None   # manual log paste
    minutes: int = 30
    include_metrics: bool = True
    include_problems: bool = True


@router.post("/run")
async def run_analysis(req: ManualAnalysisRequest):
    """
    Trigger a full AI analysis.
    - If log_lines provided → analyse those directly
    - Otherwise → fetch from Dynatrace
    """
    try:
        metrics  = await dynatrace_service.get_metrics() if req.include_metrics  else []
        problems = await dynatrace_service.get_problems() if req.include_problems else []

        if req.log_lines:
            # Build synthetic LogEntry objects from raw text
            from datetime import datetime, timezone
            from models.models import LogEntry
            import hashlib

            logs = []
            for i, line in enumerate(req.log_lines):
                upper = line.upper()
                level = "ERROR" if "ERROR" in upper else \
                        "WARN"  if "WARN"  in upper else \
                        "INFO"
                service = "manual-input"
                logs.append(LogEntry(
                    id=hashlib.md5(line.encode()).hexdigest()[:12],
                    timestamp=datetime.now(timezone.utc),
                    level=level,
                    service=service,
                    message=line,
                ))
        else:
            logs = await dynatrace_service.get_logs(from_minutes_ago=req.minutes, limit=200)

        if not logs:
            return {"message": "No logs available to analyse.", "result": None}

        problems_dicts = [p.dict() for p in problems]
        result = await claude_service.analyze_logs(logs, metrics, problems_dicts)
        return result.dict()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quick-check")
async def quick_anomaly_check(minutes: int = Query(default=5, ge=1, le=60)):
    """Fast heuristic anomaly check — no AI cost, returns in <100ms."""
    try:
        logs = await dynatrace_service.get_logs(from_minutes_ago=minutes, limit=200)
        result = await claude_service.quick_anomaly_check(logs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_analysis_history():
    """
    Returns last N analysis results.
    In production this would query a database; here we return a placeholder.
    """
    return {
        "message": "Integrate with a database (Postgres/Redis) to persist history.",
        "results": [],
    }
