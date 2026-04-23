# Tests de Charge avec K6

Ce dossier contient l'infrastructure de tests de charge pour l'architecture de gestion de flotte.

## Structure
- `utils/config.js` : Configuration globale (URLs, headers).
- `scenarios/options.js` : Définition des profils de charge (Smoke, Load, Stress).
- `targets/` : Scripts de test par protocole/service.

## Installation de K6
Si vous ne l'avez pas encore, installez K6 sur votre machine :
- **Linux (Ubuntu/Debian) :**
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```
- **macOS (Homebrew) :** `brew install k6`

## Exécution des tests

Les tests sont configurés pour être lancés avec une variable d'environnement `SCENARIO` qui définit le profil de charge.

### 1. Tests GraphQL (Vehicles)
```bash
# Smoke test (Vérification rapide)
SCENARIO=smoke k6 run load-tests/targets/graphql-vehicles.js

# Load test (Charge normale)
SCENARIO=load k6 run load-tests/targets/graphql-vehicles.js

# Stress test (Pousser aux limites)
SCENARIO=stress k6 run load-tests/targets/graphql-vehicles.js
```

### 2. Tests REST (Alertes)
```bash
SCENARIO=load k6 run load-tests/targets/rest-alerts.js
```

### 3. Tests gRPC (Location)
Note : Assurez-vous que le `location-service` est bien démarré sur le port 3000.
```bash
SCENARIO=smoke k6 run load-tests/targets/grpc-location.js
```

## Configuration des URLs
Par défaut, les tests ciblent `http://localhost:4000` (Gateway) et `localhost:3000` (gRPC).
Vous pouvez surcharger ces valeurs :
```bash
BASE_URL=http://votre-gateway.com GRPC_URL=votre-location-service:3000 k6 run ...
```

## Interprétation des résultats
- **http_req_duration** : Temps de réponse des requêtes HTTP.
- **http_req_failed** : Taux d'erreur.
- **checks** : Pourcentage de réussite des assertions (status 200, format de réponse, etc.).
- **thresholds** : Les tests échoueront si les seuils définis dans `scenarios/options.js` ne sont pas respectés.
