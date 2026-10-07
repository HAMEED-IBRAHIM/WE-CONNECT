package com.alumni.platform.controller;

import com.alumni.platform.model.Connection;
import com.alumni.platform.model.ConnectionStatus;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.ConnectionRepository;
import com.alumni.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/connections")
public class ConnectionController {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/request/{recipientId}")
    public ResponseEntity<?> sendRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long recipientId) {
        User requester = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        if (requester.getId().equals(recipient.getId())) {
            return ResponseEntity.badRequest().body("Cannot connect with yourself");
        }

        if (connectionRepository.existsByRequesterAndRecipient(requester, recipient) || 
            connectionRepository.existsByRequesterAndRecipient(recipient, requester)) {
            return ResponseEntity.badRequest().body("Connection or request already exists");
        }

        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setRecipient(recipient);
        connection.setStatus(ConnectionStatus.PENDING);
        connectionRepository.save(connection);

        return ResponseEntity.ok(Map.of("message", "Connection request sent", "status", "PENDING"));
    }

    @PostMapping("/accept/{connectionId}")
    public ResponseEntity<?> acceptRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long connectionId) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Connection connection = connectionRepository.findById(connectionId).orElseThrow();

        if (!connection.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to accept this request");
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        connectionRepository.save(connection);
        return ResponseEntity.ok(Map.of("message", "Connection accepted"));
    }
    
    @PostMapping("/reject/{connectionId}")
    public ResponseEntity<?> rejectRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long connectionId) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Connection connection = connectionRepository.findById(connectionId).orElseThrow();

        if (!connection.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to reject this request");
        }

        connectionRepository.delete(connection);
        return ResponseEntity.ok(Map.of("message", "Connection rejected/deleted"));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getConnectionStatus(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long userId) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        User otherUser = userRepository.findById(userId).orElseThrow();

        // Check if current requested other
        var conn1 = connectionRepository.findByRequesterAndRecipient(currentUser, otherUser);
        if (conn1.isPresent()) {
            return ResponseEntity.ok(Map.of("status", conn1.get().getStatus().name(), "isRequester", true, "connectionId", conn1.get().getId()));
        }

        // Check if other requested current
        var conn2 = connectionRepository.findByRequesterAndRecipient(otherUser, currentUser);
        if (conn2.isPresent()) {
            return ResponseEntity.ok(Map.of("status", conn2.get().getStatus().name(), "isRequester", false, "connectionId", conn2.get().getId()));
        }

        return ResponseEntity.ok(Map.of("status", "NONE"));
    }
}
