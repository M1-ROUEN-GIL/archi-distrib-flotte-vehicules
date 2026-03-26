# Vehicle Service

Service de gestion des véhicules de la flotte.

## Tests et Qualité

Ce service utilise JUnit 5, Mockito et JaCoCo pour assurer la qualité du code. L'objectif de couverture est de **80%**.

### Lancer les tests
Pour exécuter l'ensemble des tests unitaires et d'intégration :
```bash
./mvnw test
```

### Consulter la couverture de code
Le rapport de couverture JaCoCo est **automatiquement généré** à la fin de la commande `./mvnw test`. 

Vous pouvez consulter le rapport détaillé en ouvrant le fichier suivant dans votre navigateur :
`services/vehicle-service/target/site/jacoco/index.html`

### Validation de l'API (Intégration)
Les tests d'intégration (`VehicleIntegrationTest`) valident le cycle CRUD complet et les affectations de chauffeurs en utilisant une base de données H2 en mémoire.
