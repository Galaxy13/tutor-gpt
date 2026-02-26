package com.galaxy13.tutor.shell;

import com.galaxy13.tutor.client.AiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.shell.core.command.annotation.Argument;
import org.springframework.shell.core.command.annotation.Command;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ChatShell {

    private final AiClient aiClient;

    @Command(description = "Send chat to GPT")
    public String chat(@Argument(index = 0, description = "Your prompt") String userMessage) {
        return aiClient.chat(UUID.fromString("cbefeec0-1f8b-4448-813f-41ee61da6c93"), userMessage);
    }
}
