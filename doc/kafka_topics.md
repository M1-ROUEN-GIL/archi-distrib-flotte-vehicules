 Topic 1 : flotte.vehicules.events

Ce topic gère le cycle de vie et l'état des véhicules.

    Producteur (Qui parle ?) : Service Véhicules.

    Consommateurs (Qui écoute ?) : Service Maintenance, Service Événements.

    Format du message (JSON) 

 Topic 2 : flotte.localisation.gps

C'est ici que transitent les positions en temps réel.

    Producteur : Service Localisation (ou le boîtier GPS de la voiture).

    Consommateurs : Service Événements (pour vérifier les alertes géofencing ), Service Maintenance (pour mettre à jour le kilométrage).

    Format du message (JSON) :

 Topic 3 : flotte.maintenance.events

Ce topic annonce les révisions prévues ou terminées.

    Producteur : Service Maintenance.

    Consommateurs : Service Véhicules (pour remettre la voiture en "disponible" après réparation), Service Événements.

    Format du message (JSON) 

 Topic 4 : flotte.alertes.events

Ce topic centralise toutes les notifications importantes.

    Producteur : Service Événements (qui a analysé les règles métier).

    Consommateurs : API Gateway / Frontend (pour afficher une cloche rouge à l'écran du manager), ou un futur service d'envoi d'emails.

    Format du message (JSON) :
