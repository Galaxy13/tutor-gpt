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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorImageStorageService implements ImageStorageService {

    private final MinioClient minioClient;

    private final MinioConfigurationProperties properties;

    @Override
    public String saveImage(MultipartFile file) {
        String fileKey = UUID.randomUUID().toString();

        try {
            minioClient.putObject(
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
            return minioClient.getPresignedObjectUrl(
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
