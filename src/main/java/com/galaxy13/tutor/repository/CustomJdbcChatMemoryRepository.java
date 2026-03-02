package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.Message;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CustomJdbcChatMemoryRepository implements ChatMemoryRepository {

    private final ChatMessageJpaRepository chatMessageRepository;

    private final ChatRepository chatRepository;

    private final Converter<ChatMessage, Message> converter;

    @Override
    public List<String> findConversationIds() {
        return chatRepository.findAllIds()
                .stream()
                .map(UUID::toString)
                .toList();
    }

    @Override
    public List<Message> findByConversationId(String conversationId) {
        return chatMessageRepository.findByConversationIdOrderByTimestampAsc(UUID.fromString(conversationId))
                .stream()
                .map(converter::convert)
                .toList();
    }

    @Override
    @Transactional
    public void saveAll(String conversationId, List<Message> messages) {
        UUID convId = UUID.fromString(conversationId);

        List<ChatMessage> existing = chatMessageRepository.findByConversationIdOrderByTimestampAsc(convId);
        int existingCount = existing.size();

        // MessageWindowChatMemory may trim old messages when the window overflows.
        // If the incoming list is shorter or leading messages changed, do a full replace.
        boolean needsFullReplace = messages.size() < existingCount
                || !prefixMatches(existing, messages, existingCount);

        if (needsFullReplace) {
            chatMessageRepository.deleteByConversationId(convId);
            chatMessageRepository.flush();
            existingCount = 0;
        }

        // Only save messages beyond what already exists in DB
        List<ChatMessage> newEntities = messages.subList(existingCount, messages.size()).stream()
                .map(m -> {
                    ChatMessage entity = new ChatMessage();
                    entity.setConversationId(convId);
                    entity.setContent(m.getText());
                    entity.setType(ChatMessage.MessageType.valueOf(m.getMessageType().name()));
                    entity.setTimestamp(LocalDateTime.now());
                    return entity;
                }).toList();

        if (!newEntities.isEmpty()) {
            chatMessageRepository.saveAll(newEntities);
        }
    }

    private boolean prefixMatches(List<ChatMessage> existing, List<Message> incoming, int count) {
        for (int i = 0; i < count; i++) {
            ChatMessage e = existing.get(i);
            Message m = incoming.get(i);
            if (!e.getContent().equals(m.getText())
                    || !e.getType().name().equals(m.getMessageType().name())) {
                return false;
            }
        }
        return true;
    }

    @Override
    @Transactional
    public void deleteByConversationId(String conversationId) {
        chatMessageRepository.deleteByConversationId(UUID.fromString(conversationId));
    }
}
