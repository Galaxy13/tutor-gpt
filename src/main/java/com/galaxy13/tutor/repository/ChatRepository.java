package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {
    @Query("SELECT c.id FROM chats c")
    List<UUID> findAllIds();

    Optional<Chat> findChatById(UUID id);

    List<Chat> findChatsByUserId(UUID userId);
}
