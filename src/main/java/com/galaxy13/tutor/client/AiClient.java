package com.galaxy13.tutor.client;

import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Chat;
import com.galaxy13.tutor.repository.ChatRepository;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.content.Media;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiClient {

    private final ChatClient chatClient;

    private final ChatRepository chatRepository;

    public String chatWithImage(
            UUID chatId,
            String message,
            boolean isPromptIncluded,
            Media media,
            Map<String, Object> metadata) {
        Chat chat =
                chatRepository
                        .findChatById(chatId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Chat not found with id: " + chatId));
        String defaultPrompt = "Style: Text strictly in Markdown";
        String prompt =
                chat.getPrompt() != null
                        ? promptBeautify(
                                chat.getPrompt().getContent(), defaultPrompt, isPromptIncluded)
                        : defaultPrompt;

        log.debug("Prompt text: {}", prompt);

        var promptRequest =
                chatClient
                        .prompt()
                        .user(
                                u ->
                                        u.text(message == null ? "" : message)
                                                .media(media)
                                                .metadata(metadata))
                        .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId.toString()))
                        .system(prompt);

        return promptRequest.call().content();
    }

    public String chat(UUID chatId, String userMessage, boolean isPromptIncluded) {
        Chat chat =
                chatRepository
                        .findChatById(chatId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Chat not found with id:" + chatId));
        String defaultPrompt = "Style: Text strictly in Markdown";
        String prompt =
                chat.getPrompt() != null
                        ? promptBeautify(
                                chat.getPrompt().getContent(), defaultPrompt, isPromptIncluded)
                        : defaultPrompt;

        log.debug("Prompt text: {}", prompt);

        var promptRequest =
                chatClient
                        .prompt()
                        .user(userMessage)
                        .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId.toString()))
                        .system(prompt);

        return promptRequest.call().content();
    }

    private String promptBeautify(
            Map<String, String> prompt, String defaultPrompt, boolean isPromptIncluded) {
        if (prompt == null || prompt.isEmpty() || !isPromptIncluded) {
            return defaultPrompt;
        }

        prompt.put("Style", "Text strictly in Markdown");

        return prompt.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\n"));
    }
}
