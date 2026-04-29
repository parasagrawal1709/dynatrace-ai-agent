"""
Agent Router — /api/agent
Conversational AI agent backed by Claude with live system context.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.models import AgentMessage, AgentRequest
from services.dynatrace_service import dynatrace_service
from services.claude_service import claude_service
from services.health_scorer import health_scorer

logger = logging.getLogger(__name__)
router = APIRouter()


async def _build_context() -> str:
    """Fetch live system data and format it as context for the agent."""
    try:
        logs_task     = asyncio.create_task(dynatrace_service.get_logs(from_minutes_ago=15, limit=50))
        metrics_task  = asyncio.create_task(dynatrace_service.get_metrics())
        problems_task = asyncio.create_task(dynatrace_service.get_problems())

        logs, metrics, problems = await asyncio.gather(
            logs_task, metrics_task, problems_task, return_exceptions=True
        )

        if isinstance(logs,     Exception): logs     = []
        if isinstance(metrics,  Exception): metrics  = []
        if isinstance(problems, Exception): problems = []

        health = health_scorer.score_system(metrics, active_problems=len(problems))

        lines = [
            f"System Health: {health.overall_score:.1f}/100 ({health.overall_status.value})",
            f"Active Problems: {len(problems)}",
            f"Errors last 15 min: {sum(1 for l in logs if l.level == 'ERROR')}",
            "",
            "=== SERVICE METRICS ===",
        ]
        for m in metrics:
            lines.append(
                f"  {m.service}: error={m.error_rate:.1f}% "
                f"rt={m.avg_response_ms:.0f}ms "
                f"avail={m.availability:.2f}% "
                f"cpu={m.cpu_usage or 0:.0f}%"
            )

        if problems:
            lines += ["", "=== ACTIVE DYNATRACE PROBLEMS ==="]
            for p in problems:
                lines.append(f"  [{p.severityLevel}] {p.title} — {p.status}")

        if logs:
            recent_errors = [l for l in logs if l.level in ("ERROR", "CRITICAL")][:5]
            if recent_errors:
                lines += ["", "=== RECENT ERRORS ==="]
                for l in recent_errors:
                    ts = l.timestamp.strftime("%H:%M:%S")
                    lines.append(f"  [{ts}] {l.service}: {l.message}")

        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Context build error: {e}")
        return "Context unavailable — system data fetch failed."


@router.post("/chat")
async def chat(req: AgentRequest):
    """Non-streaming chat with the AI agent."""
    try:
        context = await _build_context() if req.include_live_context else None
        response_text = claude_service.chat(
            user_message=req.message,
            history=req.conversation_history,
            context=context,
        )
        return {
            "message": response_text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error(f"Agent chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(req: AgentRequest):
    """Server-Sent Events streaming chat."""
    context = await _build_context() if req.include_live_context else None

    async def event_generator():
        try:
            for chunk in claude_service.chat_stream(
                user_message=req.message,
                history=req.conversation_history,
                context=context,
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/context")
async def get_agent_context():
    """Return the live context the agent would see — useful for debugging."""
    context = await _build_context()
    return {"context": context, "timestamp": datetime.now(timezone.utc).isoformat()}
