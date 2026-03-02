package com.galaxy13.tutor.converter;

import com.galaxy13.tutor.dto.PromptDto;
import com.galaxy13.tutor.model.Prompt;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class PromptDtoConverter implements Converter<Prompt, PromptDto> {
    @Override
    public PromptDto convert(Prompt source) {
        return PromptDto.builder().version(source.getId()).content(source.getContent()).build();
    }
}
