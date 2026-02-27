package com.galaxy13.tutor.security;

import com.galaxy13.tutor.config.JwtConfigurationProperties;
import io.jsonwebtoken.*;
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
import java.util.function.Function;

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
        return createToken(generateAccessClaim(), userDetails.getUsername(), properties.getExpiration());
    }

    public String generateToken(String username) {
        return createToken(generateAccessClaim(), username, properties.getExpiration());
    }

    public String generateRefreshToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        if (userDetails == null) {
            throw new IllegalStateException("User details are null in authentication");
        }
        return createToken(generateRefreshClaim(), userDetails.getUsername(), properties.getRefreshExpiration());
    }

    public String generateRefreshToken(String username) {
        return createToken(generateRefreshClaim(), username, properties.getRefreshExpiration());
    }

    public boolean isAccessToken(String token) {
        return "access".equals(extractTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(extractTokenType(token));
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT Token: {}",  e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT Token: {}",  e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT Token: {}",  e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}",  e.getMessage());
        }
        return false;
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type").toString());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private String createToken(Map<String, Object> claims, String username, Long expiration) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    private Map<String, Object> generateAccessClaim() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        return claims;
    }

    private Map<String, Object> generateRefreshClaim() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return claims;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(properties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
