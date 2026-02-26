package com.galaxy13.tutor.service.auth;

import com.galaxy13.tutor.dto.AuthDto;

import java.util.List;
import java.util.UUID;

public interface AuthService {

    AuthDto.AuthResponse login(AuthDto.LoginRequest request);

    AuthDto.AuthResponse register(AuthDto.RegisterRequest request);

    AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request);
}
