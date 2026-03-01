package com.galaxy13.tutor.service.auth;

import com.galaxy13.tutor.config.JwtConfigurationProperties;
import com.galaxy13.tutor.dto.AuthDto;
import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.exception.BadRequestException;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.UserRepository;
import com.galaxy13.tutor.security.JWTUtils;
import com.galaxy13.tutor.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.ConversionService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TutorAuthService implements AuthService {

    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    private final JWTUtils jwtUtils;

    private final JwtConfigurationProperties jwtProperties;

    private final ConversionService conversionService;

    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        if (principal == null) {
            throw new BadRequestException("Invalid username or password");
        }
        User user =
                userRepository
                        .findById(principal.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = jwtUtils.generateToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);

        return AuthDto.AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .user(conversionService.convert(user, UserDto.class))
                .build();
    }

    @Override
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setContact(request.getContact());
        user.setRole(Role.USER);
        user.setIsActive(true);

        user = userRepository.save(user);

        String accessToken = jwtUtils.generateToken(user.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        return AuthDto.AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .user(conversionService.convert(user, UserDto.class))
                .build();
    }

    @Override
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtils.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String tokenType = jwtUtils.extractTokenType(refreshToken);
        if (!tokenType.equals("refresh")) {
            throw new BadRequestException("Invalid token type");
        }

        String username = jwtUtils.extractUsername(refreshToken);
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getIsActive()) throw new BadRequestException("User is inactive");

        String newAccessToken = jwtUtils.generateToken(user.getUsername());
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        return AuthDto.AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .user(conversionService.convert(user, UserDto.class))
                .build();
    }
}
