package com.alumni.platform.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentDto {
    private Long id;
    private String content;
    private UserSummaryDto author;
    private Long postId;
    private Long parentId;
    private List<CommentDto> replies;
    private long likeCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
