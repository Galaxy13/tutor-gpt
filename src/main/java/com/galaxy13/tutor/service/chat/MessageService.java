package com.galaxy13.tutor.service.chat;

import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    List<MessageDto> getMessagesByChatId(UUID chatId, UserPrincipal principal);

    MessageDto sendMessage(UUID chatId, MessageDto.MessageRequest request, UserPrincipal principal);

    MessageDto sendMessageWithoutPrompt(UUID chatId, MessageDto.MessageRequest request, UserPrincipal principal);

    MessageDto sendMessageWithImage(UUID chatId,
                                    MessageDto.MessageRequest request,
                                    UserPrincipal principal,
                                    boolean withPrompt, MultipartFile image);
}
