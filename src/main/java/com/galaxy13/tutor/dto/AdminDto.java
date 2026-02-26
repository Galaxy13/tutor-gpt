package com.galaxy13.tutor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

public class AdminDto {

    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserRegisterRequest {

        @NotBlank(message = "Username is required")
        @Size(min = 5, max = 100, message = "Username must be between 5 to 100 characters")
        private String username;

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 to 50 characters")
        private String name;

        @NotBlank(message = "Surname is required")
        @Size(min = 2, max = 50, message = "Surname must be up to 50 characters")
        private String surname;

        @NotBlank(message = "Role is required parameter")
        private String role;

        private String contact;

        @NotBlank(message = "Password is required")
        private String password;

        private boolean isActive;
    }

    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserUpdateRequest {

        @NotBlank(message = "Username is required")
        @Size(min = 5, max = 100, message = "Username must be between 5 to 100 characters")
        private String username;

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 to 50 characters")
        private String name;

        @NotBlank(message = "Surname is required")
        @Size(min = 2, max = 50, message = "Surname must be up to 50 characters")
        private String surname;

        @NotBlank(message = "Role is required parameter")
        private String role;

        private String contact;

        private boolean isActive;
    }

}
