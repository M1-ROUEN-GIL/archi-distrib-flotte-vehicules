# Documentation CI/CD - Flotte de Véhicules

Ce projet utilise **GitHub Actions** pour automatiser les tests, la validation et le déploiement. Le pipeline est configuré dans le fichier `.github/workflows/ci-cd.yml`.

## 📂 Organisation du Pipeline

Le pipeline se décompose en 4 phases majeures exécutées de manière optimale pour réduire le temps de build.

### 1. Tests des Microservices Java (`test-java-services`)
*   **Technologie :** Maven & JDK 21 (Temurin).
*   **Fonctionnement :** Utilise une **matrice** pour tester en parallèle les 4 services Java (`driver`, `events`, `maintenance`, `vehicle`).
*   **Actions :** Compilation, exécution des tests unitaires via `./mvnw clean test`.

### 2. Tests du Microservice Node.js (`test-node-location`)
*   **Technologie :** npm & Node.js 20.
*   **Fonctionnement :** Spécifique au service `location-service`.
*   **Actions :** Installation propre des dépendances avec `npm ci` et exécution des tests via `npm test`.

### 3. Validation de l'Infrastructure (`linting`)
*   **Technologie :** Helm.
*   **Actions :** Vérification syntaxique des charts Helm dans `infra/helm/dependencies` pour éviter des erreurs de déploiement Kubernetes.

### 4. Build & Push Docker (`build-and-push`)
*   **Sécurité :** Ne s'exécute **que sur la branche `main`** et seulement si tous les tests précédents ont réussi.
*   **Registre :** Les images sont poussées vers **GitHub Container Registry (GHCR)** (`ghcr.io`).
*   **Tagging :** Chaque image reçoit deux tags :
    *   `latest` : pour la version la plus récente.
    *   `SHA du commit` : pour permettre un rollback précis vers une version spécifique en cas de bug.

## 🛠️ Maintenance du Pipeline

- **Ajouter un service Java :** Ajoutez simplement le nom du dossier dans la liste `matrix.service` du job `test-java-services`.
- **Ajouter des tests d'intégration :** Vous pouvez ajouter des *services containers* (Redis, Kafka, Postgres) directement dans le YAML pour lancer des tests plus profonds.
- **Secrets :** Le pipeline utilise le `GITHUB_TOKEN` généré automatiquement par GitHub pour l'accès au registre d'images. Aucun paramétrage manuel n'est requis pour le push Docker sur GHCR.
