package com.flotte.events.events.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flotte.events.events.payloads.MaintenanceAlertPayload;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertType;
import com.flotte.events.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consomme les alertes directes publiées par le maintenance-service
 * sur le topic "flotte.alertes.events".
 *
 * Format : AlertEvent (sans KafkaEventEnvelope).
 */
@Component
public class MaintenanceAlertConsumer {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceAlertConsumer.class);

    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    public MaintenanceAlertConsumer(AlertService alertService, ObjectMapper objectMapper) {
        this.alertService = alertService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "flotte.alertes.events", groupId = "events-group")
    public void handleMaintenanceAlert(String rawMessage) {
        try {
            MaintenanceAlertPayload payload = objectMapper.readValue(rawMessage, MaintenanceAlertPayload.class);
            log.info("Alerte maintenance reçue : type={} vehicleId={} severity={}",
                    payload.alertType(), payload.vehicleId(), payload.severity());

            AlertType alertType = resolveAlertType(payload.alertType());
            AlertSeverity severity = resolveSeverity(payload.severity());

            alertService.createAlert(
                    alertType,
                    severity,
                    payload.vehicleId(),
                    null,
                    payload.message() != null ? payload.message() : buildMaintenanceMessage(payload),
                    rawMessage
            );
        } catch (Exception e) {
            log.error("Erreur lors du traitement de l'alerte maintenance : {}", e.getMessage());
        }
    }

    private AlertType resolveAlertType(String rawType) {
        if (rawType == null) return AlertType.MAINTENANCE_OVERDUE;
        return switch (rawType.toUpperCase()) {
            case "MAINTENANCE_OVERDUE" -> AlertType.MAINTENANCE_OVERDUE;
            default -> AlertType.MAINTENANCE_OVERDUE;
        };
    }

    private AlertSeverity resolveSeverity(String raw) {
        if (raw == null) return AlertSeverity.WARNING;
        return switch (raw.toUpperCase()) {
            case "INFO" -> AlertSeverity.INFO;
            case "HIGH" -> AlertSeverity.HIGH;
            case "CRITICAL" -> AlertSeverity.CRITICAL;
            default -> AlertSeverity.WARNING;
        };
    }

    private String buildMaintenanceMessage(MaintenanceAlertPayload payload) {
        return "Alerte maintenance pour le véhicule " + payload.vehicleId();
    }
}
