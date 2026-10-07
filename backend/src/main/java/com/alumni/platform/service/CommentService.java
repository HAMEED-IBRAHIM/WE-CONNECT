package com.alumni.platform.service;

import com.alumni.platform.dto.CommentDto;
import com.alumni.platform.dto.CommentRequest;
import com.alumni.platform.exception.ResourceNotFoundException;
import com.alumni.platform.exception.UnauthorizedException;
import com.alumni.platform.model.Comment;
import com.alumni.platform.model.Post;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.CommentRepository;
import com.alumni.platform.repository.LikeRepository;
import com.alumni.platform.repository.PostRepository;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final UserService userService;

    public CommentDto addComment(Long postId, CommentRequest request) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(currentUser)
                .parent(parent)
                .build();

        return toDto(commentRepository.save(comment), currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByPost(Long postId, Pageable pageable) {
        Long currentUserId = getCurrentUserIdOrNull();
        return commentRepository.findRootCommentsByPostId(postId, pageable)
                .map(c -> toDtoWithReplies(c, currentUserId));
    }

    public CommentDto updateComment(Long commentId, CommentRequest request) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return toDto(commentRepository.save(comment), currentUser.getId());
    }

    public void deleteComment(Long commentId) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        boolean isAdmin = currentUser.getRole().name().equals("ROLE_ADMIN");
        if (!comment.getAuthor().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private CommentDto toDtoWithReplies(Comment comment, Long currentUserId) {
        List<CommentDto> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId())
                .stream()
                .map(r -> toDto(r, currentUserId))
                .toList();
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(userService.toSummaryDto(comment.getAuthor()))
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(replies)
                .likeCount(likeRepository.countByCommentId(comment.getId()))
                .likedByCurrentUser(currentUserId != null &&
                        likeRepository.existsByUserIdAndCommentId(currentUserId, comment.getId()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private CommentDto toDto(Comment comment, Long currentUserId) {
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(userService.toSummaryDto(comment.getAuthor()))
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .likeCount(likeRepository.countByCommentId(comment.getId()))
                .likedByCurrentUser(currentUserId != null &&
                        likeRepository.existsByUserIdAndCommentId(currentUserId, comment.getId()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        UserDetailsImpl details = (UserDetailsImpl) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return userRepository.findById(details.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private Long getCurrentUserIdOrNull() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetailsImpl details) return details.getId();
        } catch (Exception ignored) {}
        return null;
    }
}
