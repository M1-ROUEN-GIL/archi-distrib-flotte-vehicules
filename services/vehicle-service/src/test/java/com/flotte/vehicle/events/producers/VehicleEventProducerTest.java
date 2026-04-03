package com.flotte.vehicle.events.producers;

import com.flotte.maintenance.events.MaintenancePayload;
import com.flotte.vehicle.events.AssignmentPayload;
import com.flotte.vehicle.events.KafkaEventEnvelope;
import com.flotte.vehicle.events.VehiclePayload;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class VehicleEventProducerTest {

	@Mock
	private KafkaTemplate<String, Object> kafkaTemplate;

	@InjectMocks
	private VehicleEventProducer producer;

	@Test
	void publishVehicleEvent_ShouldSend() {
		UUID vid = UUID.randomUUID();
		VehiclePayload p = new VehiclePayload(vid, "AB-1-CD", "R", "K", "electric", "available", 1000);
		KafkaEventEnvelope<VehiclePayload> env = new KafkaEventEnvelope<>(
				UUID.randomUUID(), "VEHICLE_UPDATED", "1.0", OffsetDateTime.now(), p, null);
		producer.publishVehicleEvent(env);
		verify(kafkaTemplate).send(eq("flotte.vehicules.events"), eq(vid.toString()), eq(env));
	}

	@Test
	void publishAssignmentEvent_ShouldSend() {
		UUID vid = UUID.randomUUID();
		AssignmentPayload p = new AssignmentPayload(UUID.randomUUID(), vid, UUID.randomUUID(), null, null, null);
		KafkaEventEnvelope<AssignmentPayload> env = new KafkaEventEnvelope<>(
				UUID.randomUUID(), "VEHICLE_ASSIGNED", "1.0", OffsetDateTime.now(), p, null);
		producer.publishAssignmentEvent(env);
		verify(kafkaTemplate).send(eq("flotte.assignments.events"), eq(vid.toString()), eq(env));
	}

	@Test
	void publishMaintenanceEvent_ShouldSend() {
		MaintenancePayload payload = new MaintenancePayload(
				UUID.randomUUID(), UUID.randomUUID(), com.flotte.maintenance.model.MaintenanceType.PREVENTIVE,
				null, null, null, null, null);
		KafkaEventEnvelope<MaintenancePayload> env = new KafkaEventEnvelope<>(
				UUID.randomUUID(), "X", "1.0", OffsetDateTime.now(), payload, null);
		producer.publishMaintenanceEvent(env);
		verify(kafkaTemplate).send(eq("flotte.maintenance.events"), eq(env));
	}
}
