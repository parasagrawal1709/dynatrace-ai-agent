#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  test_local.sh — smoke test all API endpoints
#  Requires the backend to be running on :8000
# ═══════════════════════════════════════════════════════════════

BASE="http://localhost:8000"
GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

pass=0; fail=0

check() {
  local name="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    echo -e "${GREEN}✓${NC} $name (HTTP $code)"
    ((pass++))
  else
    echo -e "${RED}✗${NC} $name (HTTP $code)"
    ((fail++))
  fi
}

echo -e "\n${CYAN}Running smoke tests against $BASE …${NC}\n"

check "Ping"                 "$BASE/ping"
check "Health summary"       "$BASE/api/health/summary"
check "System health"        "$BASE/api/health/system"
check "Recent logs"          "$BASE/api/logs/recent?minutes=5&limit=20"
check "Error logs"           "$BASE/api/logs/errors?minutes=30"
check "Log stats"            "$BASE/api/logs/stats?minutes=60"
check "Quick anomaly check"  "$BASE/api/analysis/quick-check"
check "Dynatrace problems"   "$BASE/api/dynatrace/problems"
check "Dynatrace metrics"    "$BASE/api/dynatrace/metrics"
check "Dynatrace events"     "$BASE/api/dynatrace/events"
check "Dynatrace status"     "$BASE/api/dynatrace/status"
check "Agent context"        "$BASE/api/agent/context"
check "Swagger docs"         "$BASE/docs"

echo ""
echo -e "Results: ${GREEN}$pass passed${NC}  ${RED}$fail failed${NC}"
[ "$fail" -eq 0 ] && exit 0 || exit 1
