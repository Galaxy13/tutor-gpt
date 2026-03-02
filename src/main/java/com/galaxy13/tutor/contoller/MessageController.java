package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.MessageDto;
import com.galaxy13.tutor.security.UserPrincipal;
import com.galaxy13.tutor.service.chat.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        MessageDto agentResponse = messageService.sendMessage(id, request, principal);
        return ResponseEntity.ok(agentResponse);
    }

    @PostMapping(value = "/image/{chat_id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    @Operation(description = "Send message with image to specific chat")
    public ResponseEntity<MessageDto> sendMessageWithImage(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable(name = "chat_id") UUID id,
                                                           @RequestPart("image") MultipartFile image,
                                                           @Valid @RequestBody MessageDto.MessageRequest request,
                                                           @RequestParam(defaultValue = "true") boolean withPrompt) {
        MessageDto agentResponse = messageService.sendMessageWithImage(id, request, principal, withPrompt, image);
        return ResponseEntity.ok(agentResponse);
    }
}
