package com.galaxy13.tutor.config;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.Message;

import java.util.List;

@RequiredArgsConstructor
public class CustomMemory implements ChatMemory {

    private final ChatMemoryRepository repository;

    @Override
    public void add(String conversationId, List<Message> messages) {
        repository.saveAll(conversationId, messages);
    }

    @Override
    public List<Message> get(String conversationId) {
        return repository.findByConversationId(conversationId);
    }

    @Override
    public void clear(String conversationId) {
        repository.deleteByConversationId(conversationId);
    }
}
