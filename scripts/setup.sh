#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  setup.sh — one-shot local setup for Dynatrace AI Agent
#  Usage: bash scripts/setup.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

step() { echo -e "\n${CYAN}▶ $*${NC}"; }
ok()   { echo -e "${GREEN}✓ $*${NC}"; }
err()  { echo -e "${RED}✗ $*${NC}"; exit 1; }

# ── 1. Check prerequisites ──────────────────────────────────────
step "Checking prerequisites …"
command -v python3 >/dev/null || err "python3 not found"
command -v node    >/dev/null || err "node not found (need v18+)"
command -v npm     >/dev/null || err "npm not found"
ok "All prerequisites found"

# ── 2. .env ────────────────────────────────────────────────────
step "Setting up .env …"
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${RED}⚠  Please edit .env and add your ANTHROPIC_API_KEY${NC}"
else
  ok ".env already exists"
fi

# ── 3. Backend virtualenv ──────────────────────────────────────
step "Creating Python virtual environment …"
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r backend/requirements.txt
ok "Backend deps installed"
deactivate

# ── 4. Frontend deps ───────────────────────────────────────────
step "Installing frontend dependencies …"
cd frontend && npm install --silent && cd ..
ok "Frontend deps installed"

# ── 5. Done ────────────────────────────────────────────────────
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env and set your ANTHROPIC_API_KEY"
echo "  2. Run:  bash scripts/start_dev.sh"
echo "     — or — "
echo "  2. Run:  docker compose up --build"
echo ""
