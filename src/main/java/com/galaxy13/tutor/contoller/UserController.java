package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.security.UserPrincipal;
import com.galaxy13.tutor.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/me")
@RequiredArgsConstructor
@Tag(name = "User", description = "Current user profile endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserDto> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDto dto = userService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(dto);
    }

    @PatchMapping
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserDto.UpdateUserRequest request) {
        UserDto dto = userService.updateUser(principal.getId(), request);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/password")
    @Operation(summary = "Change password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserDto.ChangePasswordRequest request) {
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(null);
    }
}
