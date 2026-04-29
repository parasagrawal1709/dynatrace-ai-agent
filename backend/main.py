"""
Dynatrace AI Agent - FastAPI Backend
Integrates Dynatrace logs/metrics with Claude AI for health monitoring & issue prediction
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routers import health, logs, analysis, dynatrace, agent
from services.background_tasks import BackgroundTaskManager

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── WebSocket connection manager ────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead.append(connection)
        for c in dead:
            self.active_connections.remove(c)


ws_manager = ConnectionManager()
task_manager = BackgroundTaskManager(ws_manager)


# ── Lifespan ────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Dynatrace AI Agent backend …")
    asyncio.create_task(task_manager.start_polling())
    yield
    logger.info("🛑 Shutting down …")
    await task_manager.stop()


# ── App ─────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Dynatrace AI Agent",
    description="AI-powered log analysis and health monitoring using Claude + Dynatrace",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────────
app.include_router(health.router,     prefix="/api/health",     tags=["Health"])
app.include_router(logs.router,       prefix="/api/logs",       tags=["Logs"])
app.include_router(analysis.router,   prefix="/api/analysis",   tags=["Analysis"])
app.include_router(dynatrace.router,  prefix="/api/dynatrace",  tags=["Dynatrace"])
app.include_router(agent.router,      prefix="/api/agent",      tags=["AI Agent"])


# ── WebSocket endpoint ──────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            # Echo back with server timestamp
            await websocket.send_text(json.dumps({
                "type": "ack",
                "received": msg,
                "server_time": datetime.utcnow().isoformat(),
            }))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# ── Root ─────────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "Dynatrace AI Agent",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/ping")
async def ping():
    return {"pong": True, "timestamp": datetime.utcnow().isoformat()}
