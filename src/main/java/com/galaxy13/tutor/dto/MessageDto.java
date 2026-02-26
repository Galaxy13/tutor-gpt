package com.galaxy13.tutor.dto;

import com.galaxy13.tutor.model.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
}
