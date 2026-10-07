package com.alumni.platform.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;

    private String graduationYear;
    private String degree;
    private String department;
    private String company;
    private String jobTitle;
    private String linkedInUrl;
    private String location;
    private String profilePicture;
}
