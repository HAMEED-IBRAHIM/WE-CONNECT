package com.alumni.platform.service;

import com.alumni.platform.dto.*;
import com.alumni.platform.exception.ResourceNotFoundException;
import com.alumni.platform.model.Role;
import com.alumni.platform.model.User;
import com.alumni.platform.model.VerificationStatus;
import com.alumni.platform.repository.PostRepository;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public Page<UserDto> searchUsers(String query, Role role, Pageable pageable) {
        return userRepository.searchUsers(query, role, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getUsersByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable).map(this::toDto);
    }

    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getGraduationYear() != null) user.setGraduationYear(request.getGraduationYear());
        if (request.getDegree() != null) user.setDegree(request.getDegree());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getCompany() != null) user.setCompany(request.getCompany());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());
        if (request.getLinkedInUrl() != null) user.setLinkedInUrl(request.getLinkedInUrl());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        return toDto(userRepository.save(user));
    }

    public UserDto submitVerification(Long userId, String documentUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != Role.ROLE_ALUMNI) {
            throw new IllegalArgumentException("Only alumni can submit verification");
        }
        user.setVerificationStatus(VerificationStatus.PENDING);
        user.setVerificationDocument(documentUrl);
        user.setVerificationSubmittedAt(LocalDateTime.now());
        return toDto(userRepository.save(user));
    }

    // Admin: review verification
    public UserDto reviewVerification(Long userId, boolean approved, String note) {
        User admin = getCurrentUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setVerificationStatus(approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
        user.setVerificationNote(note);
        user.setVerificationReviewedAt(LocalDateTime.now());
        user.setVerifiedBy(admin);

        return toDto(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getPendingVerifications(Pageable pageable) {
        return userRepository.findByVerificationStatus(VerificationStatus.PENDING, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        return AdminStatsDto.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole(Role.ROLE_STUDENT))
                .totalAlumni(userRepository.countByRole(Role.ROLE_ALUMNI))
                .totalAdmins(userRepository.countByRole(Role.ROLE_ADMIN))
                .totalPosts(postRepository.countPublishedPosts())
                .pendingVerifications(userRepository.countByVerificationStatus(VerificationStatus.PENDING))
                .approvedAlumni(userRepository.countByVerificationStatus(VerificationStatus.APPROVED))
                .rejectedVerifications(userRepository.countByVerificationStatus(VerificationStatus.REJECTED))
                .build();
    }

    // Admin: delete user
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    private User getCurrentUser() {
        UserDetailsImpl details = (UserDetailsImpl) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return userRepository.findById(details.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .bio(user.getBio())
                .profilePicture(user.getProfilePicture())
                .graduationYear(user.getGraduationYear())
                .degree(user.getDegree())
                .department(user.getDepartment())
                .company(user.getCompany())
                .jobTitle(user.getJobTitle())
                .linkedInUrl(user.getLinkedInUrl())
                .location(user.getLocation())
                .verificationStatus(user.getVerificationStatus())
                .verificationNote(user.getVerificationNote())
                .verificationSubmittedAt(user.getVerificationSubmittedAt())
                .verificationReviewedAt(user.getVerificationReviewedAt())
                .verifiedByName(user.getVerifiedBy() != null ? user.getVerifiedBy().getFullName() : null)
                .postCount(user.getPosts() != null ? user.getPosts().size() : 0)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserSummaryDto toSummaryDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .verificationStatus(user.getVerificationStatus())
                .jobTitle(user.getJobTitle())
                .company(user.getCompany())
                .department(user.getDepartment())
                .build();
    }
}
