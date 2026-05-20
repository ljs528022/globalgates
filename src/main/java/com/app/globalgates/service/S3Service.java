package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import lombok.RequiredArgsConstructor;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @LogStatusWithReturn
    private String getFileName(MultipartFile file, String path) {
        String originalFileName = file.getOriginalFilename();
        String extension = null;

        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return path + "/" + UUID.randomUUID() + extension;
    }

    //    업로드
    @LogStatusWithReturn
    public String uploadFile(MultipartFile file, String path) throws IOException {
        String fileName = getFileName(file, path);

        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .contentType(file.getContentType())
                        .contentLength(file.getSize())
                        .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return fileName;
    }

    //    파일 조회
    @LogStatusWithReturn
    public String getPresignedUrl(String fileName, Duration validDuration) throws IOException {

//        사용 예시
//        자바
//        return s3Service.getPresignedUrl("2026/03/19/day01.txt", Duration.ofMinutes(3));
//        JS
//        <img src="${response.text()}">

        GetObjectRequest request =
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .build();


        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(validDuration)
                .getObjectRequest(request)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    //    파일 다운로드
    @LogStatusWithReturn
    public String getPresignedDownloadUrl(String fileName, String originalFileName, Duration validDuration) throws IOException {
        GetObjectRequest request =
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .responseContentDisposition("attachment; filename*=UTF-8''" + URLEncoder.encode(originalFileName, StandardCharsets.UTF_8).replace("+", "%20"))
                        .build();


        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(validDuration)
                .getObjectRequest(request)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    //    파일 삭제
    @LogStatus
    public void deleteFile(String fileName) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }
}