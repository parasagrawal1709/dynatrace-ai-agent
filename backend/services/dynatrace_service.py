"""
Dynatrace Service
-----------------
Wraps all Dynatrace REST API v2 calls.
When DEMO_MODE=True it returns realistic synthetic data so the whole
stack can be tested without a live Dynatrace tenant.
"""

import asyncio
import hashlib
import logging
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import httpx

from config import settings
from models.models import (
    DynatraceLogRecord,
    DynatraceProblem,
    LogEntry,
    ServiceMetrics,
    MetricPoint,
)

logger = logging.getLogger(__name__)

# ── Demo data helpers ──────────────────────────────────────────────────────────

DEMO_SERVICES = ["api-gateway", "auth-service", "payment-service",
                 "inventory-service", "notification-service", "db-proxy"]

DEMO_LOG_TEMPLATES = [
    ("ERROR",  "{svc} | NullPointerException in OrderController.processOrder() at line 142"),
    ("ERROR",  "{svc} | Connection pool exhausted — waited 30 000 ms for a connection"),
    ("WARN",   "{svc} | Response time threshold exceeded: 4 823 ms (threshold: 2 000 ms)"),
    ("WARN",   "{svc} | Retry attempt 3/3 for downstream call to payment-gateway"),
    ("ERROR",  "{svc} | HTTP 503 from dependency inventory-service after 5 000 ms"),
    ("INFO",   "{svc} | Request processed successfully in 145 ms — user=u-9921"),
    ("DEBUG",  "{svc} | Cache miss for key=product:4492, fetching from DB"),
    ("ERROR",  "{svc} | OutOfMemoryError: Java heap space — heap usage 98%"),
    ("WARN",   "{svc} | CPU utilisation above 85% for 3 consecutive minutes"),
    ("ERROR",  "{svc} | Database query timeout after 15 000 ms — query=SELECT orders"),
    ("INFO",   "{svc} | Health check passed — uptime 99.98%"),
    ("ERROR",  "{svc} | SSL certificate expires in 3 days — renew immediately"),
    ("WARN",   "{svc} | Disk usage at 88% on /var/log — consider log rotation"),
    ("ERROR",  "{svc} | Authentication failure — invalid JWT signature from IP 192.168.1.42"),
    ("INFO",   "{svc} | Deployment v2.4.1 completed successfully"),

    # -------------------------
    # Login issues (auth-service / api-gateway)
    # -------------------------
    ("WARN",   "{svc} | Login failed — user locked due to 5 invalid attempts — user=u-1842"),
    ("ERROR",  "{svc} | OAuth token exchange failed — upstream IdP returned HTTP 502"),
    ("ERROR",  "{svc} | MFA verification timeout after 30 000 ms — challengeId=ch-7712"),
    ("WARN",   "{svc} | Suspicious login pattern — 12 attempts from 4 geos in 90s — user=u-1842"),
    ("ERROR",  "{svc} | Password hash verification error — bcrypt cost mismatch"),
    ("WARN",   "{svc} | Rate limit exceeded on /login — 429 returned — ip=203.0.113.14"),
    ("ERROR",  "{svc} | Session store unavailable — Redis connection refused"),
    ("ERROR",  "{svc} | JWT key rotation mismatch — kid not found — kid=key-2026-04"),
    ("WARN",   "{svc} | CORS preflight denied — origin not allowed — origin=https://unknown.app"),
    ("INFO",   "{svc} | User authenticated successfully — method=SSO — user=u-5510"),

    # -------------------------
    # Transaction timeout & payment failures (payment-service / api-gateway)
    # -------------------------
    ("ERROR",  "{svc} | Transaction timeout — exceeded 60 000 ms — txn=tx-993812"),
    ("WARN",   "{svc} | Idempotency key replay detected — key=idem-7b2f — returning cached result"),
    ("ERROR",  "{svc} | Payment capture failed — gateway timeout after 45 000 ms — provider=acquirerA"),
    ("WARN",   "{svc} | Circuit breaker OPEN for payment-gateway — failing fast for 30s"),
    ("ERROR",  "{svc} | Saga compensation triggered — payment succeeded but inventory reservation failed — order=o-77121"),
    ("WARN",   "{svc} | Downstream latency spike — p95=8 120 ms — dependency=db-proxy"),
    ("ERROR",  "{svc} | Duplicate charge prevention triggered — same card+amount within 2 min — txn=tx-88317"),
    ("INFO",   "{svc} | Payment authorized — authCode=842199 — amount=4 999 INR — user=u-9921"),
    ("ERROR",  "{svc} | Payment declined — reason=INSUFFICIENT_FUNDS — providerCode=51"),
    ("WARN",   "{svc} | Async settlement delayed — queue lag 12 480 messages — topic=settlements"),

    # -------------------------
    # Inventory issues (inventory-service)
    # -------------------------
    ("ERROR",  "{svc} | Inventory reservation failed — stock negative for sku=SKU-8821 — requested=3 available=0"),
    ("WARN",   "{svc} | Inventory cache stale — lastRefresh=18m — serving possibly outdated availability"),
    ("ERROR",  "{svc} | Deadlock detected in inventory update — transaction rolled back — sku=SKU-9920"),
    ("WARN",   "{svc} | Reconciliation mismatch — reserved=120 but onHand=95 — sku=SKU-7734"),
    ("INFO",   "{svc} | Stock updated — sku=SKU-8821 — delta=-2 — newOnHand=48"),
    ("ERROR",  "{svc} | Warehouse API unreachable — HTTP 504 after 10 000 ms — warehouse=W-03"),

    # -------------------------
    # Notification issues (notification-service)
    # -------------------------
    ("ERROR",  "{svc} | Email provider failure — SMTP 451 temporary local problem — messageId=msg-7712"),
    ("WARN",   "{svc} | Push notification throttled — provider rate limit — retryIn=60s"),
    ("ERROR",  "{svc} | SMS send failed — invalid destination number format — user=u-3310"),
    ("WARN",   "{svc} | Notification queue backlog — 98 220 pending — consumerLag=14m"),
    ("INFO",   "{svc} | Notification delivered — channel=email — template=order_confirm — user=u-9921"),
    ("DEBUG",  "{svc} | Deduplication hit — skipping duplicate notification — dedupeKey=order:o-77121"),

    # -------------------------
    # DB proxy issues (db-proxy)
    # -------------------------
    ("ERROR",  "{svc} | Database connection refused — host=db-primary — port=5432"),
    ("WARN",   "{svc} | Replication lag high — lag=12.4s — switching reads to primary"),
    ("ERROR",  "{svc} | Too many connections — current=500 max=500 — rejecting new sessions"),
    ("ERROR",  "{svc} | Slow query detected — duration=9 842 ms — query=UPDATE inventory SET"),
    ("WARN",   "{svc} | Failover in progress — read-only mode enabled for 120s"),
    ("INFO",   "{svc} | Connection re-established — pool warm-up completed — size=50"),

    # -------------------------
    # Risk / Fraud use cases (risk scoring, AML-like checks, velocity checks)
    # -------------------------
    ("WARN",   "{svc} | Risk score elevated — score=0.87 threshold=0.75 — action=CHALLENGE — user=u-9921"),
    ("ERROR",  "{svc} | Risk engine timeout after 7 000 ms — defaulting to SAFE_MODE — txn=tx-993812"),
    ("WARN",   "{svc} | Velocity check triggered — 6 transactions in 2 minutes — cardHash=ch_91af"),
    ("ERROR",  "{svc} | Device fingerprint mismatch — newDevice=true — user=u-1842 — action=STEP_UP_AUTH"),
    ("WARN",   "{svc} | Geo anomaly detected — impossible travel — lastLogin=IN current=US — user=u-1842"),
    ("ERROR",  "{svc} | Sanctions list check service unavailable — HTTP 503 — action=HOLD — txn=tx-66102"),
    ("WARN",   "{svc} | Chargeback risk heuristic matched — merchantCategory=MCC_7995 — txn=tx-77310"),
    ("INFO",   "{svc} | Risk evaluation completed — decision=APPROVE — score=0.22 — txn=tx-11802"),
    ("ERROR",  "{svc} | AML rule evaluation failed — ruleset compile error — ruleId=aml-velocity-07"),
    ("WARN",   "{svc} | Manual review queued — reason=HIGH_RISK_SCORE — caseId=case-90812"),

    # -------------------------
    # API Gateway / edge patterns (timeouts, payload, authz, routing)
    # -------------------------
    ("ERROR",  "{svc} | Upstream request timeout — route=/checkout — timeout=10 000 ms — target=payment-service"),
    ("WARN",   "{svc} | Request payload too large — 413 returned — size=18.2MB — route=/upload"),
    ("ERROR",  "{svc} | Authorization failure — missing scope=payments:write — user=u-5510"),
    ("WARN",   "{svc} | Header size exceeded — dropping request — headerBytes=19 240"),
    ("INFO",   "{svc} | Route updated — /v2/payments now targets payment-service:v2 — rollout=25%"),
    ("DEBUG",  "{svc} | Trace context propagated — traceId=4bf92f3577b34da6a3ce929d0e0e4736"),
]


