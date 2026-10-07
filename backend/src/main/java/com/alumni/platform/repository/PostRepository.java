package com.alumni.platform.repository;

import com.alumni.platform.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByAuthorIdAndPublishedTrue(Long authorId, Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        WHERE p.published = true
        AND (:query IS NULL OR
             LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY p.createdAt DESC
    """)
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.published = true")
    long countPublishedPosts();

    @Query("""
        SELECT p FROM Post p
        LEFT JOIN FETCH p.author
        WHERE p.id = :id AND p.published = true
    """)
    java.util.Optional<Post> findByIdWithAuthor(@Param("id") Long id);
}
