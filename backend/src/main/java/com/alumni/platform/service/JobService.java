package com.alumni.platform.service;

import com.alumni.platform.dto.JobDto;
import com.alumni.platform.dto.JobRequest;
import com.alumni.platform.exception.ResourceNotFoundException;
import com.alumni.platform.model.Job;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.JobRepository;
import com.alumni.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<JobDto> searchJobs(String query, Pageable pageable) {
        Page<Job> jobs;
        if (query != null && !query.trim().isEmpty()) {
            jobs = jobRepository.searchJobs(query, pageable);
        } else {
            jobs = jobRepository.findAll(pageable);
        }
        return jobs.map(this::mapToDto);
    }

    @Transactional
    public JobDto createJob(JobRequest request, Long authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setType(request.getType());
        job.setDescription(request.getDescription());
        job.setApplyLink(request.getApplyLink());
        job.setAuthor(author);

        return mapToDto(jobRepository.save(job));
    }

    @Transactional
    public void deleteJob(Long id, Long currentUserId, boolean isAdmin) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!isAdmin && !job.getAuthor().getId().equals(currentUserId)) {
            throw new RuntimeException("Not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    private JobDto mapToDto(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setLocation(job.getLocation());
        dto.setType(job.getType());
        dto.setDescription(job.getDescription());
        dto.setApplyLink(job.getApplyLink());
        dto.setCreatedAt(job.getCreatedAt());

        User a = job.getAuthor();
        JobDto.AuthorInfo authorInfo = new JobDto.AuthorInfo();
        authorInfo.setId(a.getId());
        authorInfo.setFirstName(a.getFirstName());
        authorInfo.setLastName(a.getLastName());
        authorInfo.setFullName(a.getFullName());
        authorInfo.setCompany(a.getCompany());
        authorInfo.setJobTitle(a.getJobTitle());
        dto.setAuthor(authorInfo);

        return dto;
    }
}
