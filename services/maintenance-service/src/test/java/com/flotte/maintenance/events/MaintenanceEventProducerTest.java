package com.flotte.maintenance.events;

import com.flotte.maintenance.model.MaintenanceType;
import com.flotte.vehicle.events.KafkaEventEnvelope;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MaintenanceEventProducerTest {

	@Mock
	private KafkaTemplate<String, Object> kafkaTemplate;

	@InjectMocks
	private MaintenanceEventProducer producer;

	@Test
	void publishAlert_ShouldSend() {
		UUID vid = UUID.randomUUID();
		AlertEvent alert = AlertEvent.overdue(vid, "msg");
		producer.publishAlert(alert);
		verify(kafkaTemplate).send(eq("flotte.alertes.events"), eq(vid.toString()), eq(alert));
	}

	@Test
	void publishMaintenanceEvent_ShouldSend() {
		UUID vid = UUID.randomUUID();
		MaintenancePayload payload = new MaintenancePayload(
				UUID.randomUUID(), vid, MaintenanceType.PREVENTIVE, null, null, null, null, null);
		@SuppressWarnings("unchecked")
		KafkaEventEnvelope<MaintenancePayload> env = new KafkaEventEnvelope<>(
				UUID.randomUUID(), "MAINTENANCE_STARTED", "1.0",
				java.time.OffsetDateTime.now(), payload, null);
		producer.publishMaintenanceEvent(env);
		verify(kafkaTemplate).send(eq("flotte.maintenance.events"), eq(vid.toString()), eq(env));
	}
}