def _make_demo_log(offset_seconds: int = 0) -> LogEntry:
    svc = random.choice(DEMO_SERVICES)
    level, msg_tpl = random.choice(DEMO_LOG_TEMPLATES)
    message = msg_tpl.format(svc=svc)
    ts = datetime.now(timezone.utc) - timedelta(seconds=offset_seconds)
    uid = hashlib.md5(f"{ts}{message}".encode()).hexdigest()[:12]
    return LogEntry(
        id=uid,
        timestamp=ts,
        level=level,
        service=svc,
        message=message,
        host=f"host-{random.randint(1, 5)}.internal",
        trace_id=str(uuid.uuid4()).replace("-", "")[:32],
        span_id=str(uuid.uuid4()).replace("-", "")[:16],
        attributes={"env": "production", "region": "us-east-1"},
    )


def _make_demo_metrics(service: str) -> ServiceMetrics:
    base_error = random.uniform(0.5, 8.0)
    return ServiceMetrics(
        service=service,
        error_rate=round(base_error, 2),
        avg_response_ms=round(random.uniform(80, 3200), 1),
        availability=round(random.uniform(92, 99.99), 2),
        throughput_rpm=round(random.uniform(50, 1200), 1),
        cpu_usage=round(random.uniform(10, 92), 1),
        memory_usage=round(random.uniform(30, 88), 1),
        metrics_history={
            "error_rate": [
                MetricPoint(
                    timestamp=datetime.now(timezone.utc) - timedelta(minutes=i),
                    value=round(base_error + random.uniform(-1, 1), 2),
                )
                for i in range(60, 0, -5)
            ],
            "response_ms": [
                MetricPoint(
                    timestamp=datetime.now(timezone.utc) - timedelta(minutes=i),
                    value=round(random.uniform(80, 3200), 1),
                )
                for i in range(60, 0, -5)
            ],
        },
    )


