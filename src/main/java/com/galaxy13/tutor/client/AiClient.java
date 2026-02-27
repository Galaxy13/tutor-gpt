package com.galaxy13.tutor.client;

import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Chat;
import com.galaxy13.tutor.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiClient {

    private final ChatClient chatClient;

    private final ChatRepository chatRepository;

    public String chat(UUID chatId, String userMessage, boolean isPromptIncluded) {
        Chat chat = chatRepository.findChatById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id:" + chatId));
        String prompt = chat.getPrompt() != null ? promptBeautify(chat.getPrompt().getContent()) : "";

        var promptRequest = chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId.toString()));
        if (!prompt.isBlank() || isPromptIncluded) {
            promptRequest = promptRequest.system(prompt);
        }

        return promptRequest
                .call()
                .content();
    }

    private String promptBeautify(Map<String, String> prompt) {
        if (prompt == null || prompt.isEmpty()) {
            return "";
        }

        return prompt.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\n"));
    }
}
