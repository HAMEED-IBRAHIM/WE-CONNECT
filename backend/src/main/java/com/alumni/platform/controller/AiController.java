package com.alumni.platform.controller;

import com.alumni.platform.model.User;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/icebreaker/{recipientId}")
    public ResponseEntity<?> getIcebreaker(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long recipientId) {
        User sender = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        String message = aiService.generateIcebreaker(
            sender.getBio() != null ? sender.getBio() : "Professional", 
            sender.getJobTitle() != null ? sender.getJobTitle() : "Alumni",
            recipient.getBio() != null ? recipient.getBio() : "Professional",
            recipient.getJobTitle() != null ? recipient.getJobTitle() : "Alumni"
        );

        return ResponseEntity.ok(Map.of("message", message));
    }
}
