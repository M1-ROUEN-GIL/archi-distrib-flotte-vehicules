1-télécharger les paquets Bitnami en local :
helm dependency update ./helm/dependencies/
2-lance toute l'infrastructure d'un coup :
helm install mon-infra ./helm/dependencies/ --namespace flotte-namespace
