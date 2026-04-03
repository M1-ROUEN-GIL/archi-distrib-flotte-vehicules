package com.flotte.driver.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DriverPayload(
        UUID driverId,
        String firstName,
        String lastName,
        String employeeId,
        Object status, // String ("ACTIVE") ou StatusChange ({previous, current})
        LicenseInfo license // Peut être null si on n'a pas encore de permis
) {}
