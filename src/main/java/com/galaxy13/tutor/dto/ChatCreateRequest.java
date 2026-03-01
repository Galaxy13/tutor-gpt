package com.galaxy13.tutor.dto;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ChatCreateRequest {
    private String name;

    private String message;
}
