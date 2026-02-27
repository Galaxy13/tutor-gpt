package com.galaxy13.tutor.service.user;

import com.galaxy13.tutor.dto.UserDto;

import java.util.UUID;

public interface UserService {

    UserDto getCurrentUser(UUID id);

    UserDto updateUser(UUID id, UserDto.UpdateUserRequest request);

    void changePassword(UUID id, UserDto.ChangePasswordRequest request);
}
