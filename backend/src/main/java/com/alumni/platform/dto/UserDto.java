package com.alumni.platform.dto;

import com.alumni.platform.model.Role;
import com.alumni.platform.model.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private Role role;
    private String bio;
    private String profilePicture;
    private String graduationYear;
    private String degree;
    private String department;
    private String company;
    private String jobTitle;
    private String linkedInUrl;
    private String location;
    private VerificationStatus verificationStatus;
    private String verificationNote;
    private LocalDateTime verificationSubmittedAt;
    private LocalDateTime verificationReviewedAt;
    private String verifiedByName;
    private long postCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
