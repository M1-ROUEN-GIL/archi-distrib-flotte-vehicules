package com.flotte.driver.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LicenseInfo(
        String licenseNumber,
        String category,
        LocalDate expiryDate,
        Integer daysRemaining
) {}

