package com.flotte.driver.events.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flotte.driver.dto.DriverStatusInput;
import com.flotte.driver.events.AssignmentPayload;
import com.flotte.driver.events.EventMetadata;
import com.flotte.driver.events.KafkaEventEnvelope;
import com.flotte.driver.models.enums.DriverStatus;
import com.flotte.driver.services.DriverService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleAssignmentConsumerTest {

	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	@Mock
	private DriverService driverService;

	private VehicleAssignmentConsumer consumer;

	@BeforeEach
	void setUp() {
		consumer = new VehicleAssignmentConsumer(objectMapper, driverService);
	}

	@Test
	void consumeAssignmentEvent_VehicleAssigned_ShouldSetOnTour() throws Exception {
		UUID driverId = UUID.randomUUID();
		UUID vehicleId = UUID.randomUUID();
		String json = envelopeJson("VEHICLE_ASSIGNED", new AssignmentPayload(
				UUID.randomUUID(), vehicleId, driverId, OffsetDateTime.now(), null, null));

		consumer.consumeAssignmentEvent(json);

		ArgumentCaptor<DriverStatusInput> cap = ArgumentCaptor.forClass(DriverStatusInput.class);
		verify(driverService).updateDriverStatus(eq(driverId), cap.capture());
		assertEquals(DriverStatus.ON_TOUR, cap.getValue().status());
	}

	@Test
	void consumeAssignmentEvent_VehicleUnassigned_ShouldSetActive() throws Exception {
		UUID driverId = UUID.randomUUID();
		UUID vehicleId = UUID.randomUUID();
		String json = envelopeJson("VEHICLE_UNASSIGNED", new AssignmentPayload(
				UUID.randomUUID(), vehicleId, driverId, null, OffsetDateTime.now(), null));

		consumer.consumeAssignmentEvent(json);

		ArgumentCaptor<DriverStatusInput> cap = ArgumentCaptor.forClass(DriverStatusInput.class);
		verify(driverService).updateDriverStatus(eq(driverId), cap.capture());
		assertEquals(DriverStatus.ACTIVE, cap.getValue().status());
	}

	@Test
	void consumeAssignmentEvent_OtherType_ShouldNotUpdateStatus() throws Exception {
		UUID driverId = UUID.randomUUID();
		String json = envelopeJson("OTHER", new AssignmentPayload(
				UUID.randomUUID(), UUID.randomUUID(), driverId, null, null, null));

		consumer.consumeAssignmentEvent(json);

		verify(driverService, never()).updateDriverStatus(any(), any());
	}

	@Test
	void consumeAssignmentEvent_InvalidJson_ShouldSwallowException() {
		consumer.consumeAssignmentEvent("not-json{");
		verify(driverService, never()).updateDriverStatus(any(), any());
	}

	private String envelopeJson(String type, AssignmentPayload payload) throws Exception {
		KafkaEventEnvelope<AssignmentPayload> env = new KafkaEventEnvelope<>(
				UUID.randomUUID(),
				type,
				"1.0",
				OffsetDateTime.now(),
				payload,
				new EventMetadata(UUID.randomUUID(), "test")
		);
		return objectMapper.writeValueAsString(env);
	}
}
