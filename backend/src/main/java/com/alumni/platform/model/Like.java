package com.alumni.platform.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "likes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_post_like", columnNames = {"user_id", "post_id"}),
        @UniqueConstraint(name = "uk_user_comment_like", columnNames = {"user_id", "comment_id"})
    },
    indexes = {
        @Index(name = "idx_like_post", columnList = "post_id"),
        @Index(name = "idx_like_comment", columnList = "comment_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
