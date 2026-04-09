package com.flotte.events.events.payloads;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Contrat d'interface avec le location-service (Node.js).
 *
 * Le location-service doit publier sur le topic "flotte.location.events" des messages JSON
 * respectant ce format :
 *
 * {
 *   "event_type": "GEOFENCING_BREACH" | "SPEED_EXCEEDED" | "VEHICLE_IMMOBILIZED",
 *   "vehicle_id": "uuid",
 *   "driver_id": "uuid",          // optionnel
 *   "latitude": 48.8566,
 *   "longitude": 2.3522,
 *   "speed_kmh": 120.5,           // pour SPEED_EXCEEDED
 *   "speed_limit_kmh": 90.0,      // pour SPEED_EXCEEDED
 *   "zone_name": "Zone A",        // pour GEOFENCING_BREACH
 *   "message": "Description de l'événement",
 *   "occurred_at": "2024-01-01T10:00:00Z"
 * }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record LocationEventPayload(
        @JsonProperty("event_type") String eventType,
        @JsonProperty("vehicle_id") UUID vehicleId,
        @JsonProperty("driver_id") UUID driverId,
        Double latitude,
        Double longitude,
        @JsonProperty("speed_kmh") Double speedKmh,
        @JsonProperty("speed_limit_kmh") Double speedLimitKmh,
        @JsonProperty("zone_name") String zoneName,
        String message,
        @JsonProperty("occurred_at") OffsetDateTime occurredAt
) {}
