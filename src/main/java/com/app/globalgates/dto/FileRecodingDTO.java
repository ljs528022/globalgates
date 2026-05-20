package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.domain.FileRecodingVO;
import com.app.globalgates.domain.FileVO;
import lombok.*;

@Getter @Setter
@ToString
@EqualsAndHashCode(of="id")
@NoArgsConstructor
public class FileRecodingDTO {
    private Long id;
    private String originalName;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private FileContentType contentType;
    private String createdDatetime;

    private Long meetingId;
    private int recodingTime;

    public FileVO toFileVO() {
        return FileVO.builder()
                .id(id)
                .originalName(originalName)
                .fileName(fileName)
                .filePath(filePath)
                .fileSize(fileSize)
                .contentType(contentType)
                .createdDatetime(createdDatetime)
                .build();
    }

    public FileRecodingVO toFileRecodingVO() {
        return FileRecodingVO.builder()
                .id(id)
                .meetingId(meetingId)
                .recodingTime(recodingTime)
                .build();
    }
}
