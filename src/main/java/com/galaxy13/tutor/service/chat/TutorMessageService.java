package com.galaxy13.tutor.service.chat;

import com.galaxy13.tutor.client.AiClient;
import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.exception.BadRequestException;
import com.galaxy13.tutor.exception.NotEnoughRightsException;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Chat;
import com.galaxy13.tutor.model.ChatMessage;
import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.repository.ChatMessageJpaRepository;
import com.galaxy13.tutor.repository.ChatRepository;
import com.galaxy13.tutor.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.content.Media;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    public List<MessageDto> getMessagesByChatId(UUID chatId, UserPrincipal principal) {
        Chat chat = getChatAndValidateAccess(chatId, principal);
        return messageRepository.findByConversationIdOrderByTimestampAsc(chat.getId()).stream()
                .map(messageConverter::convert).toList();
    }

    @Transactional
    @Override
    public MessageDto sendMessage(UUID chatId, MessageDto.MessageRequest request, UserPrincipal principal) {
        Chat chat = getChatAndValidateAccess(chatId, principal);
        String response = aiClient.chat(chat.getId(), request.getMessage(), true);
        return MessageDto.builder()
                .chatId(chatId)
                .type(ChatMessage.MessageType.ASSISTANT)
                .content(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public MessageDto sendMessageWithoutPrompt(UUID chatId, MessageDto.MessageRequest request, UserPrincipal principal) {
        if (!principal.getRole().equals(Role.ADMIN)) {
            throw new BadRequestException("Only admin can send messages without prompt");
        }

        Chat chat = getChatAndValidateAccess(chatId, principal);
        String response = aiClient.chat(chat.getId(), request.getMessage(), false);
        return MessageDto.builder()
                .chatId(chatId)
                .type(ChatMessage.MessageType.ASSISTANT)
                .content(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public MessageDto sendMessageWithImage(UUID chatId,
                                           MessageDto.MessageRequest request,
                                           UserPrincipal principal,
                                           boolean withPrompt, MultipartFile image){
        Chat chat = getChatAndValidateAccess(chatId, principal);

        if (!withPrompt && !principal.getRole().equals(Role.ADMIN)) {
            throw new NotEnoughRightsException("User has no right to send promptless message");
        }

        MimeType mimeType = (image.getContentType() != null) ?
                MimeTypeUtils.parseMimeType(image.getContentType()) : MimeTypeUtils.IMAGE_JPEG;

        Resource imageResource;

        try {
            imageResource = new ByteArrayResource(image.getBytes()) {
                @Override public String getFilename() {
                    return image.getOriginalFilename();
                }
            };
        } catch (IOException e) {
            throw new BadRequestException("Image resource cannot be read");
        }

        Media media = new Media(mimeType, imageResource);

        String response = aiClient.chatWithImage(chat.getId(), request.getMessage(), withPrompt, media);
        return MessageDto.builder()
                .chatId(chatId)
                .type(ChatMessage.MessageType.ASSISTANT)
                .content(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private Chat getChatAndValidateAccess(UUID chatId, UserPrincipal principal) {
        Chat chat = chatRepository.findChatById(chatId).orElseThrow(() ->
                new ResourceNotFoundException("Chat with id:" + chatId + " not found"));

        if (!principal.getRole().equals(Role.ADMIN) && !chat.getUser().getId().equals(principal.getId())) {
            throw new BadRequestException("User is not allowed to access this chat");
        }
        return chat;
    }
}
