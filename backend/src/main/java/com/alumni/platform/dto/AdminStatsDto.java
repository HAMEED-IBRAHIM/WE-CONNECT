package com.alumni.platform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDto {
    private long totalUsers;
    private long totalStudents;
    private long totalAlumni;
    private long totalAdmins;
    private long totalPosts;
    private long pendingVerifications;
    private long approvedAlumni;
    private long rejectedVerifications;
}
