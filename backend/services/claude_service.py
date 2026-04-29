"""
Claude AI Service
-----------------
All interactions with the Anthropic Claude API.
Handles:
  - Log batch analysis
  - Anomaly detection
  - Issue prediction
  - Conversational agent
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict, List, Optional

import anthropic

from config import settings
from models.models import (
    AgentMessage,
    AnalysisResult,
    IssueCategory,
    LogEntry,
    PredictedIssue,
    ServiceMetrics,
    SeverityLevel,
    SystemHealth,
)

logger = logging.getLogger(__name__)

# ── System prompts ─────────────────────────────────────────────────────────────

ANALYSIS_SYSTEM_PROMPT = """You are an expert Site Reliability Engineer (SRE) and DevOps AI assistant
specializing in log analysis, anomaly detection, and predictive issue identification.

Your job is to analyze server/application logs and metrics from Dynatrace and provide:
1. A health assessment of the system
2. Detected issues with severity ratings
3. Predicted future issues based on trends and patterns
4. Root cause hypothesis for any anomalies
5. Actionable recommendations

Always respond in strict JSON format matching the schema provided.
Be precise, technical, and actionable. Prioritize critical issues.

Log severity mapping:
- ERROR/CRITICAL: Production-impacting, needs immediate attention
- WARN: Potential issues, should be investigated soon
- INFO: Normal operations
- DEBUG: Verbose diagnostic info

Issue categories: PERFORMANCE, AVAILABILITY, ERROR_RATE, MEMORY, CPU, DATABASE,
NETWORK, SECURITY, DEPENDENCY, CONFIGURATION
"""

AGENT_SYSTEM_PROMPT = """You are an intelligent SRE AI Agent integrated with Dynatrace and a Linux server.
You have real-time access to:
- Application logs (error rates, warnings, stack traces)
- System metrics (CPU, memory, disk, network)
- Active Dynatrace problems and alerts
- Deployment events and configuration changes

You help engineers:
- Diagnose production issues quickly
- Understand health trends
- Predict and prevent failures
- Get actionable remediation steps

Be concise, technical, and direct. Format responses with markdown.
When you detect critical issues, highlight them prominently.
Always suggest next diagnostic steps.
"""


# ── Claude Service ─────────────────────────────────────────────────────────────

class ClaudeService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL

    # ── Log batch analysis ─────────────────────────────────────────────────────

    async def analyze_logs(
        self,
        logs: List[LogEntry],
        metrics: Optional[List[ServiceMetrics]] = None,
        problems: Optional[List[Dict[str, Any]]] = None,
    ) -> AnalysisResult:
        """Analyze a batch of logs and return structured insights."""

        log_text = self._format_logs_for_prompt(logs)
        metrics_text = self._format_metrics_for_prompt(metrics or [])
        problems_text = self._format_problems_for_prompt(problems or [])

        prompt = f"""Analyze the following server logs, metrics, and active problems.
Provide a comprehensive health assessment and issue predictions.

=== ACTIVE DYNATRACE PROBLEMS ===
{problems_text}

=== SYSTEM METRICS ===
{metrics_text}

=== RECENT LOGS ({len(logs)} entries) ===
{log_text}

=== REQUIRED JSON RESPONSE SCHEMA ===
{{
  "summary": "<2-3 sentence executive summary>",
  "health_assessment": "<detailed technical assessment>",
  "overall_health_score": <0-100>,
  "anomalies": ["<anomaly 1>", "<anomaly 2>", ...],
  "root_cause_hypothesis": "<if issues exist, most likely root cause>",
  "recommendations": ["<actionable step 1>", "<actionable step 2>", ...],
  "issues": [
    {{
      "category": "<IssueCategory>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW|INFO>",
      "title": "<short title>",
      "description": "<detailed description>",
      "affected_services": ["<service1>", ...],
      "confidence": <0.0-1.0>,
      "evidence": ["<log line or pattern>", ...],
      "recommendation": "<specific fix>",
      "estimated_impact": "<user / business impact>"
    }}
  ]
}}

