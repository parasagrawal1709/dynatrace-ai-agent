# ═══════════════════════════════════════════════════════════════
#  Makefile — Dynatrace AI Agent
#  Usage: make <target>
# ═══════════════════════════════════════════════════════════════

.PHONY: help setup dev stop test test-backend test-api \
        docker-up docker-down docker-logs docker-build \
        lint format clean

PYTHON   := backend/.venv/bin/python
UVICORN  := backend/.venv/bin/uvicorn
PYTEST   := backend/.venv/bin/pytest
PIP      := backend/.venv/bin/pip

# ── Default ───────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Dynatrace AI Agent — Developer Commands"
	@echo "  ─────────────────────────────────────────"
	@echo "  make setup          First-time setup (virtualenv + npm)"
	@echo "  make dev            Start backend + frontend (hot reload)"
	@echo "  make stop           Kill dev servers"
	@echo ""
	@echo "  make test           Run all tests"
	@echo "  make test-backend   Run backend unit tests only"
	@echo "  make test-api       Smoke-test live API endpoints"
	@echo ""
	@echo "  make docker-up      docker compose up --build"
	@echo "  make docker-down    docker compose down"
	@echo "  make docker-logs    Follow container logs"
	@echo "  make docker-build   Build images without starting"
	@echo ""
	@echo "  make lint           Run ruff linter on backend"
	@echo "  make format         Run black formatter on backend"
	@echo "  make clean          Remove build artefacts"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────
setup:
	@bash scripts/setup.sh

# ── Dev servers ───────────────────────────────────────────────────
dev:
	@bash scripts/start_dev.sh

stop:
	@pkill -f "uvicorn main:app" 2>/dev/null || true
	@pkill -f "vite"             2>/dev/null || true
	@echo "Stopped."

# ── Backend only ──────────────────────────────────────────────────
backend:
	@cd backend && source .venv/bin/activate && \
	  uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# ── Frontend only ─────────────────────────────────────────────────
frontend:
	@cd frontend && npm run dev

# ── Tests ─────────────────────────────────────────────────────────
test: test-backend test-api

test-backend:
	@echo "Running backend unit tests …"
	@cd backend && source .venv/bin/activate && \
	  pytest tests/ -v --tb=short

test-api:
	@bash scripts/test_local.sh

# ── Docker ────────────────────────────────────────────────────────
docker-up:
	docker compose up --build

docker-up-d:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-build:
	docker compose build

docker-restart:
	docker compose restart backend

# ── Code quality ──────────────────────────────────────────────────
lint:
	@cd backend && source .venv/bin/activate && \
	  ruff check . --fix

format:
	@cd backend && source .venv/bin/activate && \
	  black .

# ── Clean ─────────────────────────────────────────────────────────
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc"     -delete              2>/dev/null || true
	rm -rf backend/.venv frontend/node_modules frontend/dist
	@echo "Cleaned."
