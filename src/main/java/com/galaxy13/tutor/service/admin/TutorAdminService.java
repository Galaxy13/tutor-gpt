package com.galaxy13.tutor.service.admin;

import com.galaxy13.tutor.dto.AdminDto;
import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.exception.BadRequestException;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorAdminService implements AdminService {

    private final UserRepository userRepository;

    private final Converter<User, UserDto> userDtoConverter;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream().map(userDtoConverter::convert).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> findUsersByNameAndSurname(String name, String surname) {
        return userRepository.getUserByNameLikeAndSurnameLike(name, surname)
                .stream()
                .map(userDtoConverter::convert).toList();
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

        User user = userRepository.getUserById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User with id: " + userId + " not found"));
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
        User user = userRepository.getUserById(id).orElseThrow(
                () -> new ResourceNotFoundException("User with id: " + id + " not found"));
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.getUserById(id).orElseThrow(
                () -> new ResourceNotFoundException("User with id: " + id + " not found"));
        if (user.getRole().equals(Role.ADMIN)) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("You are not allowed to delete last administrator");
            }
        }
        userRepository.deleteById(id);
        log.info("User with id: {} has been deleted", id);
    }
}