Respond ONLY with the JSON object. No preamble, no markdown fences."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                system=ANALYSIS_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            raw = response.content[0].text.strip()
            # Strip any accidental markdown fences
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw)

            issues = []
            for issue_data in data.get("issues", []):
                issues.append(
                    PredictedIssue(
                        id=str(uuid.uuid4()),
                        category=IssueCategory(issue_data.get("category", "PERFORMANCE")),
                        severity=SeverityLevel(issue_data.get("severity", "MEDIUM")),
                        title=issue_data["title"],
                        description=issue_data["description"],
                        affected_services=issue_data.get("affected_services", []),
                        confidence=float(issue_data.get("confidence", 0.5)),
                        evidence=issue_data.get("evidence", []),
                        recommendation=issue_data.get("recommendation", ""),
                        estimated_impact=issue_data.get("estimated_impact", ""),
                        predicted_at=datetime.now(timezone.utc),
                    )
                )

            return AnalysisResult(
                summary=data.get("summary", "Analysis complete."),
                health_assessment=data.get("health_assessment", ""),
                issues_detected=issues,
                anomalies=data.get("anomalies", []),
                recommendations=data.get("recommendations", []),
                root_cause_hypothesis=data.get("root_cause_hypothesis"),
                analyzed_log_count=len(logs),
                analysis_timestamp=datetime.now(timezone.utc),
                model_used=self.model,
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude JSON response: {e}")
            return self._fallback_analysis(logs)
        except anthropic.APIError as e:
            logger.error(f"Anthropic API error: {e}")
            raise

    # ── Streaming chat agent ───────────────────────────────────────────────────

    def chat_stream(
        self,
        user_message: str,
        history: List[AgentMessage],
        context: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream a conversational response from Claude."""

        messages = []
        for msg in history[-10:]:  # Keep last 10 turns for context
            messages.append({"role": msg.role, "content": msg.content})

        content = user_message
        if context:
            content = f"=== LIVE SYSTEM CONTEXT ===\n{context}\n\n=== USER QUESTION ===\n{user_message}"

        messages.append({"role": "user", "content": content})

        # Use synchronous streaming and yield chunks
        with self.client.messages.stream(
            model=self.model,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            system=AGENT_SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield text

    def chat(
        self,
        user_message: str,
        history: List[AgentMessage],
        context: Optional[str] = None,
    ) -> str:
        """Non-streaming chat response."""
        messages = []
        for msg in history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})

        content = user_message
        if context:
            content = f"=== LIVE SYSTEM CONTEXT ===\n{context}\n\n=== USER QUESTION ===\n{user_message}"

        messages.append({"role": "user", "content": content})

        response = self.client.messages.create(
            model=self.model,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            system=AGENT_SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text

    # ── Quick anomaly check ────────────────────────────────────────────────────

    async def quick_anomaly_check(self, recent_logs: List[LogEntry]) -> Dict[str, Any]:
        """Lightweight check — returns anomaly flag + one-liner description."""
        error_count = sum(1 for l in recent_logs if l.level in ("ERROR", "CRITICAL"))
        warn_count  = sum(1 for l in recent_logs if l.level == "WARN")
        total       = len(recent_logs)

        if total == 0:
            return {"anomaly": False, "description": "No logs to analyse."}

        error_rate = error_count / total * 100

        if error_rate > 20 or error_count > 10:
            severity = "HIGH"
        elif error_rate > 10 or error_count > 5:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        sample_errors = [l.message for l in recent_logs if l.level == "ERROR"][:3]

        return {
            "anomaly": error_rate > 5,
            "severity": severity,
            "error_rate_pct": round(error_rate, 2),
            "error_count": error_count,
            "warn_count": warn_count,
            "total_logs": total,
            "sample_errors": sample_errors,
            "description": (
                f"{error_count} errors ({error_rate:.1f}%) in last batch. "
                f"Severity: {severity}."
            ),
        }

    # ── Formatting helpers ─────────────────────────────────────────────────────

    def _format_logs_for_prompt(self, logs: List[LogEntry]) -> str:
        lines = []
        for log in logs[:150]:  # cap to avoid token overflow
            ts = log.timestamp.strftime("%H:%M:%S")
            lines.append(f"[{ts}] [{log.level:8s}] [{log.service:25s}] {log.message}")
        return "\n".join(lines)

    def _format_metrics_for_prompt(self, metrics: List[ServiceMetrics]) -> str:
        if not metrics:
            return "No metrics available."
        lines = []
        for m in metrics:
            lines.append(
                f"  {m.service:25s} | error_rate={m.error_rate:5.1f}% "
                f"| p50_ms={m.avg_response_ms:7.0f} "
                f"| avail={m.availability:6.2f}% "
                f"| cpu={m.cpu_usage or 0:4.0f}% "
                f"| mem={m.memory_usage or 0:4.0f}%"
            )
        return "\n".join(lines)

    def _format_problems_for_prompt(self, problems: List[Dict]) -> str:
        if not problems:
            return "No active Dynatrace problems."
        lines = []
        for p in problems:
            lines.append(
                f"  [{p.get('severityLevel','?'):12s}] {p.get('title','?')} "
                f"(ID: {p.get('problemId','?')}, status={p.get('status','?')})"
            )
        return "\n".join(lines)

    def _fallback_analysis(self, logs: List[LogEntry]) -> AnalysisResult:
        """Return a basic analysis when Claude API fails."""
        error_count = sum(1 for l in logs if l.level == "ERROR")
        return AnalysisResult(
            summary=f"Fallback analysis: {error_count} errors detected in {len(logs)} log entries.",
            health_assessment="Claude API unavailable — basic log counts only.",
            issues_detected=[],
            anomalies=[f"{error_count} ERROR-level log entries detected"] if error_count else [],
            recommendations=["Check Anthropic API key and connectivity."],
            analyzed_log_count=len(logs),
            analysis_timestamp=datetime.now(timezone.utc),
            model_used="fallback",
        )


# Singleton
claude_service = ClaudeService()
