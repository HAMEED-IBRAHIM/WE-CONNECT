package com.alumni.platform.repository;

import com.alumni.platform.model.Connection;
import com.alumni.platform.model.ConnectionStatus;
import com.alumni.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    
    Optional<Connection> findByRequesterAndRecipient(User requester, User recipient);
    
    @Query("SELECT c FROM Connection c WHERE (c.requester = :user OR c.recipient = :user) AND c.status = :status")
    List<Connection> findConnectionsByUserAndStatus(User user, ConnectionStatus status);

    @Query("SELECT c FROM Connection c WHERE c.recipient = :user AND c.status = 'PENDING'")
    List<Connection> findPendingRequestsForUser(User user);
    
    boolean existsByRequesterAndRecipient(User requester, User recipient);

    List<Connection> findByRequesterAndStatus(User requester, ConnectionStatus status);
    List<Connection> findByRecipientAndStatus(User recipient, ConnectionStatus status);
}
