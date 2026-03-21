# Passerelle GraphQL (Apollo Server)

Ce dossier contient le **gateway GraphQL** du projet : une API GraphQL unique (Apollo Server 4 + Express) qui sert de façade vers les microservices REST.

## Prérequis

- **Node.js** 20 ou plus récent  
- Les services backend accessibles aux URLs configurées (véhicules, conducteurs, etc.)

## Installation

```bash
cd gateway
npm install
```

`npm install` recrée le dossier `node_modules/` en local : il est listé dans `.gitignore` et ne doit pas être versionné (tu peux le supprimer quand tu veux pour alléger le disque, puis relancer `npm install` avant de travailler).

## Configuration (optionnel)

Copie le fichier d’exemple et adapte les URLs si besoin :

```bash
cp .env.example .env
```

| Variable | Défaut | Rôle |
|----------|--------|------|
| `PORT` | `4000` | Port HTTP du gateway |
| `VEHICLE_SERVICE_URL` | `http://localhost:8080` | Origine du service véhicules (sans slash final) |
| `DRIVER_SERVICE_URL` | `http://localhost:8081` | Origine du service conducteurs |

Les variables peuvent aussi être exportées dans le shell sans fichier `.env` (le projet ne charge pas `dotenv` par défaut).

## Démarrage

**Mode développement** (rechargement à chaque modification) :

```bash
npm run dev
```

**Mode production** (build puis exécution du JavaScript compilé) :

```bash
npm run build
npm start
```

## Accès

| Endpoint | Description |
|----------|-------------|
| `http://localhost:4000/graphql` | Point d’entrée GraphQL (Apollo Sandbox / requêtes POST) |
| `http://localhost:4000/health` | Contrôle simple de disponibilité (`{"status":"ok"}`) |

Si tu changes `PORT`, remplace `4000` dans l’URL.

## Authentification

Le header HTTP **`Authorization`** envoyé au gateway est **renvoyé tel quel** aux microservices REST.

## Structure du dossier

- `graphql/` — schéma SDL (fichiers `.graphql`)
- `src/` — code TypeScript (Apollo, resolvers, clients HTTP)
- `openapi/` — spécifications OpenAPI des services (référence, pas utilisées à l’exécution)

## Vérification TypeScript

```bash
npm run typecheck
```
