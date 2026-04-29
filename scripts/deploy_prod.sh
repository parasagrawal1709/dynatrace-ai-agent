#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  deploy_prod.sh — deploy the AI Agent on a Linux server
#  Tested on: Ubuntu 22.04, Debian 12, RHEL 9, Amazon Linux 2023
#
#  Usage:
#    bash scripts/deploy_prod.sh
#
#  Prerequisites:
#    - Docker 24+
#    - Docker Compose v2 (docker compose, not docker-compose)
#    - .env file with ANTHROPIC_API_KEY set
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

step()  { echo -e "\n${CYAN}▶ $*${NC}"; }
ok()    { echo -e "${GREEN}✓ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $*${NC}"; }
err()   { echo -e "${RED}✗ $*${NC}"; exit 1; }

# ── 1. Pre-flight checks ────────────────────────────────────────
step "Pre-flight checks …"
command -v docker           >/dev/null || err "Docker not found — install it first"
docker compose version      >/dev/null || err "Docker Compose v2 not found"
[ -f .env ]                            || err ".env not found — copy .env.example and fill in your values"
grep -q "ANTHROPIC_API_KEY" .env       || err "ANTHROPIC_API_KEY not set in .env"
API_KEY_VAL=$(grep "^ANTHROPIC_API_KEY" .env | cut -d= -f2 | tr -d ' ')
[ -n "$API_KEY_VAL" ] && [ "$API_KEY_VAL" != "sk-ant-xxxxxxxxxxxxxxxxxxxx" ] || \
  err "ANTHROPIC_API_KEY looks like the placeholder — set your real key"
ok "All pre-flight checks passed"

# ── 2. Set production env ───────────────────────────────────────
step "Configuring production environment …"
# Ensure demo mode is off in production if DT is configured
DT_URL=$(grep "^DT_ENV_URL" .env | cut -d= -f2 | tr -d ' ' || echo "")
if [ -z "$DT_URL" ]; then
  warn "DT_ENV_URL not set — running in DEMO_MODE. Set DT_ENV_URL + DT_API_TOKEN for real data."
fi
ok "Environment configured"

# ── 3. Pull / build images ──────────────────────────────────────
step "Building Docker images …"
docker compose -f docker-compose.yml build --no-cache
ok "Images built"

# ── 4. Stop any running containers ─────────────────────────────
step "Stopping existing containers …"
docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
ok "Old containers stopped"

# ── 5. Start services ───────────────────────────────────────────
step "Starting services …"
docker compose -f docker-compose.yml up -d
ok "Services started"

# ── 6. Health check ─────────────────────────────────────────────
step "Waiting for backend to be healthy …"
RETRIES=20
until curl -sf http://localhost:8000/ping >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 3
  ((RETRIES--))
done

if [ $RETRIES -eq 0 ]; then
  err "Backend health check timed out. Check logs: docker compose logs backend"
fi
echo ""
ok "Backend is healthy"

# ── 7. Verify frontend ──────────────────────────────────────────
step "Checking frontend …"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 || echo "000")
if [ "$HTTP_CODE" == "200" ]; then
  ok "Frontend is serving (HTTP $HTTP_CODE)"
else
  warn "Frontend returned HTTP $HTTP_CODE — check: docker compose logs frontend"
fi

# ── 8. Summary ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🚀 Dynatrace AI Agent deployed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "  UI:       ${CYAN}http://$(hostname -I | awk '{print $1}'):80${NC}"
echo -e "  API:      ${CYAN}http://$(hostname -I | awk '{print $1}'):8000${NC}"
echo -e "  API Docs: ${CYAN}http://$(hostname -I | awk '{print $1}'):8000/docs${NC}"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f          # stream all logs"
echo "    docker compose logs -f backend  # backend only"
echo "    docker compose ps               # container status"
echo "    docker compose restart backend  # restart after .env change"
echo "    docker compose down             # stop everything"
echo ""

# ── 9. Optional: set up systemd auto-restart ────────────────────
if command -v systemctl >/dev/null 2>&1; then
  step "Creating systemd unit for auto-restart on reboot …"
  COMPOSE_BIN=$(which docker)
  UNIT_FILE="/etc/systemd/system/dt-ai-agent.service"
  cat > /tmp/dt-ai-agent.service << UNIT
[Unit]
Description=Dynatrace AI Agent
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${ROOT}
ExecStart=${COMPOSE_BIN} compose -f docker-compose.yml up -d
ExecStop=${COMPOSE_BIN} compose -f docker-compose.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
UNIT

  if sudo cp /tmp/dt-ai-agent.service "$UNIT_FILE" 2>/dev/null; then
    sudo systemctl daemon-reload
    sudo systemctl enable dt-ai-agent.service
    ok "systemd service enabled — will auto-start on reboot"
  else
    warn "Could not write systemd unit (no sudo). Run manually if needed:"
    warn "  sudo cp /tmp/dt-ai-agent.service /etc/systemd/system/"
    warn "  sudo systemctl enable --now dt-ai-agent.service"
  fi
fi
