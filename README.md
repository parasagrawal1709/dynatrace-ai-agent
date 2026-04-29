# 🧠 Dynatrace AI Agent

> AI-powered server health monitoring, log analysis, and issue prediction — built on **Claude (Anthropic)** + **Dynatrace** with a real-time React dashboard.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Linux Server (local / cloud / on-prem)       │
│                                                                     │
│  ┌────────────────────┐        ┌───────────────────────────────┐    │
│  │   React Frontend   │◄──WS──►│     FastAPI Backend           │    │
│  │   (Vite, port 3000)│        │     (Python, port 8000)       │    │
│  │                    │◄──REST─┤                               │    │
│  │  • Health Dashboard│        │  • Background Poller          │    │
│  │  • Live Log Viewer │        │  • Health Scorer              │    │
│  │  • AI Analysis     │        │  • Dynatrace REST client      │    │
│  │  • AI Chat Agent   │        │  • Claude AI service          │    │
│  └────────────────────┘        └──────────┬────────────────────┘    │
│                                           │                         │
│                          ┌────────────────┼────────────────┐        │
│                          ▼                ▼                ▼        │
│                   ┌────────────┐  ┌─────────────┐  ┌──────────┐   │
│                   │ Dynatrace  │  │  Anthropic  │  │ (Future) │   │
│                   │  REST API  │  │ Claude API  │  │  Postgres │   │
│                   │ logs/metrics│  │ analysis/  │  │  Redis    │   │
│                   │ problems   │  │  chat       │  │           │   │
│                   └────────────┘  └─────────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Data Flows

| Flow | Description |
|------|-------------|
| **Poll cycle** | Every 30s: fetch logs + metrics + problems → score health → run AI analysis → broadcast via WebSocket |
| **REST API** | Frontend fetches initial data on load; ad-hoc analysis on demand |
| **WebSocket** | Server pushes real-time log batches, health updates, and AI insights |
| **AI Analysis** | Claude receives formatted logs + metrics + problems → returns JSON with issues, anomalies, root cause, recommendations |
| **AI Chat** | Streaming conversational agent with live system context injected into every message |

---

## 📁 Project Structure

```
dynatrace-ai-agent/
├── backend/                        # FastAPI Python backend
│   ├── main.py                     # App entry point + WebSocket manager
│   ├── config.py                   # Pydantic settings (env vars)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── models/
│   │   └── models.py               # All Pydantic data models
│   ├── routers/
│   │   ├── health.py               # GET /api/health/*
│   │   ├── logs.py                 # GET /api/logs/*
│   │   ├── analysis.py             # POST /api/analysis/run
│   │   ├── dynatrace.py            # GET /api/dynatrace/*
│   │   └── agent.py                # POST /api/agent/chat (streaming)
│   └── services/
│       ├── dynatrace_service.py    # Dynatrace API wrapper (+ demo mode)
│       ├── claude_service.py       # Claude API wrapper (analysis + chat)
│       ├── health_scorer.py        # Weighted health score calculator
│       └── background_tasks.py     # Poll loop + WebSocket broadcaster
│
├── frontend/                       # React + Vite frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf                  # Nginx for Docker deployment
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx                # React entry
│       ├── App.jsx                 # Root component + tab routing
│       ├── hooks/
│       │   └── useWebSocket.js     # WS state hook
│       ├── services/
│       │   └── api.js              # All REST + streaming API calls
│       ├── components/
│       │   ├── Header.jsx          # Top bar with health score
│       │   ├── HealthDashboard.jsx # Service cards + score rings
│       │   ├── LogViewer.jsx       # Filterable real-time log table
│       │   ├── AnalysisPanel.jsx   # AI issues + recommendations
│       │   └── AgentChat.jsx       # Streaming chat with SRE agent
│       └── styles/
│           └── globals.css         # CSS variables + base styles
│
├── scripts/
│   ├── setup.sh                    # One-shot local setup
│   ├── start_dev.sh                # Launch backend + frontend
│   └── test_local.sh               # Smoke test all endpoints
│
├── docker-compose.yml              # Full stack Docker deployment
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Quick Start — Local Linux Setup

### Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Python | 3.11 | `apt install python3.11 python3.11-venv` |
| Node.js | 18+ | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash -` |
| npm | 9+ | Included with Node |
| curl | any | `apt install curl` |

### Step 1 — Clone and configure

```bash
git clone https://github.com/yourorg/dynatrace-ai-agent.git
cd dynatrace-ai-agent

# Run the automated setup script
bash scripts/setup.sh

# Edit .env — MINIMUM required field:
nano .env
# Set: ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

### Step 2 — Start (development mode)

```bash
bash scripts/start_dev.sh
```

This starts:
- **Backend** → http://localhost:8000 (with auto-reload)
- **Frontend** → http://localhost:3000
- **API Docs** → http://localhost:8000/docs

### Step 3 — Verify everything works

```bash
# In a new terminal, while the servers are running:
bash scripts/test_local.sh
```

You should see all 13 endpoints returning HTTP 200.

---

## 🐳 Docker Deployment

```bash
# Copy and edit env file
cp .env.example .env
nano .env   # set ANTHROPIC_API_KEY at minimum

# Build and start everything
docker compose up --build

