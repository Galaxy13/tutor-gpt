package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.ChatCreateRequest;
import com.galaxy13.tutor.dto.ChatDto;
import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.security.UserPrincipal;
import com.galaxy13.tutor.service.chat.MessageService;
import com.galaxy13.tutor.service.info.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/chats")
@RequiredArgsConstructor
@Tag(name = "Admin chat", description = "Chat endpoints for admin")
public class AdminChatController {

    private final ChatService chatService;

    private final MessageService messageService;

    @GetMapping
    @Operation(description = "Get all chats")
    public ResponseEntity<List<ChatDto>> getAllChats() {
        List<ChatDto> chats = chatService.getAllChats();
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/{user_id}")
    @Operation(description = "Get chat for specific user")
    public ResponseEntity<List<ChatDto>> getChatsByUserId(@PathVariable(name = "user_id") UUID userId) {
        List<ChatDto> chats = chatService.getChatsByUserId(userId);
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/messages/{chat_id}")
    @Operation(description = "Get all messages for specific chat")
    public ResponseEntity<List<MessageDto>> getMessagesByChatId(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable(name = "chat_id") UUID chatId) {
        List<MessageDto> messages = messageService.getMessagesByChatId(chatId, principal);
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    @Operation(description = "Create chat")
    public ResponseEntity<ChatDto> createChat(@AuthenticationPrincipal UserPrincipal principal,
                                              @RequestBody @Valid ChatCreateRequest request,
                                              @RequestParam(defaultValue = "true") boolean withPrompt) {
        ChatDto chat = chatService.createChat(principal.getId(), request, withPrompt);
        return ResponseEntity.ok(chat);
    }

    @PostMapping("/messages/{chat_id}")
    @Operation(description = "Send message to AI agent (admin). Use withPrompt param to control prompt inclusion.")
    public ResponseEntity<MessageDto> sendAdminMessage(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable(name = "chat_id") UUID chatId,
                                                       @Valid @RequestBody MessageDto.MessageRequest request,
                                                       @RequestParam(defaultValue = "true") boolean withPrompt) {
        MessageDto message = withPrompt
                ? messageService.sendMessage(chatId, request, principal)
                : messageService.sendMessageWithoutPrompt(chatId, request, principal);
        return ResponseEntity.ok(message);
    }

    @PostMapping(
            value = "/messages/image/{chat_id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(description = "Send message with image to AI agent (admin). Use withPrompt param to control prompt inclusion.")
    public ResponseEntity<MessageDto> sendAdminMessageWithImage(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable(name = "chat_id") UUID chatId,
                                                                @RequestPart("image") MultipartFile image,
                                                                @RequestPart("request") MessageDto.MessageRequest request,
                                                                @RequestParam(defaultValue = "true") boolean withPrompt) {
        MessageDto message = messageService.sendMessageWithImage(chatId, request, principal, withPrompt, image);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{chat_id}")
    @Operation(description = "Delete chat by id")
    public ResponseEntity<Void> deleteChat(@PathVariable(name = "chat_id") UUID chatId) {
        chatService.deleteChat(chatId);
        return ResponseEntity.ok(null);
    }
}
