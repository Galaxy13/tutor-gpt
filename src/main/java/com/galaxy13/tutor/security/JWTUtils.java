package com.galaxy13.tutor.security;

import com.galaxy13.tutor.config.JwtConfigurationProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
@Getter
@RequiredArgsConstructor
public class JWTUtils {
    private final JwtConfigurationProperties properties;

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        if (userDetails == null) {
            throw new IllegalStateException("User details are null in authentication");
        }
        return generateToken(userDetails.getUsername());
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        return createToken(claims, username);
    }

    public String generateFreshToken()

    private String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + properties.getExpiration()))
                .signWith(getSigningKey())
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(properties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
