package com.alumni.platform.dto;

import com.alumni.platform.model.Role;
import com.alumni.platform.model.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private VerificationStatus verificationStatus;
    private String profilePicture;
    private LocalDateTime createdAt;
}
