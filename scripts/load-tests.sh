#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

SCENARIO="${1:-smoke}"
FAILED=0

echo "========================================"
echo "  Tests de charge k6 — scenario: $SCENARIO"
echo "========================================"

run_test() {
    local name="$1"
    local file="$2"
    echo ""
    echo "--- $name ---"
    if SCENARIO="$SCENARIO" k6 run "$file"; then
        echo "✓ $name OK"
    else
        echo "✗ $name FAILED"
        FAILED=$((FAILED + 1))
    fi
}

run_test "GraphQL Vehicles" "load-tests/targets/graphql-vehicles.js"
run_test "REST Alerts"      "load-tests/targets/rest-alerts.js"
run_test "gRPC Location"    "load-tests/targets/grpc-location.js"

echo ""
echo "========================================"
if [ "$FAILED" -eq 0 ]; then
    echo "  Tous les tests sont passés."
else
    echo "  $FAILED test(s) en échec."
fi
echo "========================================"

exit "$FAILED"
