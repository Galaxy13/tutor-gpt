package com.galaxy13.tutor.service;

import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Chat;
import com.galaxy13.tutor.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatClient chatClient;

    private final ChatRepository chatRepository;

    public String chat(UUID chatId, String userMessage) {
        Chat chat = chatRepository.findChatById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat nor found with id:" + chatId));
        String prompt = promptBeautify(chat.getPrompt().getContent());

        return chatClient.prompt()
                .system(prompt)
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId.toString()))
                .call()
                .content();
    }

    private String promptBeautify(Map<String, Object> prompt) {
        return "";
    }
}
