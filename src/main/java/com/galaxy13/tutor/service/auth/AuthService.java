package com.galaxy13.tutor.service.auth;

import com.galaxy13.tutor.dto.AuthDto;

public interface AuthService {

    AuthDto.AuthResponse login(AuthDto.LoginRequest request);

    AuthDto.AuthResponse register(AuthDto.RegisterRequest request);

    AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request);
}
