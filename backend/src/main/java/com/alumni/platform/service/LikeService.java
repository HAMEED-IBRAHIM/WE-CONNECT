package com.alumni.platform.service;

import com.alumni.platform.dto.LikeResponse;
import com.alumni.platform.exception.ResourceNotFoundException;
import com.alumni.platform.model.Comment;
import com.alumni.platform.model.Like;
import com.alumni.platform.model.Post;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.CommentRepository;
import com.alumni.platform.repository.LikeRepository;
import com.alumni.platform.repository.PostRepository;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public LikeResponse togglePostLike(Long postId) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        var existing = likeRepository.findByUserIdAndPostId(currentUser.getId(), postId);
        boolean liked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            Like like = Like.builder().user(currentUser).post(post).build();
            likeRepository.save(like);
            liked = true;
        }
        return LikeResponse.builder()
                .liked(liked)
                .likeCount(likeRepository.countByPostId(postId))
                .build();
    }

    public LikeResponse toggleCommentLike(Long commentId) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        var existing = likeRepository.findByUserIdAndCommentId(currentUser.getId(), commentId);
        boolean liked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            Like like = Like.builder().user(currentUser).comment(comment).build();
            likeRepository.save(like);
            liked = true;
        }
        return LikeResponse.builder()
                .liked(liked)
                .likeCount(likeRepository.countByCommentId(commentId))
                .build();
    }

    private User getCurrentUser() {
        UserDetailsImpl details = (UserDetailsImpl) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return userRepository.findById(details.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
}
