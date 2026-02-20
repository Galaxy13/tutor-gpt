package com.galaxy13.tutor.service.auth;

import com.galaxy13.tutor.dto.AuthDto;

import java.util.List;
import java.util.UUID;

public interface AuthService {

    AuthDto.AuthResponse login(AuthDto.LoginRequest request);

    AuthDto.AuthResponse register(AuthDto.RegisterRequest request);

    AuthDto.ApiTokenResponse refreshToken(AuthDto.RefreshTokenRequest request);

    AuthDto.ApiTokenResponse createApiToken(UUID userId, AuthDto.ApiTokenRequest request);

    List<AuthDto.ApiTokenResponse> getApiTokensByUser(UUID userId);

    void removeApiToken(UUID userId, UUID tokenId);
}
