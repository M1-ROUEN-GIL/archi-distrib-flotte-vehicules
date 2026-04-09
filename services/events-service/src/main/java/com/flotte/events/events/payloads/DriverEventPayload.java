package com.flotte.events.events.payloads;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Payload du conducteur extrait du KafkaEventEnvelope publié par driver-service
 * sur le topic flotte.conducteurs.events.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DriverEventPayload(
        @JsonProperty("driver_id") UUID driverId,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("last_name") String lastName,
        @JsonProperty("employee_id") String employeeId,
        LicenseInfo license
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LicenseInfo(
            @JsonProperty("license_number") String licenseNumber,
            String category,
            @JsonProperty("expiry_date") LocalDate expiryDate,
            @JsonProperty("days_remaining") Integer daysRemaining
    ) {}
}
