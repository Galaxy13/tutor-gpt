package com.galaxy13.tutor.config;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("jwt")
@NoArgsConstructor
@Getter
@Setter
public class JwtConfigurationProperties {

    private String secret;

    private Long expiration;

    private Long refreshExpiration;
}
