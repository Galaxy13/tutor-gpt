package com.galaxy13.tutor.service.user;

import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.exception.BadRequestException;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorUserService implements UserService {

    private final UserRepository userRepository;

    private final Converter<User, UserDto> converter;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User with id: " + id + " not found"));
        return converter.convert(user);
    }

    @Override
    @Transactional
    public UserDto updateUser(UserDto.UpdateUserRequest request) {
        User user = userRepository.findById(request.getId()).orElseThrow(() ->
                new  ResourceNotFoundException("User with id: " + request.getId() + " not found"));
        user.setContact(request.getContact());
        return converter.convert(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(UUID id, UserDto.ChangePasswordRequest request) {
        User user = userRepository.getUserById(id).orElseThrow(() ->
                new ResourceNotFoundException("User with id: " + id + " not found"));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
