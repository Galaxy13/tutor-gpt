package com.galaxy13.tutor.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder
public record ChatDto(
        UUID id, String name, LocalDateTime createdAt, Long promptVersion, String username) {}
