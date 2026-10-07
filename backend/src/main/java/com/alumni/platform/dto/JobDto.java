package com.alumni.platform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobDto {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String type;
    private String description;
    private String applyLink;
    private AuthorInfo author;
    private LocalDateTime createdAt;

    @Data
    public static class AuthorInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String company;
        private String jobTitle;
    }
}
