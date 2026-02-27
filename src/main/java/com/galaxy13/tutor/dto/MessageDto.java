package com.galaxy13.tutor.dto;

import com.galaxy13.tutor.model.ChatMessage;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    private String content;

    private ChatMessage.MessageType type;

    private UUID chatId;

    private LocalDateTime timestamp;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class MessageRequest {

        private String message;
    }
}
