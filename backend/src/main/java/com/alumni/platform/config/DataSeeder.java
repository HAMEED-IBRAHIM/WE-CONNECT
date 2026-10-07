package com.alumni.platform.config;

import com.alumni.platform.model.*;
import com.alumni.platform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      PostRepository postRepository,
                                      CommentRepository commentRepository,
                                      JobRepository jobRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if seeded users exist, if yes skip
            if (userRepository.findByEmail("admin@example.com").isPresent()) {
                System.out.println("Admin already exists. Ready.");
                return;
            }
            System.out.println("Seeding database with System Admin only...");

            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setVerificationStatus(VerificationStatus.APPROVED);
            userRepository.save(admin);

            System.out.println("Database ready. Awaiting real users to register!");
        };
    }
}