# Access:
# Frontend → http://localhost:80
# Backend  → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

To run in the background:

```bash
docker compose up --build -d
docker compose logs -f   # stream logs
docker compose down      # stop
```

---

## 🔌 Connecting to Real Dynatrace

By default `DEMO_MODE=true` uses synthetic data. To connect to your Dynatrace tenant:

### 1. Create a Dynatrace API token

In Dynatrace UI → **Settings → Integration → Dynatrace API → Generate token**

Required scopes:
- `logs.read`
- `metrics.read`
- `problems.read`
- `events.read`

### 2. Update .env

```bash
DEMO_MODE=false
DT_ENV_URL=https://YOUR_TENANT_ID.live.dynatrace.com
DT_API_TOKEN=dt0c01.XXXXXXXXXXXXXXXXXXXX
```

### 3. Restart the backend

```bash
# Dev mode
bash scripts/start_dev.sh

# Docker
docker compose restart backend
```

---

## ⚙️ Configuration Reference

All settings live in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | **Required.** Your Anthropic API key |
| `DEMO_MODE` | `true` | Use synthetic data (no Dynatrace needed) |
| `DT_ENV_URL` | — | Dynatrace tenant URL |
| `DT_API_TOKEN` | — | Dynatrace API token |
| `POLL_INTERVAL_SECONDS` | `30` | How often to fetch data and run analysis |
| `LOG_LOOKBACK_MINUTES` | `5` | Log window per poll cycle |
| `WEIGHT_ERROR_RATE` | `0.35` | Error rate weight in health score |
| `WEIGHT_RESPONSE_TIME` | `0.25` | Response time weight |
| `WEIGHT_AVAILABILITY` | `0.30` | Availability weight |
| `WEIGHT_THROUGHPUT` | `0.10` | Throughput weight |

---

## 🔌 API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/system` | Full health for all services |
| GET | `/api/health/summary` | Quick numeric summary |
| GET | `/api/health/service/{name}` | Health for a specific service |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs/recent` | Recent logs (params: `minutes`, `limit`, `level`, `service`) |
| GET | `/api/logs/errors` | Errors + criticals only |
| GET | `/api/logs/stats` | Volume breakdown by level/service |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/run` | Trigger full Claude AI analysis |
| GET | `/api/analysis/quick-check` | Fast heuristic anomaly check (no AI) |

### Dynatrace

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dynatrace/problems` | Active Dynatrace problems |
| GET | `/api/dynatrace/metrics` | Service metrics |
| GET | `/api/dynatrace/events` | Deployment/config events |
| GET | `/api/dynatrace/status` | Connection status |

### AI Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/chat` | Non-streaming chat |
| POST | `/api/agent/chat/stream` | Streaming SSE chat |
| GET | `/api/agent/context` | View live context injected into agent |

### WebSocket

Connect to `ws://localhost:8000/ws` — receives JSON messages:

| `type` | Description |
|--------|-------------|
| `health_update` | Service health scores (every poll) |
| `log_batch` | Latest log entries (every poll) |
| `anomaly_check` | Quick anomaly flag (every poll) |
| `ai_analysis` | Full Claude analysis result (every N polls or on anomaly) |

---

## 🧠 How the AI Works

### Health Scoring

Each service gets a 0–100 score using a weighted formula:

```
score = (error_rate_score  × 0.35)
      + (response_time_score × 0.25)
      + (availability_score  × 0.30)
      + (throughput_score    × 0.10)

Penalties applied for: CPU > 85%, Memory > 90%

HEALTHY  = score ≥ 80
DEGRADED = score ≥ 50
CRITICAL = score < 50
```

### Log Analysis (Claude)

Every N poll cycles, Claude receives:
1. Last 150 log lines (formatted as text)
2. Current metrics for all services
3. Active Dynatrace problems

Claude returns structured JSON with:
- **Summary** — executive overview
- **Issues** — detected problems with severity, evidence, confidence score
- **Root cause hypothesis** — most likely underlying cause
- **Anomalies** — unusual patterns in the logs
- **Recommendations** — specific actionable steps

### AI Chat Agent

The conversational agent automatically receives live context:
- System health score
- Active problems
- Recent error logs
- Service metrics snapshot

This means you can ask natural questions like:
> *"Why is payment-service degraded?"*
> *"What's the risk of an outage in the next 30 minutes?"*
> *"Show me all memory-related issues from the last hour."*

---

## 🔒 Production Checklist

Before going to production:

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Use a secrets manager (Vault, AWS Secrets Manager) instead of `.env`
- [ ] Add authentication to the frontend (e.g. Keycloak, Auth0)
- [ ] Add rate limiting to `/api/agent/chat` (Claude API cost control)
- [ ] Add a database (Postgres) to persist analysis history
- [ ] Set up TLS/HTTPS on the Nginx reverse proxy
- [ ] Configure log rotation on the Linux server
- [ ] Set `POLL_INTERVAL_SECONDS` to a value that matches your Dynatrace DPU quota

---

## 🤝 Contributing

Pull requests welcome. Key areas for contribution:
- Additional Dynatrace metric types (RUM, synthetics, infrastructure)
- Database persistence layer for analysis history
- Alert integrations (PagerDuty, Slack, email)
- Multi-tenant support
- Prometheus metrics export
