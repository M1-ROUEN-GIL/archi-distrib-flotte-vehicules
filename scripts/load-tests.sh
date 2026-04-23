#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

MODE="${1:-}"
FAILED=0
PF_PID=""

if [[ "$MODE" != "docker" && "$MODE" != "minikube" ]]; then
    echo "Usage : $0 <docker|minikube>" >&2
    echo "" >&2
    echo "  docker    Tests contre l'environnement Docker Compose (localhost)" >&2
    echo "  minikube  Tests contre le cluster Minikube (flotte.local)" >&2
    exit 1
fi

# ── URLs selon le mode ────────────────────────────────────────────────────────

if [[ "$MODE" == "docker" ]]; then
    export BASE_URL="http://localhost:4000"
    export GRPC_URL="localhost:50051"
    export KEYCLOAK_URL="http://localhost:8180/auth/realms/gestion-flotte/protocol/openid-connect/token"
else
    export BASE_URL="http://flotte.local"
    export GRPC_URL="localhost:50051"
    export KEYCLOAK_URL="http://flotte.local/auth/realms/gestion-flotte/protocol/openid-connect/token"

    # Port-forward gRPC pour minikube
    echo "🔌 Ouverture du port-forward gRPC (location-service:50051)..."
    kubectl port-forward svc/location-service 50051:50051 -n flotte-namespace &>/dev/null &
    PF_PID=$!
    sleep 2
fi

cleanup() {
    if [[ -n "$PF_PID" ]]; then
        kill "$PF_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# ── Runner ────────────────────────────────────────────────────────────────────

SCENARIOS=("smoke" "load" "stress")

echo "========================================"
echo "  Tests de charge k6 — mode : $MODE"
echo "  Scénarios : smoke → load → stress"
echo "========================================"

run_test() {
    local name="$1"
    local file="$2"
    local scenario="$3"
    echo ""
    echo "--- $name [$scenario] ---"
    if SCENARIO="$scenario" k6 run "$file"; then
        echo "✓ $name [$scenario] OK"
    else
        echo "✗ $name [$scenario] FAILED"
        FAILED=$((FAILED + 1))
    fi
}

for SCENARIO in "${SCENARIOS[@]}"; do
    echo ""
    echo "──── Scénario : $SCENARIO ────"

    run_test "GraphQL Vehicles" "load-tests/targets/graphql-vehicles.js" "$SCENARIO"
    run_test "REST Alerts"      "load-tests/targets/rest-alerts.js"       "$SCENARIO"
    run_test "gRPC Location"    "load-tests/targets/grpc-location.js"     "$SCENARIO"
done

echo ""
echo "========================================"
if [[ "$FAILED" -eq 0 ]]; then
    echo "  Tous les tests sont passés."
else
    echo "  $FAILED test(s) en échec."
fi
echo "========================================"

exit "$FAILED"
