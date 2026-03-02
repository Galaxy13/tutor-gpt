package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageJpaRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findByConversationIdOrderByTimestampAsc(UUID conversationId);

    @Modifying
    @Transactional
    void deleteByConversationId(UUID conversationId);
}
