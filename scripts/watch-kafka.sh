#!/bin/bash

# Configuration
K8S_NAMESPACE="flotte-namespace"
K8S_SELECTOR="app=kafka-broker"
DOCKER_CONTAINER="flotte-kafka"
TOPIC_INCLUDE="flotte\..*"

MODE=$1

# Fonction d'usage
usage() {
    echo "❌ Erreur : Paramètre manquant ou invalide."
    echo "Usage : $0 [docker|minikube]"
    echo "  - docker   : Écoute Kafka via Docker Compose"
    echo "  - minikube : Écoute Kafka via Kubernetes/Minikube"
    exit 1
}

# Vérification du paramètre
if [ -z "$MODE" ]; then
    usage
fi

case "$MODE" in
    "docker")
        echo "🔍 Recherche du conteneur Docker : $DOCKER_CONTAINER..."
        if docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
            echo "✅ Kafka trouvé dans Docker"
            echo "🚀 Écoute des événements en temps réel..."
            echo "--------------------------------------------------------------------------------"
            docker exec -it $DOCKER_CONTAINER /opt/kafka/bin/kafka-console-consumer.sh \
                --bootstrap-server localhost:9092 \
                --include "$TOPIC_INCLUDE" \
                --property print.topic=true \
                --property print.timestamp=true \
                --property separator=" | "
        else
            echo "❌ Erreur : Le conteneur '$DOCKER_CONTAINER' n'est pas lancé."
            exit 1
        fi
        ;;

    "minikube")
        echo "🔍 Recherche du Pod Kafka dans le namespace : $K8S_NAMESPACE..."
        KAFKA_POD=$(kubectl get pods -n $K8S_NAMESPACE -l $K8S_SELECTOR -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [ -n "$KAFKA_POD" ]; then
            echo "✅ Pod trouvé : $KAFKA_POD"
            echo "🚀 Écoute des événements en temps réel..."
            echo "--------------------------------------------------------------------------------"
            kubectl exec -it $KAFKA_POD -n $K8S_NAMESPACE -- \
                kafka-console-consumer \
                --bootstrap-server localhost:9092 \
                --include "$TOPIC_INCLUDE" \
                --property print.topic=true \
                --property print.timestamp=true \
                --property separator=" | "
        else
            echo "❌ Erreur : Impossible de trouver le Pod Kafka dans Kubernetes ($K8S_NAMESPACE)."
            exit 1
        fi
        ;;

    *)
        usage
        ;;
esac
