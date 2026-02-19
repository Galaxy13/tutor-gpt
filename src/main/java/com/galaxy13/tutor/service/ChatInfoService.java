package com.galaxy13.tutor.service;

import com.galaxy13.tutor.dto.ChatResponse;

import java.util.List;
import java.util.UUID;

public interface ChatInfoService {
    List<ChatResponse> getAllChats();

    List<ChatResponse> getChatsByUserId(UUID userId);

    ChatResponse getChatById(UUID id);

    void deleteChat(UUID id);
}
