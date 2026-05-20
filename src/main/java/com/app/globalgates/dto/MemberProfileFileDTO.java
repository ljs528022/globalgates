package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.domain.FileVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class MemberProfileFileDTO {
    private Long id;
    private Long memberId;
    private ProfileImageType profileImageType;
    private String originalName;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private FileContentType contentType;
    private String createdDatetime;

    public FileVO toFileVO() {
        return FileVO.builder()
                .id(id)
                .originalName(originalName)
                .fileName(fileName)
                .filePath(filePath)
                .fileSize(fileSize)
                .contentType(contentType)
                .build();
    }

}
