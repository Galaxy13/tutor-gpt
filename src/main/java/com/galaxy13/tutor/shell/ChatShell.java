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
        return aiService.chat(prompt, "cbefeec0-1f8b-4448-813f-41ee61da6c93");
    }
}
