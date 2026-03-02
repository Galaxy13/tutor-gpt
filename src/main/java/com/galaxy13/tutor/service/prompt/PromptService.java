package com.galaxy13.tutor.service.prompt;

import com.galaxy13.tutor.dto.PromptDto;
import java.util.List;

public interface PromptService {
    PromptDto getCurrentPrompt();

    List<PromptDto> getAllPrompts();

    PromptDto getPromptByVersion(Long version);

    PromptDto createPrompt(PromptDto.CreatePromptRequest request);
}
