package com.galaxy13.tutor.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ChatResponse(UUID id, String name, LocalDateTime createdAt) {
}
