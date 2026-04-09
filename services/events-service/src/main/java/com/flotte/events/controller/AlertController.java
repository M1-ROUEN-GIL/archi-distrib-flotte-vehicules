package com.flotte.events.controller;

import com.flotte.events.dto.AlertResponse;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertStatus;
import com.flotte.events.model.enums.AlertType;
import com.flotte.events.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * GET /api/alerts
     * Filtres optionnels : status, severity, type, vehicleId, driverId
     */
    @GetMapping
    public List<AlertResponse> getAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) AlertType type,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId
    ) {
        if (vehicleId != null) return alertService.findByVehicleId(vehicleId);
        if (driverId != null) return alertService.findByDriverId(driverId);
        if (type != null) return alertService.findByType(type);
        if (severity != null) return alertService.findBySeverity(severity);
        if (status != null) return alertService.findByStatus(status);
        return alertService.findAll();
    }

    /**
     * GET /api/alerts/{id}
     */
    @GetMapping("/{id}")
    public AlertResponse getById(@PathVariable UUID id) {
        return alertService.findById(id);
    }

    /**
     * GET /api/alerts/stats
     * Nombre d'alertes actives (utile pour le dashboard)
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return Map.of(
                "activeCount", alertService.countActive()
        );
    }

    /**
     * PATCH /api/alerts/{id}/acknowledge
     * Acquitter une alerte — le userId est extrait du JWT Keycloak (claim "sub").
     */
    @PatchMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('admin', 'manager')")
    public AlertResponse acknowledge(@PathVariable UUID id,
                                     @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return alertService.acknowledge(id, userId);
    }

    /**
     * PATCH /api/alerts/{id}/resolve
     * Résoudre une alerte (admin, manager, technicien)
     */
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('admin', 'manager', 'technicien')")
    public AlertResponse resolve(@PathVariable UUID id) {
        return alertService.resolve(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(IllegalArgumentException ex) {
        return ResponseEntity.notFound().build();
    }
}
