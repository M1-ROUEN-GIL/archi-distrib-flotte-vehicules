package com.flotte.vehicle.events.consumers;

import com.flotte.maintenance.events.MaintenancePayload;
import com.flotte.maintenance.model.MaintenanceType;
import com.flotte.vehicle.events.KafkaEventEnvelope;
import com.flotte.vehicle.events.StatusChange;
import com.flotte.vehicle.events.producers.VehicleEventProducer;
import com.flotte.vehicle.models.enums.VehicleStatus;
import com.flotte.vehicle.services.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceEventConsumerTest {

	@Mock
	private VehicleService vehicleService;

	@Mock
	private VehicleEventProducer eventProducer;

	private MaintenanceEventConsumer consumer;

	private final UUID vehicleId = UUID.randomUUID();

	@BeforeEach
	void setUp() {
		consumer = new MaintenanceEventConsumer(vehicleService, eventProducer);
	}

	private KafkaEventEnvelope<MaintenancePayload> envelope(String type, MaintenancePayload payload) {
		return new KafkaEventEnvelope<>(
				UUID.randomUUID(), type, "1.0",
				java.time.OffsetDateTime.now(), payload, null);
	}

	@Test
	void consume_MaintenanceStarted_ShouldSetInMaintenance() {
		MaintenancePayload p = new MaintenancePayload(
				UUID.randomUUID(), vehicleId, MaintenanceType.PREVENTIVE, null, null, null, null, null);
		consumer.consume(envelope("MAINTENANCE_STARTED", p));
		verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.IN_MAINTENANCE);
	}

	@Test
	void consume_MaintenanceCompleted_ShouldSetAvailable() {
		MaintenancePayload p = new MaintenancePayload(
				UUID.randomUUID(), vehicleId, MaintenanceType.PREVENTIVE, null, null, null, null, null);
		consumer.consume(envelope("MAINTENANCE_COMPLETED", p));
		verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.AVAILABLE);
	}

	@Test
	void consume_MaintenanceUpdated_InProgress_ShouldSetInMaintenance() {
		StatusChange st = new StatusChange("SCHEDULED", "IN_PROGRESS");
		MaintenancePayload p = new MaintenancePayload(
				UUID.randomUUID(), vehicleId, MaintenanceType.PREVENTIVE, st, null, null, null, null);
		consumer.consume(envelope("MAINTENANCE_UPDATED", p));
		verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.IN_MAINTENANCE);
	}

	@Test
	void consume_MaintenanceUpdated_Completed_ShouldSetAvailable() {
		StatusChange st = new StatusChange("IN_PROGRESS", "COMPLETED");
		MaintenancePayload p = new MaintenancePayload(
				UUID.randomUUID(), vehicleId, MaintenanceType.PREVENTIVE, st, null, null, null, null);
		consumer.consume(envelope("MAINTENANCE_UPDATED", p));
		verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.AVAILABLE);
	}

	@Test
	void consume_MaintenanceRejected_ShouldOnlyLog() {
		MaintenancePayload p = new MaintenancePayload(
				UUID.randomUUID(), vehicleId, MaintenanceType.PREVENTIVE, null, null, null, null, null);
		consumer.consume(envelope("MAINTENANCE_REJECTED", p));
		verify(vehicleService, never()).updateVehicleStatus(any(), any());
	}

	@Test
	void consume_OnFailure_ShouldPublishRejected() {
		MaintenancePayload p = new MaintenancePayload(
				UUID.randomUUID(), vehicleId, MaintenanceType.PREVENTIVE, null, null, null, null, null);
		doThrow(new RuntimeException("boom")).when(vehicleService).updateVehicleStatus(eq(vehicleId), any());

		consumer.consume(envelope("MAINTENANCE_STARTED", p));

		verify(eventProducer).publishMaintenanceEvent(any());
	}
}
