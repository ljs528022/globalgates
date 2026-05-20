package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.FileContentType;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter @ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class FileVO {
    private Long id;
    private String originalName;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private FileContentType contentType;
    private String createdDatetime;
}
