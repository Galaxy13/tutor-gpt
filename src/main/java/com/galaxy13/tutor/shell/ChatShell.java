package com.galaxy13.tutor.shell;

import com.galaxy13.tutor.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.shell.core.command.annotation.Argument;
import org.springframework.shell.core.command.annotation.Command;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatShell {

    private final AiService aiService;

    @Command(description = "Send chat to GPT")
    public String chat(@Argument(index = 0, description = "Your prompt") String prompt) {
        return aiService.chat(prompt, "1234");
    }
}
