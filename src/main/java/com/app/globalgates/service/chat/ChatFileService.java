package com.app.globalgates.service.chat;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.chat.ChatFileDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatFileService {
    private final S3Service s3Service;
    private final FileDAO fileDAO;
    private final ChatFileDAO chatFileDAO;

    @Transactional
    public FileDTO uploadAndLink(MultipartFile file, Long messageId) throws IOException {
        String todayPath = "chat/" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String s3Key = s3Service.uploadFile(file, todayPath);

        try {
            FileDTO fileDTO = new FileDTO();
            fileDTO.setOriginalName(file.getOriginalFilename());
            fileDTO.setFileName(s3Key.substring(s3Key.lastIndexOf("/") + 1));
            fileDTO.setFilePath(s3Key);
            fileDTO.setFileSize(file.getSize());
            fileDTO.setContentType(resolveContentType(file.getContentType()));
            fileDAO.save(fileDTO);

            chatFileDAO.save(fileDTO.getId(), messageId);
            log.info("채팅 파일 업로드 완료 - fileId: {}, messageId: {}", fileDTO.getId(), messageId);
            return fileDTO;
        } catch (Exception e) {
            log.error("채팅 파일 DB 저장 실패, S3 파일 삭제 시도 - s3Key: {}", s3Key, e);
            try {
                s3Service.deleteFile(s3Key);
                log.info("S3 고아 파일 삭제 완료 - s3Key: {}", s3Key);
            } catch (Exception s3Error) {
                log.error("S3 고아 파일 삭제 실패 - s3Key: {}", s3Key, s3Error);
            }
            throw e;
        }
    }

    private FileContentType resolveContentType(String mimeType) {
        if (mimeType == null) return FileContentType.ETC;
        if (mimeType.startsWith("image/")) return FileContentType.IMAGE;
        if (mimeType.startsWith("video/")) return FileContentType.VIDEO;
        if (mimeType.contains("pdf") || mimeType.contains("document") || mimeType.contains("spreadsheet")
                || mimeType.contains("text/") || mimeType.contains("msword") || mimeType.contains("officedocument")) {
            return FileContentType.DOCUMENT;
        }
        return FileContentType.ETC;
    }
}
