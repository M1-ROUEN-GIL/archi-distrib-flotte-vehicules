#!/usr/bin/env bash
set -euo pipefail

# ── Argument ──────────────────────────────────────────────────────────────────

MODE="${1:-}"
if [[ "$MODE" != "docker" && "$MODE" != "minikube" ]]; then
    echo "Usage : $0 <docker|minikube>" >&2
    exit 1
fi

# ── Config ────────────────────────────────────────────────────────────────────

if [[ "$MODE" == "docker" ]]; then
    KC_URL="http://localhost:8180/auth/realms/gestion-flotte/protocol/openid-connect/token"
    GATEWAY_URL="http://localhost:4000/graphql"
    KAFKA_BOOTSTRAP="kafka:9092"
    KAFKA_EXEC=(docker exec -i flotte-kafka)
    KAFKA_BIN="/opt/kafka/bin/kafka-console-producer.sh"
else
    KC_URL="http://flotte.local/auth/realms/gestion-flotte/protocol/openid-connect/token"
    GATEWAY_URL="http://flotte.local/graphql"
    KAFKA_BOOTSTRAP="kafka-service:9092"
    KAFKA_EXEC=(kubectl exec -i -n flotte-namespace deploy/kafka-deployment --)
    KAFKA_BIN="/usr/bin/kafka-console-producer"
fi

# ── Helpers ───────────────────────────────────────────────────────────────────

now() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

rand_float() {
    awk -v base="$1" -v range="$2" -v seed="$RANDOM$RANDOM" \
        'BEGIN { srand(seed+0); printf "%.4f", base + (rand() - 0.5) * range }'
}

kafka_send() {
    local topic="$1" payload="$2"
    echo "$payload" | "${KAFKA_EXEC[@]}" \
        "$KAFKA_BIN" \
        --topic "$topic" \
        --bootstrap-server "$KAFKA_BOOTSTRAP" 2>/dev/null
}

# ── Auth ──────────────────────────────────────────────────────────────────────

echo ""
echo "🚛  Simulateur d'alertes — mode : $MODE"
echo "📡  Kafka : $KAFKA_BOOTSTRAP"
echo "🌐  Gateway : $GATEWAY_URL"
echo ""
echo "🔑  Authentification Keycloak..."

TOKEN=$(curl -sf "$KC_URL" \
    -d "grant_type=password&client_id=admin-cli&username=admin&password=admin" \
    | jq -r '.access_token')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
    echo "❌  Impossible d'obtenir le token Keycloak." >&2
    exit 1
fi

# ── Récupération des IDs ──────────────────────────────────────────────────────

echo "📋  Récupération des véhicules et conducteurs..."

