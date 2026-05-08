package com.pitlane.pitlane.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

/** Service responsible for uploading and retrieving photos from AWS S3 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucket;

    /**
     * Uploads a file to S3 and returns the object key
     * @param file The file to upload
     * @param folder The folder prefix — e.g. "maintenance"
     * @return The S3 object key
     */
    public String upload(MultipartFile file, String folder) {
        String key = folder + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
            log.info("[S3] Uploaded file: {}", key);
            return key;

        } catch (IOException e) {
            log.error("[S3] Failed to upload file: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    /**
     * Generates a presigned URL valid for 1 hour to access a private S3 object
     * @param key The S3 object key
     * @return A presigned URL string
     */
    public String generatePresignedUrl(String key) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .build())
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    /**
     * Deletes an object from S3
     * @param key The S3 object key
     */
    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
        log.info("[S3] Deleted file: {}", key);
    }
}
