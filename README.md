# Système de Gestion de Flotte de Véhicules
**Projet M1 GIL -- Université de Rouen Normandie (2025-2026)**

Architecture microservices distribuée pour la gestion d'une flotte de véhicules.

---

## Démarrage

### Docker Compose (développement local)
```bash
docker compose up -d --build
```

### Kubernetes / Minikube (production-like)
```bash
chmod +x kube.sh && ./kube.sh
echo "$(minikube ip) flotte.local" | sudo tee -a /etc/hosts
```

---

## Services disponibles

| Service | Docker Compose | Kubernetes |
| :--- | :--- | :--- |
| Gateway GraphQL | http://localhost:4000 | http://flotte.local/graphql |
| Keycloak | http://localhost:8180 | http://flotte.local/auth |

**Identifiants par défaut**
- Keycloak admin : `admin` / `admin`
- Utilisateur test : `test-user` / `password` (realm `gestion-flotte`)
- PostgreSQL : `admin` / `password`

---

## Tests API avec Bruno

1. Ouvrir [Bruno](https://usebruno.com) et charger le dossier [`/bruno`](./bruno)
2. Choisir l'environnement en haut à droite :
   - **Docker** : pointe sur `localhost` (compose)
   - **Minikube** : pointe sur `flotte.local` (k8s)
3. L'authentification JWT est gérée automatiquement par le script de collection

La collection couvre :
- **REST** : CRUD sur les services `vehicle`, `driver`, `maintenance`, `location` et `events`
- **GraphQL** : requêtes d'agrégation via la gateway

---

## Microservices

- **vehicle-service** : inventaire et états des véhicules
- **driver-service** : profils conducteurs et permis
- **maintenance-service** : planification et historique des réparations
- **location-service** : géolocalisation et suivi des véhicules
- **events-service** : événements métier (Kafka)

---

## Stack

- Java 21, Spring Boot 3.4, Node.js 20
- PostgreSQL 16, Apache Kafka (KRaft)
- Docker, Kubernetes / Helm 3
- Prometheus, Grafana, Jaeger, Loki
