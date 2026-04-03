package com.flotte.driver.jobs;

import com.flotte.driver.events.producers.DriverEventProducer;
import com.flotte.driver.models.Driver;
import com.flotte.driver.models.DriverLicense;
import com.flotte.driver.models.enums.DriverStatus;
import com.flotte.driver.models.enums.LicenseCategory;
import com.flotte.driver.repositories.DriverLicenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LicenseSchedulerTest {

	@Mock
	private DriverLicenseRepository licenseRepository;

	@Mock
	private DriverEventProducer eventProducer;

	@InjectMocks
	private LicenseScheduler scheduler;

	@Test
	void checkLicenseExpirations_ShouldNotifyExpiringAndExpired() {
		LocalDate in30 = LocalDate.now().plusDays(30);
		LocalDate today = LocalDate.now();

		Driver driver = new Driver();
		driver.setId(UUID.randomUUID());
		driver.setFirstName("A");
		driver.setLastName("B");
		driver.setEmployeeId("E1");
		driver.setStatus(DriverStatus.ACTIVE);

		DriverLicense expiring = new DriverLicense();
		expiring.setLicenseNumber("L1");
		expiring.setCategory(LicenseCategory.B);
		expiring.setExpiryDate(in30);
		expiring.setDriver(driver);

		DriverLicense expired = new DriverLicense();
		expired.setLicenseNumber("L2");
		expired.setCategory(LicenseCategory.B);
		expired.setExpiryDate(today);
		expired.setDriver(driver);

		when(licenseRepository.findByExpiryDate(in30)).thenReturn(List.of(expiring));
		when(licenseRepository.findByExpiryDate(today)).thenReturn(List.of(expired));

		scheduler.checkLicenseExpirations();

		verify(eventProducer).sendLicenseExpiringEvent(expiring);
		verify(eventProducer).sendLicenseExpiredEvent(expired);
	}
}
