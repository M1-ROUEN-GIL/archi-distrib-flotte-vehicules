package com.flotte.events.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AcknowledgeRequest(
        @NotNull UUID userId
) {}
