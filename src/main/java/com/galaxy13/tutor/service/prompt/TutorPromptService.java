package com.galaxy13.tutor.service.prompt;

import com.galaxy13.tutor.dto.PromptDto;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Prompt;
import com.galaxy13.tutor.repository.PromptRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TutorPromptService implements PromptService {

    private final PromptRepository repository;

    private final Converter<Prompt, PromptDto> converter;

    @Override
    public PromptDto getCurrentPrompt() {
        Prompt prompt =
                repository
                        .findTopByOrderByIdDesc()
                        .orElseThrow(() -> new ResourceNotFoundException("No prompt found"));
        return converter.convert(prompt);
    }

    @Override
    public List<PromptDto> getAllPrompts() {
        return repository.findAll().stream().map(converter::convert).toList();
    }

    @Override
    public PromptDto getPromptByVersion(Long version) {
        Prompt prompt =
                repository
                        .findById(version)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Prompt with id:" + version + " not found"));
        return converter.convert(prompt);
    }

    @Override
    public PromptDto createPrompt(PromptDto.CreatePromptRequest request) {
        Prompt prompt = new Prompt();
        prompt.setContent(request.getContent());
        prompt = repository.save(prompt);
        return converter.convert(prompt);
    }
}
