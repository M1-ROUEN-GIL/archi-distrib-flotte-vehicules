package com.flotte.driver.events;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DriverEventFactoryTest {

	private final UUID id = UUID.randomUUID();

	@Test
	void driverCreated_ShouldSetType() {
		var env = DriverEventFactory.driverCreated(id, "A", "B", "E1", "ACTIVE");
		assertEquals("DRIVER_CREATED", env.eventType());
		assertEquals(id, env.payload().driverId());
	}

	@Test
	void driverUpdated_ShouldSetType() {
		var env = DriverEventFactory.driverUpdated(id, "A", "B", "E1", "ACTIVE");
		assertEquals("DRIVER_UPDATED", env.eventType());
	}

	@Test
	void driverStatusChanged_ShouldSetType() {
		var env = DriverEventFactory.driverStatusChanged(id, "A", "B", "E1", "ACTIVE", "ON_LEAVE");
		assertEquals("DRIVER_STATUS_CHANGED", env.eventType());
		assertTrue(env.payload().status() instanceof StatusChange);
	}

	@Test
	void licenseExpiring_ShouldSetType() {
		LocalDate exp = LocalDate.now().plusMonths(1);
		var env = DriverEventFactory.licenseExpiring(id, "A", "B", "E1", "ACTIVE", "L1", "B", exp, 12);
		assertEquals("LICENSE_EXPIRING", env.eventType());
		assertNotNull(env.payload().license());
	}

	@Test
	void licenseExpired_ShouldSetType() {
		LocalDate exp = LocalDate.now();
		var env = DriverEventFactory.licenseExpired(id, "A", "B", "E1", "ACTIVE", "L1", "B", exp);
		assertEquals("LICENSE_EXPIRED", env.eventType());
		assertEquals(0, env.payload().license().daysRemaining());
	}
}
