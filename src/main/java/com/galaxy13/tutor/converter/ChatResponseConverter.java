package com.galaxy13.tutor.converter;

import com.galaxy13.tutor.dto.ChatResponse;
import com.galaxy13.tutor.model.Chat;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class ChatResponseConverter implements Converter<Chat, ChatResponse> {
    @Override
    public ChatResponse convert(Chat source) {
        return ChatResponse.builder()
                .id(source.getId())
                .name(source.getName())
                .createdAt(source.getCreatedAt()).build();
    }
}
