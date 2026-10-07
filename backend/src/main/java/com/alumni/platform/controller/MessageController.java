package com.alumni.platform.controller;

import com.alumni.platform.model.Message;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.MessageRepository;
import com.alumni.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    // Send a message
    @PostMapping("/send/{recipientId}")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long recipientId,
            @RequestBody Map<String, String> body) {
        
        User sender = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        if (sender.getId().equals(recipient.getId())) {
            return ResponseEntity.badRequest().body("Cannot message yourself");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(body.get("content"));
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);

        Map<String, Object> response = new HashMap<>();
        response.put("id", message.getId());
        response.put("content", message.getContent());
        response.put("senderId", sender.getId());
        response.put("senderName", sender.getFirstName() + " " + sender.getLastName());
        response.put("createdAt", message.getCreatedAt().toString());
        return ResponseEntity.ok(response);
    }

    // Get conversation with a specific user
    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        User otherUser = userRepository.findById(userId).orElseThrow();

        List<Message> messages = messageRepository.findConversation(currentUser, otherUser);

        // Mark received messages as read
        for (Message m : messages) {
            if (m.getRecipient().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        }

        List<Map<String, Object>> result = messages.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("content", m.getContent());
            map.put("senderId", m.getSender().getId());
            map.put("senderName", m.getSender().getFirstName() + " " + m.getSender().getLastName());
            map.put("recipientId", m.getRecipient().getId());
            map.put("isRead", m.isRead());
            map.put("createdAt", m.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Get all conversations (inbox)
    @GetMapping("/inbox")
    public ResponseEntity<?> getInbox(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        List<User> partners = messageRepository.findConversationPartners(currentUser);

        List<Map<String, Object>> inbox = new ArrayList<>();
        for (User partner : partners) {
            List<Message> conversation = messageRepository.findConversation(currentUser, partner);
            Message lastMessage = conversation.get(conversation.size() - 1);
            long unread = conversation.stream()
                .filter(m -> m.getRecipient().getId().equals(currentUser.getId()) && !m.isRead())
                .count();

            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", partner.getId());
            entry.put("firstName", partner.getFirstName());
            entry.put("lastName", partner.getLastName());
            entry.put("profilePicture", partner.getProfilePicture());
            entry.put("jobTitle", partner.getJobTitle());
            entry.put("lastMessage", lastMessage.getContent());
            entry.put("lastMessageTime", lastMessage.getCreatedAt().toString());
            entry.put("unreadCount", unread);
            inbox.add(entry);
        }

        // Sort by latest message
        inbox.sort((a, b) -> ((String) b.get("lastMessageTime")).compareTo((String) a.get("lastMessageTime")));
        return ResponseEntity.ok(inbox);
    }

    // Get unread count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        long count = messageRepository.countUnreadMessages(user);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
