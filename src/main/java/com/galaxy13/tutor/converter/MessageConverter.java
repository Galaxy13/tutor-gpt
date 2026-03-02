package com.galaxy13.tutor.converter;

import com.galaxy13.tutor.model.ChatMessage;
import org.springframework.ai.chat.messages.*;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class MessageConverter implements Converter<ChatMessage, Message> {
    @Override
    public Message convert(ChatMessage source) {
        return switch (source.getType()) {
            case USER -> new UserMessage(source.getContent());
            case SYSTEM -> new SystemMessage(source.getContent());
            case ASSISTANT -> new AssistantMessage(source.getContent());
            default ->
                    throw new IllegalArgumentException(
                            "Unsupported message type:" + source.getType());
        };
    }
}
