package com.alumni.platform.controller;

import com.alumni.platform.model.Connection;
import com.alumni.platform.model.ConnectionStatus;
import com.alumni.platform.model.User;
import com.alumni.platform.repository.ConnectionRepository;
import com.alumni.platform.repository.UserRepository;
import com.alumni.platform.security.UserDetailsImpl;
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

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        if (userDetails instanceof UserDetailsImpl impl) {
            return userRepository.findById(impl.getId()).orElse(null);
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseGet(() -> userRepository.findByUsername(userDetails.getUsername()).orElse(null));
    }

    @PostMapping("/request/{recipientId}")
    public ResponseEntity<?> sendRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long recipientId) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User requester = resolveUser(userDetails);
        User recipient = userRepository.findById(recipientId).orElse(null);

        if (requester == null || recipient == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        if (requester.getId().equals(recipient.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot connect with yourself"));
        }

        if (connectionRepository.existsByRequesterAndRecipient(requester, recipient) || 
            connectionRepository.existsByRequesterAndRecipient(recipient, requester)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Connection or request already exists"));
        }

        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setRecipient(recipient);
        connection.setStatus(ConnectionStatus.PENDING);
        connection.setCreatedAt(java.time.LocalDateTime.now());
        connectionRepository.save(connection);

        return ResponseEntity.ok(Map.of("message", "Connection request sent", "status", "PENDING"));
    }

    @PostMapping("/accept/{connectionId}")
    public ResponseEntity<?> acceptRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long connectionId) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = resolveUser(userDetails);
        Connection connection = connectionRepository.findById(connectionId).orElse(null);

        if (user == null || connection == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Connection request not found"));
        }

        if (!connection.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to accept this request"));
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        connectionRepository.save(connection);
        return ResponseEntity.ok(Map.of("message", "Connection accepted"));
    }
    
    @PostMapping("/reject/{connectionId}")
    public ResponseEntity<?> rejectRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long connectionId) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = resolveUser(userDetails);
        Connection connection = connectionRepository.findById(connectionId).orElse(null);

        if (user == null || connection == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Connection request not found"));
        }

        if (!connection.getRecipient().getId().equals(user.getId()) && !connection.getRequester().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to reject/cancel this request"));
        }

        connectionRepository.delete(connection);
        return ResponseEntity.ok(Map.of("message", "Connection removed"));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getConnectionStatus(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long userId) {
        if (userDetails == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        User currentUser = resolveUser(userDetails);
        User otherUser = userRepository.findById(userId).orElse(null);

        if (currentUser == null || otherUser == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }

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

    @GetMapping("/my/accepted")
    public ResponseEntity<?> getAcceptedConnections(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        User user = resolveUser(userDetails);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Connection> sent = connectionRepository.findByRequesterAndStatus(user, ConnectionStatus.ACCEPTED);
        List<Connection> received = connectionRepository.findByRecipientAndStatus(user, ConnectionStatus.ACCEPTED);

        List<Map<String, Object>> connections = new java.util.ArrayList<>();
        for (Connection c : sent) {
            String timeStr = c.getCreatedAt() != null ? c.getCreatedAt().toString() : java.time.LocalDateTime.now().toString();
            connections.add(Map.of("connectionId", c.getId(), "user", userToMap(c.getRecipient()), "since", timeStr));
        }
        for (Connection c : received) {
            String timeStr = c.getCreatedAt() != null ? c.getCreatedAt().toString() : java.time.LocalDateTime.now().toString();
            connections.add(Map.of("connectionId", c.getId(), "user", userToMap(c.getRequester()), "since", timeStr));
        }
        return ResponseEntity.ok(connections);
    }

    @GetMapping("/my/pending")
    public ResponseEntity<?> getPendingConnections(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        User user = resolveUser(userDetails);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Connection> incoming = connectionRepository.findByRecipientAndStatus(user, ConnectionStatus.PENDING);

        List<Map<String, Object>> requests = new java.util.ArrayList<>();
        for (Connection c : incoming) {
            String timeStr = c.getCreatedAt() != null ? c.getCreatedAt().toString() : java.time.LocalDateTime.now().toString();
            requests.add(Map.of("connectionId", c.getId(), "user", userToMap(c.getRequester()), "requestedAt", timeStr));
        }
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/my/sent")
    public ResponseEntity<?> getSentConnections(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        User user = resolveUser(userDetails);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Connection> sent = connectionRepository.findByRequesterAndStatus(user, ConnectionStatus.PENDING);

        List<Map<String, Object>> requests = new java.util.ArrayList<>();
        for (Connection c : sent) {
            String timeStr = c.getCreatedAt() != null ? c.getCreatedAt().toString() : java.time.LocalDateTime.now().toString();
            requests.add(Map.of("connectionId", c.getId(), "user", userToMap(c.getRecipient()), "sentAt", timeStr));
        }
        return ResponseEntity.ok(requests);
    }

    private Map<String, Object> userToMap(User u) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", u.getId());
        map.put("firstName", u.getFirstName());
        map.put("lastName", u.getLastName());
        map.put("email", u.getEmail());
        map.put("jobTitle", u.getJobTitle());
        map.put("company", u.getCompany());
        map.put("department", u.getDepartment());
        map.put("profilePicture", u.getProfilePicture());
        map.put("bio", u.getBio());
        map.put("role", u.getRole() != null ? u.getRole().name() : null);
        return map;
    }
}
