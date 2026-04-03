package com.flotte.vehicle.events;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record KafkaEventEnvelope<T>(
		UUID eventId,
		String eventType,
		String eventVersion,
		OffsetDateTime timestamp,
		T payload,
		EventMetadata metadata
) {}