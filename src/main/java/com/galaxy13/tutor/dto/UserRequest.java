package com.galaxy13.tutor.dto;

public record UserRequest(String name,
                          String surname,
                          String role,
                          String password) {
}
