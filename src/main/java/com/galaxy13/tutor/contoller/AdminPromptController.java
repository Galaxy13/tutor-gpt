package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.dto.PromptDto;
import com.galaxy13.tutor.service.prompt.PromptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/prompt")
@RequiredArgsConstructor
@Tag(name = "Admin chat", description = "Admin endpoints to retrieve chat information")
public class AdminPromptController {

    private final PromptService promptService;

    @GetMapping
    @Operation(description = "Get all prompts (required admin rights)")
    public ResponseEntity<List<PromptDto>> getAllPrompts() {
        List<PromptDto> prompts = promptService.getAllPrompts();
        return ResponseEntity.ok(prompts);
    }

    @GetMapping("/{version}")
    @Operation(description = "Get specific prompt version")
    public ResponseEntity<PromptDto> getPromptById(@PathVariable Long version) {
        PromptDto prompt = promptService.getPromptByVersion(version);
        return ResponseEntity.ok(prompt);
    }

    @GetMapping("/current")
    @Operation(description = "Get currently used prompt")
    public ResponseEntity<PromptDto> getCurrentPrompt() {
        PromptDto prompt = promptService.getCurrentPrompt();
        return ResponseEntity.ok(prompt);
    }

    @PostMapping
    @Operation(description = "Set (create) new prompt")
    public ResponseEntity<PromptDto> createPrompt(
            @Valid @RequestBody PromptDto.CreatePromptRequest request) {
        PromptDto createdPrompt = promptService.createPrompt(request);
        return ResponseEntity.ok(createdPrompt);
    }
}
