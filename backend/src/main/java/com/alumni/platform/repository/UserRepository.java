package com.alumni.platform.repository;

import com.alumni.platform.model.Role;
import com.alumni.platform.model.User;
import com.alumni.platform.model.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    @Query("""
        SELECT u FROM User u
        WHERE (:role IS NULL OR u.role = :role)
        AND (:query IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.department) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.company) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.jobTitle) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.bio) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.degree) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.location) LIKE LOWER(CONCAT('%', :query, '%')))
    """)
    Page<User> searchUsers(@Param("query") String query,
                           @Param("role") Role role,
                           Pageable pageable);

    long countByRole(Role role);

    long countByVerificationStatus(VerificationStatus status);
}
