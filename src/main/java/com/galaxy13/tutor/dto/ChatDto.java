package com.galaxy13.tutor.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ChatDto(UUID id,
                      String name,
                      LocalDateTime createdAt,
                      Long promptVersion,
                      String userName) {
}
