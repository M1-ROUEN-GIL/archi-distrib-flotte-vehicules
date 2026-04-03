package com.flotte.maintenance.events;

import com.flotte.maintenance.model.MaintenanceType;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class MaintenanceEventTest {

	@Test
	void factoryMethods_ShouldSetEventType() {
		UUID mid = UUID.randomUUID();
		UUID vid = UUID.randomUUID();
		assertEquals("maintenance.scheduled", MaintenanceEvent.scheduled(mid, vid, MaintenanceType.PREVENTIVE).eventType());
		assertEquals("maintenance.started", MaintenanceEvent.started(mid, vid, MaintenanceType.PREVENTIVE).eventType());
		assertEquals("maintenance.completed", MaintenanceEvent.completed(mid, vid, MaintenanceType.PREVENTIVE).eventType());
		assertEquals("maintenance.cancelled", MaintenanceEvent.cancelled(mid, vid, MaintenanceType.PREVENTIVE).eventType());
	}
}
