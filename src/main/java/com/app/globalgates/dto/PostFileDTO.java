package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.domain.FileVO;
import com.app.globalgates.domain.PostFileVO;
import lombok.*;

@Getter @Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostFileDTO {
    private Long id;
    private Long postId;
    private Long fileId;
    private String originalName;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private FileContentType contentType;
    private String createdDatetime;

    public FileVO toFileVO() {
        return FileVO.builder()
                .id(fileId)
                .originalName(originalName)
                .fileName(fileName)
                .filePath(filePath)
                .fileSize(fileSize)
                .contentType(contentType)
                .createdDatetime(createdDatetime)
                .build();
    }

    public PostFileVO toPostFileVO() {
        return PostFileVO.builder()
                .id(id)
                .postId(postId)
                .fileId(fileId)
                .build();
    }
}