package com.flotte.events.dto;

import com.flotte.events.model.Alert;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertStatus;
import com.flotte.events.model.enums.AlertType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlertResponse(
        UUID id,
        AlertType type,
        AlertSeverity severity,
        AlertStatus status,
        UUID vehicleId,
        UUID driverId,
        String message,
        String metadata,
        UUID acknowledgedBy,
        OffsetDateTime acknowledgedAt,
        OffsetDateTime resolvedAt,
        OffsetDateTime expiresAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static AlertResponse from(Alert alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getType(),
                alert.getSeverity(),
                alert.getStatus(),
                alert.getVehicleId(),
                alert.getDriverId(),
                alert.getMessage(),
                alert.getMetadata(),
                alert.getAcknowledgedBy(),
                alert.getAcknowledgedAt(),
                alert.getResolvedAt(),
                alert.getExpiresAt(),
                alert.getCreatedAt(),
                alert.getUpdatedAt()
        );
    }
}
