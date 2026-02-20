package com.galaxy13.tutor.service.user;

import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.dto.UserRequest;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorUserService implements UserService {

    private final UserRepository userRepository;

    private final Converter<User, UserDto> converter;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream().map(converter::convert).toList();
    }

    @Override
    public List<UserDto> findUsersByNameAndSurname(String name, String surname) {
        return userRepository.getUserByNameLikeAndSurnameLike(name, surname)
                .stream()
                .map(converter::convert).toList();
    }

    @Override
    public UserDto registerUser(UserRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setSurname(request.surname());
    }

    @Override
    public UserDto getUserById(UUID id) {
        return null;
    }

    @Override
    public UserDto updateUser(UserRequest request) {
        return null;
    }

    @Override
    public void deleteUser(UUID id) {

    }
}
