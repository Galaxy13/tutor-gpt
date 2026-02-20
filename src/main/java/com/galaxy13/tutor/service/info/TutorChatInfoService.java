package com.galaxy13.tutor.service.info;

import com.galaxy13.tutor.converter.ChatResponseConverter;
import com.galaxy13.tutor.dto.ChatResponse;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorChatInfoService implements ChatInfoService {

    private final ChatRepository chatRepository;

    private final ChatResponseConverter chatConverter;

    @Override
    public List<ChatResponse> getAllChats() {
        return chatRepository.findAll()
                .stream()
                .map(chatConverter::convert).toList();
    }

    @Override
    public List<ChatResponse> getChatsByUserId(UUID userId) {
        return chatRepository.findChatsByUserId(userId)
                .stream()
                .map(chatConverter::convert).toList();
    }

    @Override
    public ChatResponse getChatById(UUID id) {
        return chatRepository.findChatById(id)
                .map(chatConverter::convert)
                .orElseThrow(() -> new ResourceNotFoundException("Not found chat with id" + id));
    }

    @Override
    public void deleteChat(UUID id) {
        chatRepository.deleteById(id);
    }
}
