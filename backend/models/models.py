"""
Data models — shared across the entire backend.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────────────

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH     = "HIGH"
    MEDIUM   = "MEDIUM"
    LOW      = "LOW"
    INFO     = "INFO"


class HealthStatus(str, Enum):
    HEALTHY   = "HEALTHY"
    DEGRADED  = "DEGRADED"
    CRITICAL  = "CRITICAL"
    UNKNOWN   = "UNKNOWN"


class IssueCategory(str, Enum):
    PERFORMANCE      = "PERFORMANCE"
    AVAILABILITY     = "AVAILABILITY"
    ERROR_RATE       = "ERROR_RATE"
    MEMORY           = "MEMORY"
    CPU              = "CPU"
    DATABASE         = "DATABASE"
    NETWORK          = "NETWORK"
    SECURITY         = "SECURITY"
    DEPENDENCY       = "DEPENDENCY"
    CONFIGURATION    = "CONFIGURATION"


# ── Log Models ─────────────────────────────────────────────────────────────────

class LogEntry(BaseModel):
    id: str
    timestamp: datetime
    level: str                    # ERROR, WARN, INFO, DEBUG
    service: str
    message: str
    attributes: Dict[str, Any] = {}
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    host: Optional[str] = None


class LogBatch(BaseModel):
    logs: List[LogEntry]
    total: int
    from_time: datetime
    to_time: datetime


# ── Health Models ──────────────────────────────────────────────────────────────

class MetricPoint(BaseModel):
    timestamp: datetime
    value: float


class ServiceMetrics(BaseModel):
    service: str
    error_rate: float             # 0-100 %
    avg_response_ms: float
    availability: float           # 0-100 %
    throughput_rpm: float
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None
    metrics_history: Dict[str, List[MetricPoint]] = {}


class HealthScore(BaseModel):
    service: str
    score: float                  # 0-100
    status: HealthStatus
    breakdown: Dict[str, float]   # component scores
    trend: str                    # improving / stable / degrading
    last_updated: datetime


class SystemHealth(BaseModel):
    overall_score: float
    overall_status: HealthStatus
    services: List[HealthScore]
    active_problems: int
    total_errors_last_hour: int
    timestamp: datetime


# ── Prediction / Issue Models ──────────────────────────────────────────────────

class PredictedIssue(BaseModel):
    id: str
    category: IssueCategory
    severity: SeverityLevel
    title: str
    description: str
    affected_services: List[str]
    confidence: float             # 0-1
    evidence: List[str]           # log lines / patterns that led to prediction
    recommendation: str
    estimated_impact: str
    predicted_at: datetime


class AnalysisResult(BaseModel):
    summary: str
    health_assessment: str
    issues_detected: List[PredictedIssue]
    anomalies: List[str]
    recommendations: List[str]
    root_cause_hypothesis: Optional[str] = None
    analyzed_log_count: int
    analysis_timestamp: datetime
    model_used: str


# ── Agent Chat Models ──────────────────────────────────────────────────────────

class AgentMessage(BaseModel):
    role: str                     # user | assistant
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentRequest(BaseModel):
    message: str
    conversation_history: List[AgentMessage] = []
    include_live_context: bool = True


class AgentResponse(BaseModel):
    message: str
    sources: List[str] = []
    triggered_analysis: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── Dynatrace API response wrappers ───────────────────────────────────────────

class DynatraceLogRecord(BaseModel):
    timestamp: str
    status: Optional[str] = None
    content: str
    additionalColumns: Dict[str, Any] = {}


class DynatraceProblem(BaseModel):
    problemId: str
    title: str
    severityLevel: str
    status: str
    startTime: int
    endTime: Optional[int] = None
    affectedEntities: List[Dict[str, Any]] = []
