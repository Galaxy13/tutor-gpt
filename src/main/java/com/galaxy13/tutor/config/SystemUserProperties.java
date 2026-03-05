package com.galaxy13.tutor.config;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "system-user")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SystemUserProperties {

    private String username;

    private String password;

    private boolean enabled;
}
