package com.flotte.driver.events.producers;

import com.flotte.driver.events.DriverEventFactory;
import com.flotte.driver.events.DriverPayload;
import com.flotte.driver.events.KafkaEventEnvelope;
import com.flotte.driver.models.Driver;
import com.flotte.driver.models.DriverLicense;
import com.flotte.driver.models.enums.DriverStatus;
import com.flotte.driver.models.enums.LicenseCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DriverEventProducerTest {

	@Mock
	private KafkaTemplate<String, Object> kafkaTemplate;

	@InjectMocks
	private DriverEventProducer producer;

	private Driver driver;
	private DriverLicense license;

	@BeforeEach
	void setUp() {
		driver = new Driver();
		driver.setId(UUID.randomUUID());
		driver.setFirstName("A");
		driver.setLastName("B");
		driver.setEmployeeId("E1");
		driver.setStatus(DriverStatus.ACTIVE);

		license = new DriverLicense();
		license.setLicenseNumber("LN");
		license.setCategory(LicenseCategory.B);
		license.setIssuedDate(LocalDate.now().minusYears(5));
		license.setExpiryDate(LocalDate.now().plusDays(10));
		license.setDriver(driver);
	}

	@Test
	void publishDriverEvent_ShouldSendToKafka() {
		KafkaEventEnvelope<DriverPayload> event = DriverEventFactory.driverCreated(
				driver.getId(), "A", "B", "E1", "ACTIVE");
		producer.publishDriverEvent(event);
		verify(kafkaTemplate).send(eq("flotte.conducteurs.events"), eq(driver.getId().toString()), eq(event));
	}

	@Test
	void sendLicenseExpiringEvent_ShouldSend() {
		producer.sendLicenseExpiringEvent(license);
		@SuppressWarnings("unchecked")
		ArgumentCaptor<KafkaEventEnvelope<DriverPayload>> cap = ArgumentCaptor.forClass(KafkaEventEnvelope.class);
		verify(kafkaTemplate).send(eq("flotte.conducteurs.events"), eq(driver.getId().toString()), cap.capture());
		assertEquals("LICENSE_EXPIRING", cap.getValue().eventType());
	}

	@Test
	void sendLicenseExpiredEvent_ShouldSend() {
		producer.sendLicenseExpiredEvent(license);
		@SuppressWarnings("unchecked")
		ArgumentCaptor<KafkaEventEnvelope<DriverPayload>> cap = ArgumentCaptor.forClass(KafkaEventEnvelope.class);
		verify(kafkaTemplate).send(eq("flotte.conducteurs.events"), eq(driver.getId().toString()), cap.capture());
		assertEquals("LICENSE_EXPIRED", cap.getValue().eventType());
	}
}
