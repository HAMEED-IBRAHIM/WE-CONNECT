package com.alumni.platform.controller;

import com.alumni.platform.dto.AdminStatsDto;
import com.alumni.platform.dto.UserDto;
import com.alumni.platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(userService.getAdminStats());
    }

    @GetMapping("/verifications/pending")
    public ResponseEntity<Page<UserDto>> getPendingVerifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("verificationSubmittedAt").ascending());
        return ResponseEntity.ok(userService.getPendingVerifications(pageable));
    }

    @PatchMapping("/verifications/{userId}")
    public ResponseEntity<UserDto> reviewVerification(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        boolean approved = (Boolean) body.get("approved");
        String note = (String) body.getOrDefault("note", "");
        return ResponseEntity.ok(userService.reviewVerification(userId, approved, note));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(userService.searchUsers(query, null, pageable));
    }
}
