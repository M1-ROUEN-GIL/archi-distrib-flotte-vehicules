package com.flotte.events.service;

import com.flotte.events.dto.AlertResponse;
import com.flotte.events.model.Alert;
import com.flotte.events.model.enums.AlertSeverity;
import com.flotte.events.model.enums.AlertStatus;
import com.flotte.events.model.enums.AlertType;
import com.flotte.events.repository.AlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private AlertService alertService;

    private Alert sampleAlert;
    private UUID vehicleId;
    private UUID driverId;

    @BeforeEach
    void setUp() {
        vehicleId = UUID.randomUUID();
        driverId = UUID.randomUUID();
        sampleAlert = new Alert(
                AlertType.MAINTENANCE_OVERDUE,
                AlertSeverity.WARNING,
                vehicleId,
                null,
                "Maintenance en retard pour le véhicule",
                "{}"
        );
        sampleAlert.setId(UUID.randomUUID());
    }

    @Test
    void createAlert_shouldSaveAndReturnAlert() {
        when(alertRepository.save(any(Alert.class))).thenReturn(sampleAlert);

        Alert result = alertService.createAlert(
                AlertType.MAINTENANCE_OVERDUE,
                AlertSeverity.WARNING,
                vehicleId,
                null,
                "Maintenance en retard",
                "{}"
        );

        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(AlertType.MAINTENANCE_OVERDUE);
        assertThat(result.getSeverity()).isEqualTo(AlertSeverity.WARNING);
        verify(alertRepository, times(1)).save(any(Alert.class));
    }

    @Test
    void createAlert_shouldSetStatusToActive() {
        ArgumentCaptor<Alert> captor = ArgumentCaptor.forClass(Alert.class);
        when(alertRepository.save(captor.capture())).thenReturn(sampleAlert);

        alertService.createAlert(AlertType.LICENSE_EXPIRING, AlertSeverity.CRITICAL,
                null, driverId, "Permis expiré", "{}");

        Alert saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(AlertStatus.ACTIVE);
        assertThat(saved.getDriverId()).isEqualTo(driverId);
    }

    @Test
    void findAll_shouldReturnAllAlerts() {
        when(alertRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(sampleAlert));

        List<AlertResponse> results = alertService.findAll();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).type()).isEqualTo(AlertType.MAINTENANCE_OVERDUE);
    }

    @Test
    void acknowledge_shouldUpdateStatusAndUser() {
        UUID userId = UUID.randomUUID();
        UUID alertId = UUID.randomUUID();
        when(alertRepository.findById(alertId)).thenReturn(Optional.of(sampleAlert));
        when(alertRepository.save(any())).thenReturn(sampleAlert);

        alertService.acknowledge(alertId, userId);

        assertThat(sampleAlert.getStatus()).isEqualTo(AlertStatus.ACKNOWLEDGED);
        assertThat(sampleAlert.getAcknowledgedBy()).isEqualTo(userId);
        assertThat(sampleAlert.getAcknowledgedAt()).isNotNull();
    }

    @Test
    void resolve_shouldUpdateStatusAndResolvedAt() {
        UUID alertId = UUID.randomUUID();
        when(alertRepository.findById(alertId)).thenReturn(Optional.of(sampleAlert));
        when(alertRepository.save(any())).thenReturn(sampleAlert);

        alertService.resolve(alertId);

        assertThat(sampleAlert.getStatus()).isEqualTo(AlertStatus.RESOLVED);
        assertThat(sampleAlert.getResolvedAt()).isNotNull();
    }

    @Test
    void findById_shouldThrowWhenNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(alertRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertService.findById(unknownId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(unknownId.toString());
    }

    @Test
    void acknowledge_shouldThrowWhenAlertNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(alertRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertService.acknowledge(unknownId, UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void resolve_shouldBeIdempotentWhenAlreadyResolved() {
        UUID alertId = sampleAlert.getId();
        sampleAlert.setStatus(AlertStatus.RESOLVED);
        when(alertRepository.findById(alertId)).thenReturn(Optional.of(sampleAlert));

        alertService.resolve(alertId);

        // Ne doit pas sauvegarder si déjà résolu
        verify(alertRepository, never()).save(any());
        assertThat(sampleAlert.getStatus()).isEqualTo(AlertStatus.RESOLVED);
    }
}
