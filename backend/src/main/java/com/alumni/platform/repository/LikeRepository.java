package com.alumni.platform.repository;

import com.alumni.platform.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);

    Optional<Like> findByUserIdAndCommentId(Long userId, Long commentId);

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    boolean existsByUserIdAndCommentId(Long userId, Long commentId);

    long countByPostId(Long postId);

    long countByCommentId(Long commentId);

    void deleteByUserIdAndPostId(Long userId, Long postId);

    void deleteByUserIdAndCommentId(Long userId, Long commentId);
}
