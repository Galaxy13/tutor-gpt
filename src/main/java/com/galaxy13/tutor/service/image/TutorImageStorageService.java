package com.galaxy13.tutor.service.image;

import com.galaxy13.tutor.config.MinioConfigurationProperties;
import com.galaxy13.tutor.exception.MinioDownloadException;
import com.galaxy13.tutor.exception.MinioUploadException;
import com.galaxy13.tutor.exception.ResourceAccessException;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Image;
import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.ImageRepository;
import com.galaxy13.tutor.repository.UserRepository;
import com.galaxy13.tutor.security.UserPrincipal;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;

import java.io.InputStream;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorImageStorageService implements ImageStorageService {

    private final MinioClient minioClient;

    private final MinioConfigurationProperties properties;

    private final ImageRepository imageRepository;

    private final UserRepository userRepository;

    @Override
    @Transactional
    public String saveImage(MultipartFile file, UserPrincipal principal) {
        UUID fileId = UUID.randomUUID();

        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(properties.getBucket())
                            .object(fileId.toString()).stream(
                                    file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            User user = userRepository.getUserById(principal.getId()).orElseThrow(
                    () -> new ResourceNotFoundException("User with id " + principal.getId() + " not found"));

            Image image = new Image();
            image.setId(fileId);
            image.setUser(user);
            imageRepository.save(image);
        } catch (Exception e) {
            throw new MinioUploadException("Could not save image to Minio", e);
        }
        log.info("Image saved for fileKey={}", fileId);
        return fileId.toString();
    }

    @Override
    public InputStream downloadImage(UUID imageId, UserPrincipal principal) {

        Image image = imageRepository.findById(imageId).orElseThrow(
                () -> new ResourceNotFoundException("Image with id " + imageId + " not found"));
        if (!image.getUser().getId().equals(principal.getId()) && !principal.getRole().equals(Role.ADMIN)) {
            throw new ResourceAccessException("You have not access to acquired resource");
        }

        try {
            return minioClient.getObject(GetObjectArgs
                    .builder()
                    .bucket(properties.getBucket())
                    .object(imageId.toString())
                    .build());
        } catch (Exception e) {
            throw new MinioDownloadException(
                    "Could not get InputStream download url for imageId =" + imageId, e);
        }
    }

    @Override
    public String generateDownloadLink(UUID imageId) {
        return "/api/v1/files/download/" + imageId.toString();
    }
}
