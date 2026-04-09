package com.flotte.events.repository;

import com.flotte.events.model.Alert;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertStatus;
import com.flotte.events.model.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    List<Alert> findBySeverityOrderByCreatedAtDesc(AlertSeverity severity);

    List<Alert> findByTypeOrderByCreatedAtDesc(AlertType type);

    List<Alert> findByVehicleIdOrderByCreatedAtDesc(UUID vehicleId);

    List<Alert> findByDriverIdOrderByCreatedAtDesc(UUID driverId);

    List<Alert> findByStatusAndSeverityOrderByCreatedAtDesc(AlertStatus status, AlertSeverity severity);

    List<Alert> findAllByOrderByCreatedAtDesc();
}
