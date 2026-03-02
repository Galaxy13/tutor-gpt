package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.AdminDto;
import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.service.admin.AdminService;
import com.galaxy13.tutor.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administration endpoints (Admin role required)")
public class AdminUserController {

    private final AdminService adminService;

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    @Operation(summary = "Search users")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String name, @RequestParam String surname) {
        List<UserDto> users = adminService.findUsersByNameAndSurname(name, surname);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        UserDto user = userService.getCurrentUser(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(summary = "Register a new user")
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody AdminDto.UserRegisterRequest request) {
        UserDto user = adminService.registerUser(request);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update user info")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable UUID id, @Valid @RequestBody AdminDto.UserUpdateRequest request) {
        UserDto user = adminService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{id}/reset_password")
    @Operation(summary = "Reset user password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id, @Valid @RequestBody AdminDto.ResetPasswordRequest request) {
        adminService.resetUserPassword(id, request);
        return ResponseEntity.ok(null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(null);
    }
}
