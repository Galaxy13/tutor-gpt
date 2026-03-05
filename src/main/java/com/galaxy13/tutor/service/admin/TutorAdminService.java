package com.galaxy13.tutor.service.admin;

import com.galaxy13.tutor.config.SystemUserProperties;
import com.galaxy13.tutor.dto.AdminDto;
import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.exception.BadRequestException;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.galaxy13.tutor.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorAdminService implements AdminService {

    private final UserRepository userRepository;

    private final Converter<User, UserDto> userDtoConverter;

    private final PasswordEncoder passwordEncoder;

    private final SystemUserProperties systemUserProperties;

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(userDtoConverter::convert).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> findUsersByNameAndSurname(String name, String surname) {
        return userRepository.getUserByNameLikeAndSurnameLike(name, surname).stream()
                .map(userDtoConverter::convert)
                .toList();
    }

    @Override
    @Transactional
    public UserDto registerUser(AdminDto.UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setContact(request.getContact());
        user.setRole(Role.valueOf(request.getRole()));

        user = userRepository.save(user);
        return userDtoConverter.convert(user);
    }

    @Override
    @Transactional
    public UserDto updateUser(UUID userId, AdminDto.UserUpdateRequest request) {
        if (userRepository.existsByUsernameAndIdNot(request.getUsername(), userId)) {
            throw new BadRequestException("Username already exists");
        }
        if (userId.equals(systemUserProperties.getId())) {
            throw new BadRequestException("А не дохуя ли хочешь? Обновлять системного пользователя запрещено");
        }

        User user =
                userRepository
                        .getUserById(userId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "User with id: " + userId + " not found"));

        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setUsername(request.getUsername());
        user.setIsActive(request.isActive());
        user.setContact(request.getContact());
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }
        user.setRole(role);

        user = userRepository.save(user);
        return userDtoConverter.convert(user);
    }

    @Override
    @Transactional
    public void resetUserPassword(UUID id, AdminDto.ResetPasswordRequest request) {
        if (id.equals(systemUserProperties.getId())) {
            throw new BadRequestException("Ага, щас. Иди нахуй");
        }

        User user =
                userRepository
                        .getUserById(id)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "User with id: " + id + " not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(UserPrincipal principal, UUID id) {
        if (id == principal.getId()) {
            throw new BadRequestException("Ты еблан? Зачем ты удаляешь себя?");
        }
        if (id.equals(systemUserProperties.getId())) {
            throw new BadRequestException("Ты охуел? Хуй тебе, отсоси");
        }

        User user =
                userRepository
                        .getUserById(id)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Пользователь с id: " + id + " не найден"));

        if (user.getRole().equals(Role.ADMIN)) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Удалять последнего администратора запрещено");
            }
        }
        userRepository.deleteById(id);
        log.info("User with id: {} has been deleted", id);
    }
}
