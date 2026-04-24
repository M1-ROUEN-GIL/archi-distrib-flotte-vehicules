#!/bin/bash

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Installation - Système de Gestion de Flotte            ║${NC}"
echo -e "${BLUE}║   Projet M1 GIL — Université de Rouen Normandie         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# 1. VÉRIFICATION DES PRÉREQUIS
# ============================================================================
check_prerequisites() {
    echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

    local missing=0

    # Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ Docker${NC} ($(docker --version | cut -d' ' -f3 | tr -d ','))"
    fi

    # Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}✗ Docker Compose non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ Docker Compose${NC}"
    fi

    # Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ Node.js${NC} (v$(node --version | cut -d'v' -f2))"
    fi

    # npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}✗ npm non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ npm${NC} (v$(npm --version))"
    fi

    # k6
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}✗ k6 non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ k6${NC} (v$(k6 version 2>/dev/null | grep -oP 'v\K[0-9.]+' || echo 'unknown'))"
    fi

    # Minikube
    if ! command -v minikube &> /dev/null; then
        echo -e "${RED}✗ Minikube non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ Minikube${NC} (v$(minikube version --short 2>/dev/null || echo 'unknown'))"
    fi

    # Helm
    if ! command -v helm &> /dev/null; then
        echo -e "${RED}✗ Helm non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ Helm${NC} (v$(helm version --short 2>/dev/null | cut -d':' -f2 | tr -d ' ' || echo 'unknown'))"
    fi

    # kubectl
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}✗ kubectl non installé${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✓ kubectl${NC} (v$(kubectl version --client --short 2>/dev/null | grep -oP 'v\K[0-9.]+' || echo 'unknown'))"
    fi

    echo ""

    if [ $missing -gt 0 ]; then
        echo -e "${RED}❌ ${missing} prérequis manquants.${NC}"
        echo ""
        echo -e "${YELLOW}Installation recommandée:${NC}"
        echo "  • Docker: https://docs.docker.com/get-docker/"
        echo "  • Node.js: https://nodejs.org/ (v20+)"
        echo "  • k6: https://grafana.com/docs/k6/latest/get-started/installation/"
        echo "  • Minikube: https://minikube.sigs.k8s.io/docs/start/"
        echo "  • Helm: https://helm.sh/docs/intro/install/"
        echo "  • kubectl: https://kubernetes.io/docs/tasks/tools/"
        echo ""
        exit 1
    fi

    echo -e "${GREEN}✓ Tous les prérequis sont satisfaits${NC}"
    echo ""
}

# ============================================================================
# 2. INSTALLATION DES DÉPENDANCES
# ============================================================================
install_dependencies() {
    echo -e "${YELLOW}📦 Installation des dépendances npm (workspaces)...${NC}"

    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${BLUE}ℹ node_modules existe déjà${NC}"
    fi

    echo -e "${GREEN}✓ Dépendances installées${NC}"
    echo ""
}

# ============================================================================
# 3. SÉLECTION DE L'ENVIRONNEMENT
# ============================================================================
select_environment() {
    echo -e "${YELLOW}🏗️  Sélectionnez l'environnement de déploiement:${NC}"
    echo ""
    echo "  1) Docker Compose (simple, recommandé pour le développement)"
    echo "  2) Kubernetes / Minikube (avancé, production-like)"
    echo "  3) Passer (vous démarrerez manuellement)"
    echo ""

    read -p "Votre choix [1-3]: " choice

    case $choice in
        1)
            ENVIRONMENT="docker"
            echo -e "${GREEN}✓ Docker Compose sélectionné${NC}"
            ;;
        2)
            ENVIRONMENT="minikube"
            echo -e "${GREEN}✓ Minikube sélectionné${NC}"
            ;;
        3)
            ENVIRONMENT="none"
            echo -e "${BLUE}ℹ Aucun environnement ne sera démarré${NC}"
            ;;
        *)
            echo -e "${RED}❌ Choix invalide${NC}"
            select_environment
            ;;
    esac

    echo ""
}

# ============================================================================
# 4. DÉMARRAGE AVEC DOCKER COMPOSE
# ============================================================================
start_docker() {
    echo -e "${YELLOW}🐳 Démarrage avec Docker Compose...${NC}"
    echo ""

    if docker-compose up -d --build 2>/dev/null || docker compose up -d --build 2>/dev/null; then
        echo -e "${GREEN}✓ Services lancés${NC}"
        echo ""
        echo -e "${BLUE}Services disponibles:${NC}"
        echo "  • Frontend: http://localhost:3005"
        echo "  • GraphQL Gateway: http://localhost:4000"
        echo "  • Keycloak: http://localhost:8180"
        echo "  • Grafana: http://localhost:3001"
        echo "  • Jaeger: http://localhost:16686"
        echo ""
        echo -e "${YELLOW}Identifiants par défaut:${NC}"
        echo "  • Keycloak: admin / admin"
        echo "  • PostgreSQL: admin / password"
        echo ""
        echo -e "${BLUE}Pour arrêter: docker-compose down${NC}"
    else
        echo -e "${RED}❌ Erreur lors du démarrage${NC}"
        exit 1
    fi
}

