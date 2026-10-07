package com.alumni.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String company;
    
    private String location;
    private String type;
    
    @NotBlank
    private String description;
    
    private String applyLink;
}
