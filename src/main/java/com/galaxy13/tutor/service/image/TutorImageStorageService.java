package com.galaxy13.tutor.service.image;

import com.galaxy13.tutor.config.MinioConfigurationProperties;
import com.galaxy13.tutor.exception.MinioDownloadException;
import com.galaxy13.tutor.exception.MinioUploadException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class TutorImageStorageService implements ImageStorageService {

    private final MinioClient internalClient;

    private final MinioClient publicClient;

    private final MinioConfigurationProperties properties;

    public TutorImageStorageService(
            @Qualifier("minioInternalClient") MinioClient internalClient,
            @Qualifier("minioPublicClient") MinioClient publicClient,
            MinioConfigurationProperties properties
    ) {
        this.internalClient = internalClient;
        this.publicClient = publicClient;
        this.properties = properties;
    }

    @Override
    public String saveImage(MultipartFile file) {
        String fileKey = UUID.randomUUID().toString();

        try {
            internalClient.putObject(
                    PutObjectArgs.builder().bucket(properties.getBucket()).object(fileKey).stream(
                                    file.getInputStream(), file.getSize(), -1)
                            .build());
        } catch (Exception e) {
            throw new MinioUploadException("Could not save image to Minio", e);
        }
        log.info("Image saved for fileKey={}", fileKey);
        return fileKey;
    }

    @Override
    public String getPresignedDownloadUrl(UUID imageId, int expireIn) {
        try {
            return publicClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(properties.getBucket())
                            .object(imageId.toString())
                            .expiry(expireIn, TimeUnit.MINUTES)
                            .build());
        } catch (Exception e) {
            throw new MinioDownloadException(
                    "Could not get presigned download url for imageId=" + imageId, e);
        }
    }
}
