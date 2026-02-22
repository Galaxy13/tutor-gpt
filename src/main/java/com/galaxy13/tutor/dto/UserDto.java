package com.galaxy13.tutor.dto;

import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserDto {

    private UUID id;

    private String name;

    private String surname;

    private String role;
}
