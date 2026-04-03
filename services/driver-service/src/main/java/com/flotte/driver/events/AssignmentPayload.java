package com.flotte.driver.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record AssignmentPayload(
        UUID assignmentId,
        UUID vehicleId,
        UUID driverId,
        OffsetDateTime startedAt,
        OffsetDateTime endedAt,
        String notes
) {}