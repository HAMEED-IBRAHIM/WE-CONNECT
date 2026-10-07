package com.alumni.platform.controller;

import com.alumni.platform.dto.UpdateProfileRequest;
import com.alumni.platform.dto.UserDto;
import com.alumni.platform.model.Role;
import com.alumni.platform.security.UserDetailsImpl;
import com.alumni.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userService.searchUsers(query, role, pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getMe(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), request));
    }

    @PostMapping("/me/submit-verification")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<UserDto> submitVerification(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody Map<String, String> body) {
        String documentUrl = body.get("documentUrl");
        return ResponseEntity.ok(userService.submitVerification(currentUser.getId(), documentUrl));
    }
}
