# 🚛 Système de Gestion de Flotte de Véhicules
**Projet M1 GIL -- Université de Rouen Normandie (2025-2026)**

Architecture microservices distribuée pour la gestion d'une flotte de véhicules, conducteurs et interventions techniques.

---

## 🏗️ Architecture du Système (Semaine 4)

Le projet repose sur une architecture **Cloud Native** décomposée en microservices spécialisés, communiquant via REST (synchrone) et Apache Kafka (asynchrone / Saga).

### Microservices Métier Opérationnels
- **[Vehicle Service](./services/vehicle-service)** (Spring Boot) : Inventaire, caractéristiques techniques, états des véhicules.
- **[Driver Service](./services/driver-service)** (Spring Boot) : Profils conducteurs, gestion des permis, validité.
- **[Maintenance Service](./services/maintenance-service)** (Spring Boot) : Planification, historique des réparations, alertes.

### Infrastructure & Edge
- **Gateway GraphQL** (Apollo Server) : Point d'entrée unique agrégeant les données des services REST.
- **Keycloak** (IAM) : Sécurisation des APIs via OAuth2/OIDC (JWT).
- **Apache Kafka** : Orchestration des processus inter-services (Pattern Saga par chorégraphie).
- **PostgreSQL** : Persistance polyglotte (une base isolée par service).

---

## 🚀 Démarrage Rapide

### Option A : Docker Compose (Développement)
Idéal pour tester rapidement l'application sur `localhost`.
```bash
docker compose up -d --build
```
> Les bases de données sont automatiquement peuplées de données réalistes au démarrage grâce à **Datafaker**.

### Option B : Kubernetes / Minikube (Production-like)
Utilisez le script d'automatisation pour déployer toute la stack (Helm + Ingress + Keycloak).
```bash
chmod +x kube.sh
./kube.sh
```
Ajoutez ensuite l'entrée DNS suivante à votre fichier `/etc/hosts` :
```bash
echo "$(minikube ip) flotte.local" | sudo tee -a /etc/hosts
```

---

## 🔐 Accès et Services

| Service | Local (Compose) | Cluster (K8s) |
| :--- | :--- | :--- |
| **Gateway GraphQL** | [http://localhost:4000](http://localhost:4000) | `http://flotte.local/graphql` |
| **Keycloak** | [http://localhost:8180](http://localhost:8180) | `http://flotte.local/auth` |
| **Bases de Données** | [localhost:5432](localhost:5432) | Service interne |
| **Kafka UI / Watch** | `./watch-kafka.sh` | Pod dédié |

### Identifiants par défaut
- **Keycloak Admin :** `admin` / `admin`
- **Utilisateur Test :** `test-user` / `password` (Realm `gestion-flotte`)
- **Bases PG :** `admin` / `password`

---

## 🧪 Tests et Documentation API

### Bruno (Remplaçant de Postman)
Nous utilisons **[Bruno](https://usebruno.com)** pour tester nos APIs. La collection complète est disponible dans le dossier [`/bruno`](./bruno).
- **Auto-Auth :** Un script `pre-request` gère automatiquement la récupération et le rafraîchissement du token JWT.
- **Environnements :** Sélectionnez `Docker` ou `Minikube` dans Bruno pour basculer les URLs.

### Qualité et Couverture (JaCoCo)
Chaque service Spring Boot vise une couverture de test **> 80%**.
```bash
# Exemple pour le service Driver
cd services/driver-service && ./mvnw test -Punit-coverage
```
Les rapports sont générés dans `target/site/jacoco/index.html` de chaque service.

---

## 📡 Architecture Événementielle (Saga)

Le système utilise Kafka pour maintenir la cohérence entre les services sans couplage fort.
- **Scénario de Maintenance :**
  1. `maintenance-service` crée une intervention → émet `MAINTENANCE_STARTED`.
  2. `vehicle-service` consomme l'événement → passe le véhicule en statut `IN_MAINTENANCE`.
  3. En cas d'erreur, une transaction compensatoire `MAINTENANCE_REJECTED` est émise pour annuler l'intervention.

---

## 🛠️ Stack Technique
- **Backend :** Java 21, Spring Boot 3.4, Node.js 20.
- **Data :** PostgreSQL 16, Hibernate (DDL Auto-update).
- **Event :** Kafka (KRaft mode).
- **Ops :** Helm 3, Docker, GitHub Actions (CI/CD).
- **Observabilité :** Prometheus, Grafana, Jaeger, Loki.
