package com.galaxy13.tutor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    private String contact;

    private String role;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class UpdateUserRequest {

        @NotNull
        private UUID id;

        private String contact;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChangePasswordRequest {

        @NotBlank
        private String currentPassword;

        @Size(min = 8, message = "Password must be at least 8 characters")
        private String newPassword;
    }
}
