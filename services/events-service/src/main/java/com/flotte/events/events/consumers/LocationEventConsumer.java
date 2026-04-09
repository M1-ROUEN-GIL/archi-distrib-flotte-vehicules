package com.flotte.events.events.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flotte.events.events.payloads.LocationEventPayload;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertType;
import com.flotte.events.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consomme les événements de localisation publiés par le location-service (Node.js)
 * sur le topic "flotte.location.events".
 *
 * Contrat attendu : voir LocationEventPayload.java pour le format JSON.
 *
 * Génère des alertes pour :
 * - GEOFENCING_BREACH   : sortie de zone autorisée (HIGH)
 * - SPEED_EXCEEDED      : dépassement de vitesse (WARNING ou HIGH selon excès)
 * - VEHICLE_IMMOBILIZED : arrêt anormal (WARNING)
 */
@Component
public class LocationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(LocationEventConsumer.class);

    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    public LocationEventConsumer(AlertService alertService, ObjectMapper objectMapper) {
        this.alertService = alertService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "flotte.location.events", groupId = "events-group")
    public void handleLocationEvent(String rawMessage) {
        try {
            LocationEventPayload payload = objectMapper.readValue(rawMessage, LocationEventPayload.class);
            log.info("Événement localisation reçu : type={} vehicleId={}", payload.eventType(), payload.vehicleId());

            switch (payload.eventType()) {
                case "GEOFENCING_BREACH" -> handleGeofencingBreach(payload, rawMessage);
                case "SPEED_EXCEEDED" -> handleSpeedExceeded(payload, rawMessage);
                case "VEHICLE_IMMOBILIZED" -> handleVehicleImmobilized(payload, rawMessage);
                default -> log.debug("Événement localisation ignoré : {}", payload.eventType());
            }
        } catch (Exception e) {
            log.error("Erreur lors du traitement de l'événement localisation : {}", e.getMessage());
        }
    }

    private void handleGeofencingBreach(LocationEventPayload payload, String rawMessage) {
        String message = payload.message() != null ? payload.message()
                : "Véhicule sorti de la zone autorisée"
                + (payload.zoneName() != null ? " : " + payload.zoneName() : "");
        alertService.createAlert(AlertType.GEOFENCING_BREACH, AlertSeverity.HIGH,
                payload.vehicleId(), payload.driverId(), message, rawMessage);
    }

    private void handleSpeedExceeded(LocationEventPayload payload, String rawMessage) {
        String message = payload.message() != null ? payload.message()
                : buildSpeedMessage(payload);
        // Excès > 30 km/h → CRITICAL, sinon WARNING
        AlertSeverity severity = AlertSeverity.WARNING;
        if (payload.speedKmh() != null && payload.speedLimitKmh() != null
                && (payload.speedKmh() - payload.speedLimitKmh()) > 30) {
            severity = AlertSeverity.CRITICAL;
        } else if (payload.speedKmh() != null && payload.speedLimitKmh() != null
                && (payload.speedKmh() - payload.speedLimitKmh()) > 15) {
            severity = AlertSeverity.HIGH;
        }
        alertService.createAlert(AlertType.SPEED_EXCEEDED, severity,
                payload.vehicleId(), payload.driverId(), message, rawMessage);
    }

    private void handleVehicleImmobilized(LocationEventPayload payload, String rawMessage) {
        String message = payload.message() != null ? payload.message()
                : "Véhicule immobilisé de manière anormale";
        alertService.createAlert(AlertType.VEHICLE_IMMOBILIZED, AlertSeverity.WARNING,
                payload.vehicleId(), payload.driverId(), message, rawMessage);
    }

    private String buildSpeedMessage(LocationEventPayload payload) {
        if (payload.speedKmh() != null && payload.speedLimitKmh() != null) {
            return String.format("Dépassement de vitesse : %.0f km/h (limite : %.0f km/h)",
                    payload.speedKmh(), payload.speedLimitKmh());
        }
        return "Dépassement de vitesse détecté";
    }
}
