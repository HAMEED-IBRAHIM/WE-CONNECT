package com.alumni.platform.dto;

import com.alumni.platform.model.Role;
import com.alumni.platform.model.VerificationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryDto {
    private Long id;
    private String username;
    private String fullName;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private Role role;
    private VerificationStatus verificationStatus;
    private String jobTitle;
    private String company;
    private String department;
}
