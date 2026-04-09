package com.flotte.events.service;

import com.flotte.events.dto.AlertResponse;
import com.flotte.events.model.Alert;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertStatus;
import com.flotte.events.model.enums.AlertType;
import com.flotte.events.repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public Alert createAlert(AlertType type, AlertSeverity severity, UUID vehicleId, UUID driverId,
                             String message, String metadata) {
        Alert alert = new Alert(type, severity, vehicleId, driverId, message, metadata);
        Alert saved = alertRepository.save(alert);
        log.info("Alerte créée : id={} type={} severity={} vehicleId={} driverId={}",
                saved.getId(), type, severity, vehicleId, driverId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findAll() {
        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findByStatus(AlertStatus status) {
        return alertRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findBySeverity(AlertSeverity severity) {
        return alertRepository.findBySeverityOrderByCreatedAtDesc(severity).stream()
                .map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findByType(AlertType type) {
        return alertRepository.findByTypeOrderByCreatedAtDesc(type).stream()
                .map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findByVehicleId(UUID vehicleId) {
        return alertRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId).stream()
                .map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findByDriverId(UUID driverId) {
        return alertRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AlertResponse findById(UUID id) {
        return alertRepository.findById(id)
                .map(AlertResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Alerte introuvable : " + id));
    }

    public AlertResponse acknowledge(UUID alertId, UUID userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alerte introuvable : " + alertId));
        if (alert.getStatus() == AlertStatus.ACTIVE) {
            alert.setStatus(AlertStatus.ACKNOWLEDGED);
            alert.setAcknowledgedBy(userId);
            alert.setAcknowledgedAt(OffsetDateTime.now());
            log.info("Alerte {} acquittée par {}", alertId, userId);
        }
        return AlertResponse.from(alertRepository.save(alert));
    }

    public AlertResponse resolve(UUID alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alerte introuvable : " + alertId));
        if (alert.getStatus() != AlertStatus.RESOLVED) {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(OffsetDateTime.now());
            log.info("Alerte {} résolue", alertId);
        }
        return AlertResponse.from(alertRepository.save(alert));
    }

    @Transactional(readOnly = true)
    public long countActive() {
        return alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.ACTIVE).size();
    }
}
