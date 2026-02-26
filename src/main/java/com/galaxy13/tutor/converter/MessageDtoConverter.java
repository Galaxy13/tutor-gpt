package com.galaxy13.tutor.converter;

import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.model.ChatMessage;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class MessageDtoConverter implements Converter<ChatMessage, MessageDto> {
    @Override
    public MessageDto convert(ChatMessage source) {
        return MessageDto.builder()
                .type(source.getType())
                .content(source.getContent())
                .chatId(source.getConversationId())
                .timestamp(source.getTimestamp()).build();
    }
}
