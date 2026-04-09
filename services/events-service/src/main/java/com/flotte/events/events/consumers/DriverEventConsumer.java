package com.flotte.events.events.consumers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flotte.events.events.payloads.DriverEventPayload;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertType;
import com.flotte.events.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consomme les événements conducteurs publiés par le driver-service
 * sur le topic "flotte.conducteurs.events".
 *
 * Génère des alertes pour :
 * - LICENSE_EXPIRING : permis bientôt expiré (WARNING)
 * - LICENSE_EXPIRED  : permis expiré (CRITICAL)
 */
@Component
public class DriverEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(DriverEventConsumer.class);

    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    public DriverEventConsumer(AlertService alertService, ObjectMapper objectMapper) {
        this.alertService = alertService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "flotte.conducteurs.events", groupId = "events-group")
    public void handleDriverEvent(String rawMessage) {
        try {
            // Les messages du driver-service sont enveloppés dans KafkaEventEnvelope
            JsonNode root = objectMapper.readTree(rawMessage);
            String eventType = root.path("event_type").asText();

            if (!"LICENSE_EXPIRING".equals(eventType) && !"LICENSE_EXPIRED".equals(eventType)) {
                log.debug("Événement conducteur ignoré par events-service : {}", eventType);
                return;
            }

            JsonNode payloadNode = root.path("payload");
            DriverEventPayload payload = objectMapper.treeToValue(payloadNode, DriverEventPayload.class);

            log.info("Événement permis reçu : type={} driverId={}", eventType, payload.driverId());

            AlertSeverity severity = "LICENSE_EXPIRED".equals(eventType) ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
            String message = buildLicenseMessage(eventType, payload);

            alertService.createAlert(
                    AlertType.LICENSE_EXPIRING,
                    severity,
                    null,
                    payload.driverId(),
                    message,
                    rawMessage
            );
        } catch (Exception e) {
            log.error("Erreur lors du traitement de l'événement conducteur : {}", e.getMessage());
        }
    }

    private String buildLicenseMessage(String eventType, DriverEventPayload payload) {
        String name = payload.firstName() + " " + payload.lastName();
        if ("LICENSE_EXPIRED".equals(eventType)) {
            return "Permis de conduire expiré pour le conducteur " + name
                    + (payload.license() != null ? " (n°" + payload.license().licenseNumber() + ")" : "");
        }
        Integer days = payload.license() != null ? payload.license().daysRemaining() : null;
        return "Permis de conduire bientôt expiré pour " + name
                + (days != null ? " (dans " + days + " jours)" : "")
                + (payload.license() != null ? " — n°" + payload.license().licenseNumber() : "");
    }
}
