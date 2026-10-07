package com.alumni.platform.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostDto {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private String tags;
    private UserSummaryDto author;
    private long likeCount;
    private long commentCount;
    private boolean likedByCurrentUser;
    private boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
