package com.galaxy13.tutor.client;

import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Chat;
import com.galaxy13.tutor.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiClient {

    private final ChatClient chatClient;

    private final ChatRepository chatRepository;

    public String chatWithImage(UUID chatId,
                                String message,
                                boolean isPromptIncluded,
                                Media media) {
        Chat chat = chatRepository.findChatById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id: " + chatId));
        String defaultPrompt = "Style: Text strictly in Markdown";
        String prompt = chat.getPrompt() != null ?
                promptBeautify(chat.getPrompt().getContent(), defaultPrompt, isPromptIncluded) : defaultPrompt;


        var promptRequest = chatClient.prompt()
                .user(u -> u.text(message)
                        .media(media))
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId.toString()))
                .system(prompt);

        return promptRequest
                .call()
                .content();
    }

    public String chat(UUID chatId, String userMessage, boolean isPromptIncluded) {
        Chat chat = chatRepository.findChatById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id:" + chatId));
        String defaultPrompt = "Style: Text strictly in Markdown";
        String prompt = chat.getPrompt() != null ?
                promptBeautify(chat.getPrompt().getContent(), defaultPrompt, isPromptIncluded) : defaultPrompt;

        var promptRequest = chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId.toString()))
                .system(prompt);

        return promptRequest
                .call()
                .content();
    }

    private String promptBeautify(Map<String, String> prompt, String defaultPrompt, boolean isPromptIncluded) {
        if (prompt == null || prompt.isEmpty() || !isPromptIncluded) {
            return defaultPrompt;
        }

        prompt.put("Style", "Text strictly in Markdown");

        return prompt.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\n"));
    }
}