GQL=$(curl -sf "$GATEWAY_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"query":"{ vehicles { id plate_number } drivers { items { id first_name last_name } } }"}')

mapfile -t V_IDS    < <(echo "$GQL" | jq -r '.data.vehicles[].id')
mapfile -t V_PLATES < <(echo "$GQL" | jq -r '.data.vehicles[].plate_number')
mapfile -t D_IDS    < <(echo "$GQL" | jq -r '.data.drivers.items[].id')
mapfile -t D_FNAMES < <(echo "$GQL" | jq -r '.data.drivers.items[].first_name')
mapfile -t D_LNAMES < <(echo "$GQL" | jq -r '.data.drivers.items[].last_name')

NB_V=${#V_IDS[@]}
NB_D=${#D_IDS[@]}

if [[ $NB_V -eq 0 ]]; then
    echo "❌  Aucun véhicule trouvé. Créez-en d'abord via le frontend." >&2
    exit 1
fi

echo "✅  $NB_V véhicule(s), $NB_D conducteur(s) trouvés."
echo ""
echo "⚡  Publication des événements..."
echo ""

# ── Événements ────────────────────────────────────────────────────────────────

speed_exceeded() {
    local speed="$1" limit="$2" with_driver="${3:-true}"
    local vi=$((RANDOM % NB_V))
    local driver_json="null"
    if [[ "$with_driver" == "true" && $NB_D -gt 0 ]]; then
        local di=$((RANDOM % NB_D)); driver_json="\"${D_IDS[$di]}\""
    fi
    kafka_send "flotte.location.events" \
        "{\"event_type\":\"SPEED_EXCEEDED\",\"vehicle_id\":\"${V_IDS[$vi]}\",\"driver_id\":$driver_json,\"latitude\":$(rand_float 49.4431 0.1),\"longitude\":$(rand_float 1.0993 0.1),\"speed_kmh\":$speed,\"speed_limit_kmh\":$limit,\"occurred_at\":\"$(now)\"}"
    echo "  ✓ 🚨 Excès de vitesse — ${V_PLATES[$vi]} à ${speed} km/h (limite ${limit})"
}

geofencing_breach() {
    local zone="$1" with_driver="${2:-true}"
    local vi=$((RANDOM % NB_V))
    local driver_json="null"
    if [[ "$with_driver" == "true" && $NB_D -gt 0 ]]; then
        local di=$((RANDOM % NB_D)); driver_json="\"${D_IDS[$di]}\""
    fi
    kafka_send "flotte.location.events" \
        "{\"event_type\":\"GEOFENCING_BREACH\",\"vehicle_id\":\"${V_IDS[$vi]}\",\"driver_id\":$driver_json,\"latitude\":$(rand_float 49.4431 0.5),\"longitude\":$(rand_float 1.0993 0.5),\"zone_name\":\"$zone\",\"occurred_at\":\"$(now)\"}"
    echo "  ✓ 📍 Sortie de zone — ${V_PLATES[$vi]} hors de \"$zone\""
}

vehicle_immobilized() {
    local vi=$((RANDOM % NB_V))
    kafka_send "flotte.location.events" \
        "{\"event_type\":\"VEHICLE_IMMOBILIZED\",\"vehicle_id\":\"${V_IDS[$vi]}\",\"driver_id\":null,\"latitude\":$(rand_float 49.4431 0.1),\"longitude\":$(rand_float 1.0993 0.1),\"occurred_at\":\"$(now)\"}"
    echo "  ✓ 🛑 Véhicule immobilisé — ${V_PLATES[$vi]}"
}

maintenance_overdue() {
    local severity="$1"
    local vi=$((RANDOM % NB_V))
    kafka_send "flotte.alertes.events" \
        "{\"alert_type\":\"MAINTENANCE_OVERDUE\",\"vehicle_id\":\"${V_IDS[$vi]}\",\"severity\":\"$severity\",\"message\":\"Maintenance obligatoire dépassée pour le véhicule ${V_PLATES[$vi]}\",\"occurred_at\":\"$(now)\"}"
    echo "  ✓ 🔧 Maintenance en retard — ${V_PLATES[$vi]} ($severity)"
}

license_event() {
    local days="$1" expired="${2:-false}"
    if [[ $NB_D -eq 0 ]]; then return; fi
    local di=$((RANDOM % NB_D))
    local event_type="LICENSE_EXPIRING"
    [[ "$expired" == "true" ]] && event_type="LICENSE_EXPIRED"
    local num="PERM-$((RANDOM % 900000 + 100000))"
    kafka_send "flotte.conducteurs.events" \
        "{\"event_type\":\"$event_type\",\"payload\":{\"driver_id\":\"${D_IDS[$di]}\",\"first_name\":\"${D_FNAMES[$di]}\",\"last_name\":\"${D_LNAMES[$di]}\",\"license\":{\"license_number\":\"$num\",\"days_remaining\":$days}}}"
    if [[ "$expired" == "true" ]]; then
        echo "  ✓ ⚠️  Permis EXPIRÉ — ${D_FNAMES[$di]} ${D_LNAMES[$di]}"
    else
        echo "  ✓ ⏳ Permis bientôt expiré — ${D_FNAMES[$di]} ${D_LNAMES[$di]} (dans ${days} j.)"
    fi
}

# ── Publication ───────────────────────────────────────────────────────────────

speed_exceeded 138 90 true
speed_exceeded 108 90 true
speed_exceeded 65  50 false
geofencing_breach "Zone Industrielle Nord"  true
geofencing_breach "Périmètre Rouen Centre"  false
vehicle_immobilized
maintenance_overdue CRITICAL
maintenance_overdue HIGH
license_event 5  false
license_event 12 false
license_event 0  true

echo ""
echo "✅  11 événements publiés — les alertes apparaissent dans le frontend."
