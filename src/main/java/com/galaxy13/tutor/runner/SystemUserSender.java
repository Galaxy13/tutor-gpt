package com.galaxy13.tutor.runner;

import com.galaxy13.tutor.config.SystemUserProperties;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Component
@Slf4j
public class SystemUserSender implements ApplicationRunner {

    private final UserRepository repository;

    private final SystemUserProperties userProperties;

    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!userProperties.isEnabled()) return;

        if (userProperties.getPassword() == null
                || userProperties.getPassword().isBlank()
                || userProperties.getPassword().length() < 8) {
            log.warn("System user is enabled, but no password set or length is less than 8 characters");
            return;
        }

        if (userProperties.getUsername() == null || userProperties.getUsername().isBlank()) {
            log.warn("System user is enabled, but no username provided");
            return;
        }

        String passwordHash = encoder.encode(userProperties.getPassword());

        if (repository.existsByUsername(userProperties.getUsername())) {
            if (repository.existsByPasswordHash(passwordHash)) return;
            User user = repository.findUserByUsername(userProperties.getUsername()).orElseThrow(
                    () -> new ResourceNotFoundException("User not found while finding system user"));
            user.setPasswordHash(passwordHash);
            log.info("System user password changed");
            return;
        }

        User user = new User();
        user.setUsername(userProperties.getUsername());
        user.setPasswordHash(passwordHash);
        user.setName("System");
        user.setSurname("System");
        user.setRole(Role.ADMIN);
        user.setContact("gen.hort54@gmail.com");
        user.setIsActive(true);
        user = repository.save(user);
        userProperties.setId(user.getId());
    }
}
