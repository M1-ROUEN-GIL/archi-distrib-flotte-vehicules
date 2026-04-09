package com.flotte.events.events.payloads;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Payload publié par le maintenance-service sur le topic flotte.alertes.events.
 * Format direct (pas de KafkaEventEnvelope).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MaintenanceAlertPayload(
        @JsonProperty("alert_type") String alertType,
        @JsonProperty("vehicle_id") UUID vehicleId,
        String severity,
        String message,
        @JsonProperty("occurred_at") OffsetDateTime occurredAt
) {}
