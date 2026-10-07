package com.alumni.platform.service;

import com.alumni.platform.dto.*;
import com.alumni.platform.exception.ResourceNotFoundException;
import com.alumni.platform.exception.UnauthorizedException;
import com.alumni.platform.model.Post;
import com.alumni.platform.model.User;
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

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final UserService userService;

    public PostDto createPost(PostRequest request) {
        User currentUser = getCurrentUser();
        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .tags(request.getTags())
                .author(currentUser)
                .published(true)
                .build();
        return toDto(postRepository.save(post), currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Page<PostDto> getAllPosts(Pageable pageable) {
        Long currentUserId = getCurrentUserIdOrNull();
        return postRepository.findByPublishedTrueOrderByCreatedAtDesc(pageable)
                .map(p -> toDto(p, currentUserId));
    }

    @Transactional(readOnly = true)
    public Page<PostDto> searchPosts(String query, Pageable pageable) {
        Long currentUserId = getCurrentUserIdOrNull();
        return postRepository.searchPosts(query, pageable)
                .map(p -> toDto(p, currentUserId));
    }

    @Transactional(readOnly = true)
    public PostDto getPostById(Long id) {
        Long currentUserId = getCurrentUserIdOrNull();
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return toDto(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public Page<PostDto> getPostsByUser(Long userId, Pageable pageable) {
        Long currentUserId = getCurrentUserIdOrNull();
        return postRepository.findByAuthorIdAndPublishedTrue(userId, pageable)
                .map(p -> toDto(p, currentUserId));
    }

    public PostDto updatePost(Long postId, PostRequest request) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only edit your own posts");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());
        post.setTags(request.getTags());
        return toDto(postRepository.save(post), currentUser.getId());
    }

    public void deletePost(Long postId) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        boolean isAdmin = currentUser.getRole().name().equals("ROLE_ADMIN");
        if (!post.getAuthor().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new UnauthorizedException("You can only delete your own posts");
        }
        postRepository.delete(post);
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
            if (principal instanceof UserDetailsImpl details) {
                return details.getId();
            }
        } catch (Exception ignored) {}
        return null;
    }

    PostDto toDto(Post post, Long currentUserId) {
        boolean liked = currentUserId != null &&
                likeRepository.existsByUserIdAndPostId(currentUserId, post.getId());
        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .tags(post.getTags())
                .author(userService.toSummaryDto(post.getAuthor()))
                .likeCount(likeRepository.countByPostId(post.getId()))
                .commentCount(post.getCommentCount())
                .likedByCurrentUser(liked)
                .published(post.isPublished())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
