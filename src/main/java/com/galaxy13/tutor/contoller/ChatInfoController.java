package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.ChatCreateRequest;
import com.galaxy13.tutor.dto.ChatDto;
import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.security.UserPrincipal;
import com.galaxy13.tutor.service.chat.MessageService;
import com.galaxy13.tutor.service.info.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat_info")
@RequiredArgsConstructor
@Tag(name = "Chat Info", description = "Get chat info for specific user")
public class ChatInfoController {

    private final ChatService chatService;

    private final MessageService messageService;

    @GetMapping
    @Operation(description = "Get all chats info for specific user")
    public ResponseEntity<List<ChatDto>> getAllChats(@AuthenticationPrincipal UserPrincipal principal) {
        List<ChatDto> chats = chatService.getChatsByUserId(principal.getId());
        return ResponseEntity.ok(chats);
    }

    @PostMapping
    @Operation(description = "Create chat for current user")
    public ResponseEntity<ChatDto> createChat(@AuthenticationPrincipal UserPrincipal principal,
                                              @RequestBody(required = false) ChatCreateRequest request) {
        ChatCreateRequest payload = request == null ? new ChatCreateRequest() : request;
        ChatDto chat = chatService.createChat(principal.getId(), payload, true);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/messages/{chat_id}")
    @Operation(description = "Get all messages for chat")
    public ResponseEntity<List<MessageDto>> getMessagesForChat(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable(name = "chat_id") UUID chatId) {
        List<MessageDto> messages = messageService.getMessagesByChatId(chatId, principal);
        return ResponseEntity.ok(messages);
    }
}
