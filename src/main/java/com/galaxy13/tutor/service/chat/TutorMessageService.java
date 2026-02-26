package com.galaxy13.tutor.service.chat;

import com.galaxy13.tutor.client.AiClient;
import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.ChatMessage;
import com.galaxy13.tutor.repository.ChatMessageJpaRepository;
import com.galaxy13.tutor.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorMessageService implements MessageService {

    private final AiClient aiClient;

    private final ChatMessageJpaRepository messageRepository;

    private final ChatRepository chatRepository;

    private final Converter<ChatMessage, MessageDto> messageConverter;

    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> getMessagesByChatId(UUID chatId) {
        ensureChatExists(chatId);
        return messageRepository.findByConversationIdOrderByTimestampAsc(chatId).stream()
                .map(messageConverter::convert).toList();
    }

    @Override
    public MessageDto sendMessage(UUID chatId, String message) {
        ensureChatExists(chatId);
        String response = aiClient.chat(chatId, message);
        return MessageDto.builder()
                .chatId(chatId)
                .type(ChatMessage.MessageType.ASSISTANT)
                .content(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private void ensureChatExists(UUID chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat not found with id: " + chatId);
        }
    }
}
