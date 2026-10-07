package com.alumni.platform.repository;

import com.alumni.platform.model.Message;
import com.alumni.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(User user1, User user2);

    @Query("SELECT m FROM Message m WHERE m.recipient = :user AND m.read = false")
    List<Message> findUnreadMessages(User user);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient = :user AND m.read = false")
    long countUnreadMessages(User user);

    @Query("SELECT DISTINCT CASE WHEN m.sender = :user THEN m.recipient ELSE m.sender END FROM Message m WHERE m.sender = :user OR m.recipient = :user")
    List<User> findConversationPartners(User user);
}
