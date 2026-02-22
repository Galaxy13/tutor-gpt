package com.galaxy13.tutor.service.auth;

import com.galaxy13.tutor.dto.AuthDto;
import com.galaxy13.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorAuthService implements AuthService {

    private final UserRepository userRepository;

    @Override
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        return null;
    }

    @Override
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        return null;
    }

    @Override
    public AuthDto.ApiTokenResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        return null;
    }

    @Override
    public AuthDto.ApiTokenResponse createApiToken(UUID userId, AuthDto.ApiTokenRequest request) {
        return null;
    }

    @Override
    public List<AuthDto.ApiTokenResponse> getApiTokensByUser(UUID userId) {
        return List.of();
    }

    @Override
    public void removeApiToken(UUID userId, UUID tokenId) {

    }
}