# ============================================================================
# 5. DÉMARRAGE AVEC MINIKUBE
# ============================================================================
start_minikube() {
    echo -e "${YELLOW}☸️  Démarrage avec Minikube...${NC}"
    echo ""

    # Vérifier Minikube
    if ! command -v minikube &> /dev/null; then
        echo -e "${RED}❌ Minikube non trouvé${NC}"
        echo -e "${YELLOW}Installation: https://minikube.sigs.k8s.io/docs/start/${NC}"
        exit 1
    fi

    # Vérifier Helm
    if ! command -v helm &> /dev/null; then
        echo -e "${RED}❌ Helm non trouvé${NC}"
        echo -e "${YELLOW}Installation: https://helm.sh/docs/intro/install/${NC}"
        exit 1
    fi

    # Vérifier kubectl
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl non trouvé${NC}"
        echo -e "${YELLOW}Installation: https://kubernetes.io/docs/tasks/tools/${NC}"
        exit 1
    fi

    echo -e "${BLUE}ℹ Minikube, Helm et kubectl trouvés${NC}"
    echo ""

    # Exécuter le script kube.sh
    if [ -f "scripts/kube.sh" ]; then
        echo -e "${YELLOW}📝 Exécution de scripts/kube.sh...${NC}"
        bash scripts/kube.sh

        echo ""
        echo -e "${GREEN}✓ Déploiement Minikube terminé${NC}"
        echo ""
        echo -e "${YELLOW}Configuration d'accès requise:${NC}"
        echo "  • Ajouter à /etc/hosts: 127.0.0.1 flotte.local"
        echo "    Commande: echo \"127.0.0.1 flotte.local\" | sudo tee -a /etc/hosts"
        echo ""

        # Déterminer si minikube tunnel est nécessaire
        if [[ "$OSTYPE" == "linux-gnu"* ]] && ! grep -qi microsoft /proc/version 2>/dev/null; then
            echo -e "${BLUE}✓ Linux natif détecté - minikube tunnel n'est pas nécessaire${NC}"
        else
            echo -e "${YELLOW}Dans un terminal séparé, lancez:${NC}"
            echo "  minikube tunnel"
            echo ""
            echo -e "${BLUE}(Requis sur WSL2/Windows ou macOS pour accéder aux services)${NC}"
        fi
        echo ""
        echo -e "${BLUE}Services disponibles:${NC}"
        echo "  • Frontend: http://flotte.local"
        echo "  • GraphQL: http://flotte.local/graphql"
        echo "  • Keycloak: http://flotte.local/auth"
        echo "  • Grafana: http://flotte.local/grafana"
        echo "  • Jaeger: http://flotte.local/jaeger"
    else
        echo -e "${RED}❌ scripts/kube.sh non trouvé${NC}"
        exit 1
    fi
}

# ============================================================================
# 6. RÉSUMÉ FINAL
# ============================================================================
print_summary() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   ✓ Installation terminée                                ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${YELLOW}📚 Prochaines étapes:${NC}"
    echo ""
    echo "  1. Accédez au frontend:"

    if [ "$ENVIRONMENT" = "docker" ]; then
        echo "     http://localhost:3005"
    elif [ "$ENVIRONMENT" = "minikube" ]; then
        echo "     http://flotte.local"
        echo ""
        echo "  2. Lancez 'minikube tunnel' dans un terminal séparé"
    fi

    echo ""
    echo "  3. Connectez-vous avec:"
    echo "     • Utilisateur: admin"
    echo "     • Mot de passe: admin"
    echo ""

    echo -e "${YELLOW}📖 Documentation:${NC}"
    echo "  • README.md — Vue d'ensemble et scripts disponibles"
    echo "  • ./scripts/ — Scripts d'utilité (GPS, alertes, tests, Kafka...)"
    echo "  • ./bruno/ — Collection d'API pour tester les endpoints"
    echo ""

    if [ "$ENVIRONMENT" = "docker" ]; then
        echo -e "${BLUE}Commandes utiles:${NC}"
        echo "  • docker-compose ps     — État des services"
        echo "  • docker-compose logs   — Logs en temps réel"
        echo "  • docker-compose down   — Arrêter les services"
        echo ""
    fi
}

# ============================================================================
# MAIN
# ============================================================================
main() {
    check_prerequisites
    install_dependencies
    select_environment

    echo ""

    case $ENVIRONMENT in
        docker)
            start_docker
            ;;
        minikube)
            start_minikube
            ;;
        none)
            echo -e "${YELLOW}ℹ Installation terminée sans démarrage automatique${NC}"
            echo ""
            echo "Démarrage manuel:"
            echo "  • Docker: docker-compose up -d --build"
            echo "  • Minikube: bash scripts/kube.sh"
            echo ""
            ;;
    esac

    print_summary
}

main
