package com.galaxy13.tutor.dto;

import com.galaxy13.tutor.model.ChatMessage;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    private String content;

    private ChatMessage.MessageType type;

    private UUID chatId;

    private LocalDateTime timestamp;

    private String imageUrl;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class MessageRequest {

        private String message;
    }
}
