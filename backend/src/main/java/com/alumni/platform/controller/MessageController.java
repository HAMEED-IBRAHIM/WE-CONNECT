package com.alumni.platform.controller;

import com.alumni.platform.model.Message;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.MessageRepository;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.security.UserDetailsImpl;
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

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        if (userDetails instanceof UserDetailsImpl impl) {
            return userRepository.findById(impl.getId()).orElse(null);
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseGet(() -> userRepository.findByUsername(userDetails.getUsername()).orElse(null));
    }

    // Send a message
    @PostMapping("/send/{recipientId}")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long recipientId,
            @RequestBody Map<String, String> body) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User sender = resolveUser(userDetails);
        User recipient = userRepository.findById(recipientId).orElse(null);

        if (sender == null || recipient == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sender or recipient not found"));
        }

        if (sender.getId().equals(recipient.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot message yourself"));
        }

        String content = body != null ? body.get("content") : null;
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message content cannot be empty"));
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);

        Map<String, Object> response = new HashMap<>();
        response.put("id", message.getId());
        response.put("content", message.getContent());
        response.put("senderId", sender.getId());
        response.put("senderName", sender.getFirstName() + " " + sender.getLastName());
        response.put("createdAt", message.getCreatedAt() != null ? message.getCreatedAt().toString() : LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    // Get conversation with a specific user
    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        User currentUser = resolveUser(userDetails);
        User otherUser = userRepository.findById(userId).orElse(null);

        if (currentUser == null || otherUser == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Message> messages = messageRepository.findConversation(currentUser, otherUser);
        if (messages == null) {
            return ResponseEntity.ok(List.of());
        }

        // Mark received messages as read
        for (Message m : messages) {
            if (m.getRecipient() != null && m.getRecipient().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        }

        List<Map<String, Object>> result = messages.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("content", m.getContent());
            map.put("senderId", m.getSender() != null ? m.getSender().getId() : null);
            map.put("senderName", m.getSender() != null ? (m.getSender().getFirstName() + " " + m.getSender().getLastName()) : "User");
            map.put("recipientId", m.getRecipient() != null ? m.getRecipient().getId() : null);
            map.put("isRead", m.isRead());
            map.put("createdAt", m.getCreatedAt() != null ? m.getCreatedAt().toString() : "");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Get all conversations (inbox)
    @GetMapping("/inbox")
    public ResponseEntity<?> getInbox(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        User currentUser = resolveUser(userDetails);
        if (currentUser == null) {
            return ResponseEntity.ok(List.of());
        }
        
        Map<Long, User> partnerMap = new LinkedHashMap<>();
        List<User> recipients = messageRepository.findRecipientsByUser(currentUser);
        List<User> senders = messageRepository.findSendersByUser(currentUser);
        if (recipients != null) {
            for (User u : recipients) {
                if (u != null && !u.getId().equals(currentUser.getId())) {
                    partnerMap.put(u.getId(), u);
                }
            }
        }
        if (senders != null) {
            for (User u : senders) {
                if (u != null && !u.getId().equals(currentUser.getId())) {
                    partnerMap.put(u.getId(), u);
                }
            }
        }

        if (partnerMap.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Map<String, Object>> inbox = new ArrayList<>();
        for (User partner : partnerMap.values()) {
            List<Message> conversation = messageRepository.findConversation(currentUser, partner);
            if (conversation == null || conversation.isEmpty()) continue;
            
            Message lastMessage = conversation.get(conversation.size() - 1);
            long unread = conversation.stream()
                .filter(m -> m.getRecipient() != null && m.getRecipient().getId().equals(currentUser.getId()) && !m.isRead())
                .count();

            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", partner.getId());
            entry.put("firstName", partner.getFirstName());
            entry.put("lastName", partner.getLastName());
            entry.put("profilePicture", partner.getProfilePicture());
            entry.put("jobTitle", partner.getJobTitle());
            entry.put("lastMessage", lastMessage.getContent());
            entry.put("lastMessageTime", lastMessage.getCreatedAt() != null ? lastMessage.getCreatedAt().toString() : "");
            entry.put("unreadCount", unread);
            inbox.add(entry);
        }

        // Sort by latest message
        inbox.sort((a, b) -> {
            String timeA = (String) a.getOrDefault("lastMessageTime", "");
            String timeB = (String) b.getOrDefault("lastMessageTime", "");
            return timeB.compareTo(timeA);
        });
        return ResponseEntity.ok(inbox);
    }

    // Get unread count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok(Map.of("count", 0));
        User user = resolveUser(userDetails);
        if (user == null) return ResponseEntity.ok(Map.of("count", 0));
        long count = messageRepository.countUnreadMessages(user);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
