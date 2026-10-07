package com.alumni.platform.controller;

import com.alumni.platform.dto.LikeResponse;
import com.alumni.platform.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LikeResponse> togglePostLike(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.togglePostLike(postId));
    }

    @PostMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LikeResponse> toggleCommentLike(@PathVariable Long commentId) {
        return ResponseEntity.ok(likeService.toggleCommentLike(commentId));
    }
}
