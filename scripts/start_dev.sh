#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  start_dev.sh — start backend + frontend for local development
#  Usage: bash scripts/start_dev.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

cleanup() {
  echo -e "\n${RED}Shutting down …${NC}"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Load env
if [ -f .env ]; then
  set -a; source .env; set +a
fi

# ── Backend ────────────────────────────────────────────────────
echo -e "${CYAN}▶ Starting backend (FastAPI) on :8000 …${NC}"
source backend/.venv/bin/activate
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..
deactivate

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in $(seq 1 20); do
  if curl -s http://localhost:8000/ping >/dev/null 2>&1; then
    echo -e " ${GREEN}✓${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

# ── Frontend ───────────────────────────────────────────────────
echo -e "${CYAN}▶ Starting frontend (Vite) on :3000 …${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  🚀 Dynatrace AI Agent is running!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "  Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend:   ${CYAN}http://localhost:8000${NC}"
echo -e "  API Docs:  ${CYAN}http://localhost:8000/docs${NC}"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

wait
