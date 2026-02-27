package com.galaxy13.tutor.converter;

import com.galaxy13.tutor.dto.ChatDto;
import com.galaxy13.tutor.model.Chat;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class ChatResponseConverter implements Converter<Chat, ChatDto> {
    @Override
    public ChatDto convert(Chat source) {
        return ChatDto.builder()
                .id(source.getId())
                .name(source.getName())
                .createdAt(source.getCreatedAt())
                .promptVersion(source.getPrompt().getId())
                .build();
    }
}
