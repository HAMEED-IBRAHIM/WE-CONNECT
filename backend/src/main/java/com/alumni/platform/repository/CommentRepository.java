package com.alumni.platform.repository;

import com.alumni.platform.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
        SELECT c FROM Comment c
        LEFT JOIN FETCH c.author
        WHERE c.post.id = :postId AND c.parent IS NULL
        ORDER BY c.createdAt ASC
    """)
    Page<Comment> findRootCommentsByPostId(@Param("postId") Long postId, Pageable pageable);

    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);

    long countByPostId(Long postId);
}
