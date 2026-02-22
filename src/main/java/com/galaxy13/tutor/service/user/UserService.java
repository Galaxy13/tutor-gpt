package com.galaxy13.tutor.service.user;

import com.galaxy13.tutor.dto.UserRequest;
import com.galaxy13.tutor.dto.UserDto;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserDto> getAllUsers();

    List<UserDto> findUsersByNameAndSurname(String name, String surname);

    UserDto registerUser(UserRequest request);

    UserDto getUserById(UUID id);

    UserDto updateUser(UserRequest request);

    void deleteUser(UUID id);
}
