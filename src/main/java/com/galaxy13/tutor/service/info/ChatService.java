package com.galaxy13.tutor.service.info;

import com.galaxy13.tutor.dto.ChatCreateRequest;
import com.galaxy13.tutor.dto.ChatDto;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    List<ChatDto> getAllChats();

    List<ChatDto> getChatsByUserId(UUID userId);

    ChatDto getChatById(UUID id);

    ChatDto createChat(UUID userId, ChatCreateRequest request, boolean withPrompt);

    void deleteChat(UUID id);
}
