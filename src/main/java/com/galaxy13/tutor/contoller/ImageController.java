package com.galaxy13.tutor.contoller;

import com.galaxy13.tutor.security.UserPrincipal;
import com.galaxy13.tutor.service.image.ImageStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "File download", description = "Download image files (only accessible by auth)")
public class ImageController {

    private final ImageStorageService storageService;

    @GetMapping("/download/{id}")
    public ResponseEntity<InputStreamResource> getImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable(name = "id") UUID imageId) {
        InputStream image = storageService.downloadImage(imageId, principal);
        InputStreamResource resource = new InputStreamResource(image);
        return ResponseEntity.ok(resource);
    }
}
