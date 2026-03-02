package com.galaxy13.tutor.service.image;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    String saveImage(MultipartFile file);

    String getPresignedDownloadUrl(UUID imageId, int expireIn);
}
