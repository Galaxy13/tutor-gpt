package com.galaxy13.tutor.service.admin;

import com.galaxy13.tutor.dto.AdminDto;
import com.galaxy13.tutor.dto.UserDto;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    List<UserDto> getAllUsers();

    List<UserDto> findUsersByNameAndSurname(String name, String surname);

    UserDto registerUser(AdminDto.UserRegisterRequest request);

    UserDto updateUser(UUID id, AdminDto.UserUpdateRequest request);

    void resetUserPassword(UUID id, String password);

    void deleteUser(UUID id);
}
