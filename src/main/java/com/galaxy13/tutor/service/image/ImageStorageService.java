package com.galaxy13.tutor.service.image;

import java.io.InputStream;
import java.util.UUID;

import com.galaxy13.tutor.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    String saveImage(MultipartFile file, UserPrincipal user);

    InputStream downloadImage(UUID imageId, UserPrincipal principal);

    String generateDownloadLink(UUID imageId);
}
