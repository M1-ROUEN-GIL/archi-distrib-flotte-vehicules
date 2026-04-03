package com.flotte.driver.events;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class DriverEventFactory {

    private static final String VERSION = "1.0";

    // 1. DRIVER_CREATED
    public static KafkaEventEnvelope<DriverPayload> driverCreated(
            UUID driverId, String firstName, String lastName, String employeeId, String status) {

        DriverPayload payload = new DriverPayload(driverId, firstName, lastName, employeeId, status, null);
        return buildEnvelope("DRIVER_CREATED", payload);
    }

    // 2. DRIVER_UPDATED (ex: changement de nom, de téléphone...)
    public static KafkaEventEnvelope<DriverPayload> driverUpdated(
            UUID driverId, String firstName, String lastName, String employeeId, String status) {

        DriverPayload payload = new DriverPayload(driverId, firstName, lastName, employeeId, status, null);
        return buildEnvelope("DRIVER_UPDATED", payload);
    }

    // 3. DRIVER_STATUS_CHANGED (ex: passage de ACTIVE à ON_LEAVE)
    public static KafkaEventEnvelope<DriverPayload> driverStatusChanged(
            UUID driverId, String firstName, String lastName, String employeeId, String oldStatus, String newStatus) {

        DriverPayload payload = new DriverPayload(driverId, firstName, lastName, employeeId, new StatusChange(oldStatus, newStatus), null);
        return buildEnvelope("DRIVER_STATUS_CHANGED", payload);
    }

    // 4. LICENSE_EXPIRING (L'alerte de prévention)
    public static KafkaEventEnvelope<DriverPayload> licenseExpiring(
            UUID driverId, String firstName, String lastName, String employeeId, String status,
            String licenseNumber, String category, LocalDate expiryDate, int daysRemaining) {

        LicenseInfo licenseInfo = new LicenseInfo(licenseNumber, category, expiryDate, daysRemaining);
        DriverPayload payload = new DriverPayload(driverId, firstName, lastName, employeeId, status, licenseInfo);

        return buildEnvelope("LICENSE_EXPIRING", payload);
    }

    // 5. LICENSE_EXPIRED (L'alerte critique)
    public static KafkaEventEnvelope<DriverPayload> licenseExpired(
            UUID driverId, String firstName, String lastName, String employeeId, String status,
            String licenseNumber, String category, LocalDate expiryDate) {

        // S'il est expiré, il reste 0 jour (ou un nombre négatif)
        LicenseInfo licenseInfo = new LicenseInfo(licenseNumber, category, expiryDate, 0);
        DriverPayload payload = new DriverPayload(driverId, firstName, lastName, employeeId, status, licenseInfo);

        return buildEnvelope("LICENSE_EXPIRED", payload);
    }

    // --- Méthode utilitaire interne ---
    private static <T> KafkaEventEnvelope<T> buildEnvelope(String eventType, T payload) {
        return new KafkaEventEnvelope<>(
                UUID.randomUUID(),
                eventType,
                VERSION,
                OffsetDateTime.now(),
                payload, // L'ordre dépend de la définition de ton Record, ici payload en premier si déclaré avant metadata dans le record (ajuste si besoin)
                new EventMetadata(UUID.randomUUID(), "driver-service")
        );
    }
}