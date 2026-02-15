package com.galaxy13.tutor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatClient chatClient;

    public String chat(String prompt) {
        return chatClient.prompt(prompt).call().content();
    }
}
