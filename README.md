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
Toutes les requêtes de test (REST et GraphQL) sont centralisées dans une collection **[Bruno](https://usebruno.com)**.

#### Utilisation
1.  **Ouvrir Bruno** et cliquer sur "Open Collection".
2.  Sélectionner le dossier [`/bruno`](./bruno) à la racine du projet.
3.  **Sélectionner l'environnement** en haut à droite :
    - `Docker` : pour tester sur `localhost` (port 4000 pour le gateway, 8180 pour Keycloak).
    - `Minikube` : pour tester sur `http://flotte.local` (nécessite la configuration du fichier `/etc/hosts`).
4.  **Authentification Automatique** : La collection inclut un script `pre-request` qui récupère automatiquement un token JWT auprès de Keycloak et le stocke dans la variable `access_token`. Vous n'avez rien à faire, le token est injecté dans toutes les requêtes.

#### Structure de la collection
- **`Auth/`** : Requêtes manuelles pour tester l'obtention de jetons.
- **`REST/`** : Tests des endpoints CRUD pour les services `vehicle`, `driver` et `maintenance`.
- **`GraphQL/`** : Requêtes d'agrégation via le Gateway (port 4000).

### Qualité et Couverture (JaCoCo)
Chaque service Spring Boot vise une couverture de test **> 80%**.
```bash
# Exemple pour le service Driver
cd services/driver-service && ./mvnw test -Punit-coverage
```
Les rapports sont générés dans `target/site/jacoco/index.html` de chaque service.

---

## 🛠️ Stack Technique
- **Backend :** Java 21, Spring Boot 3.4, Node.js 20.
- **Data :** PostgreSQL 16, Hibernate (DDL Auto-update).
- **Event :** Kafka (KRaft mode).
- **Ops :** Helm 3, Docker, GitHub Actions (CI/CD).
- **Observabilité :** Prometheus, Grafana, Jaeger, Loki.
