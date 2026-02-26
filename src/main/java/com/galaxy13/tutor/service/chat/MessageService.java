package com.galaxy13.tutor.service.chat;

import com.galaxy13.tutor.dto.MessageDto;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    List<MessageDto> getMessagesByChatId(UUID chatId);

    MessageDto sendMessage(UUID chatId, String message);
}