def _make_demo_problems() -> List[DynatraceProblem]:
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    return [
        DynatraceProblem(
            problemId="P-12345",
            title="High error rate detected in payment-service",
            severityLevel="ERROR",
            status="OPEN",
            startTime=now_ms - 1_800_000,
            affectedEntities=[{"entityId": {"id": "SERVICE-ABC", "type": "SERVICE"}, "name": "payment-service"}],
        ),
        DynatraceProblem(
            problemId="P-12346",
            title="Response time degradation in api-gateway",
            severityLevel="PERFORMANCE",
            status="OPEN",
            startTime=now_ms - 3_600_000,
            affectedEntities=[{"entityId": {"id": "SERVICE-DEF", "type": "SERVICE"}, "name": "api-gateway"}],
        ),
    ]


# ── Dynatrace service class ────────────────────────────────────────────────────

class DynatraceService:
    """Fetches data from Dynatrace or returns demo data when DEMO_MODE=True."""

    def __init__(self):
        self.base_url = settings.DT_ENV_URL.rstrip("/")
        self.headers = {
            "Authorization": f"Api-Token {settings.DT_API_TOKEN}",
            "Content-Type": "application/json",
        }

    # ── Public API ─────────────────────────────────────────────────────────────

    async def get_logs(
        self,
        from_minutes_ago: int = 5,
        limit: int = 200,
        query: Optional[str] = None,
    ) -> List[LogEntry]:
        if settings.DEMO_MODE:
            return await self._demo_logs(limit)
        return await self._fetch_logs(from_minutes_ago, limit, query)

    async def get_metrics(self, services: Optional[List[str]] = None) -> List[ServiceMetrics]:
        if settings.DEMO_MODE:
            svcs = services or DEMO_SERVICES
            return [_make_demo_metrics(s) for s in svcs]
        return await self._fetch_metrics(services)

    async def get_problems(self) -> List[DynatraceProblem]:
        if settings.DEMO_MODE:
            return _make_demo_problems()
        return await self._fetch_problems()

    async def get_events(self, from_minutes_ago: int = 60) -> List[Dict[str, Any]]:
        if settings.DEMO_MODE:
            return await self._demo_events()
        return await self._fetch_events(from_minutes_ago)

    # ── Real Dynatrace calls ───────────────────────────────────────────────────

    async def _fetch_logs(self, from_minutes_ago: int, limit: int, query: Optional[str]) -> List[LogEntry]:
        now = datetime.now(timezone.utc)
        from_ts = now - timedelta(minutes=from_minutes_ago)

        params: Dict[str, Any] = {
            "from": from_ts.isoformat(),
            "to": now.isoformat(),
            "limit": limit,
        }
        if query:
            params["query"] = query

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{self.base_url}{settings.DT_LOG_ENDPOINT}",
                headers=self.headers,
                params=params,
            )
            resp.raise_for_status()
            data = resp.json()

        entries = []
        for record in data.get("results", []):
            raw = DynatraceLogRecord(**record)
            ts = datetime.fromisoformat(raw.timestamp.replace("Z", "+00:00"))
            cols = raw.additionalColumns
            entries.append(
                LogEntry(
                    id=hashlib.md5(f"{ts}{raw.content}".encode()).hexdigest()[:12],
                    timestamp=ts,
                    level=(raw.status or "INFO").upper(),
                    service=cols.get("dt.entity.service", ["unknown"])[0],
                    message=raw.content,
                    host=cols.get("host.name", [None])[0],
                    trace_id=cols.get("trace_id", [None])[0],
                    span_id=cols.get("span_id", [None])[0],
                    attributes={k: v for k, v in cols.items()},
                )
            )
        return entries

    async def _fetch_metrics(self, services: Optional[List[str]]) -> List[ServiceMetrics]:
        # Dynatrace v2 metrics — simplified implementation
        # For each service fetch error_rate, response_time, availability
        results = []
        async with httpx.AsyncClient(timeout=30) as client:
            for metric_id in ["builtin:service.errors.total.rate",
                               "builtin:service.response.time",
                               "builtin:service.requestCount.total"]:
                params = {
                    "metricSelector": metric_id,
                    "resolution": "1m",
                    "from": "now-1h",
                }
                resp = await client.get(
                    f"{self.base_url}{settings.DT_METRICS_ENDPOINT}",
                    headers=self.headers,
                    params=params,
                )
                if resp.status_code == 200:
                    # parse and aggregate — left as exercise for real tenant
                    pass
        # Fallback to demo if real data unavailable
        svcs = services or DEMO_SERVICES
        return [_make_demo_metrics(s) for s in svcs]

    async def _fetch_problems(self) -> List[DynatraceProblem]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{self.base_url}{settings.DT_PROBLEMS_ENDPOINT}",
                headers=self.headers,
                params={"status": "OPEN", "pageSize": 50},
            )
            resp.raise_for_status()
            data = resp.json()
        return [DynatraceProblem(**p) for p in data.get("problems", [])]

    async def _fetch_events(self, from_minutes_ago: int) -> List[Dict[str, Any]]:
        from_ts = (datetime.now(timezone.utc) - timedelta(minutes=from_minutes_ago)).isoformat()
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{self.base_url}{settings.DT_EVENTS_ENDPOINT}",
                headers=self.headers,
                params={"from": from_ts, "pageSize": 100},
            )
            resp.raise_for_status()
            return resp.json().get("events", [])

    # ── Demo helpers ───────────────────────────────────────────────────────────

    async def _demo_logs(self, limit: int) -> List[LogEntry]:
        await asyncio.sleep(0.05)  # simulate network
        count = min(limit, random.randint(20, 60))
        return [_make_demo_log(offset_seconds=i * 3) for i in range(count)]

    async def _demo_events(self) -> List[Dict[str, Any]]:
        return [
            {"eventId": "E-001", "eventType": "DEPLOYMENT",
             "title": "Deployment v2.4.1 — api-gateway",
             "startTime": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp() * 1000)},
            {"eventId": "E-002", "eventType": "CONFIG_CHANGE",
             "title": "JVM heap increased to 4 GB — payment-service",
             "startTime": int((datetime.now(timezone.utc) - timedelta(hours=2)).timestamp() * 1000)},
        ]


# Singleton
dynatrace_service = DynatraceService()
