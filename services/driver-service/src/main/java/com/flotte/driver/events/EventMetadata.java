package com.flotte.driver.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EventMetadata(UUID correlationId, String triggeredBy) {}

