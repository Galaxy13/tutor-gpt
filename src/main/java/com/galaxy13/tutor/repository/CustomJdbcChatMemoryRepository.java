package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.Message;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Repository;

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
    public void saveAll(String conversationId, List<Message> messages) {
        List<ChatMessage> entities = messages.stream()
                .map(m -> {
                    ChatMessage entity = new ChatMessage();
                    entity.setConversationId(UUID.fromString(conversationId));
                    entity.setContent(m.getText());
                    entity.setType(ChatMessage.MessageType.valueOf(m.getMessageType().name()));
                    entity.setTimestamp(LocalDateTime.now());
                    return entity;
                }).toList();
        chatMessageRepository.saveAll(entities);
    }

    @Override
    public void deleteByConversationId(String conversationId) {
        chatMessageRepository.deleteByConversationId(UUID.fromString(conversationId));
    }
}
