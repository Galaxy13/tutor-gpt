package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.security.UserPrincipal;
import com.galaxy13.tutor.service.chat.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/message")
@RequiredArgsConstructor
@Tag(name = "Message", description = "Endpoint to send messages to AI Agent")
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/{chat_id}")
    @Operation(description = "Send message for specific chat")
    public ResponseEntity<MessageDto> sendMessage(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable(name = "chat_id") UUID id,
                                                  @Valid @RequestBody MessageDto.MessageRequest request) {
        MessageDto agentResponse = messageService.sendMessage(id, request, principal.getId());
        return ResponseEntity.ok(agentResponse);
    }
}
