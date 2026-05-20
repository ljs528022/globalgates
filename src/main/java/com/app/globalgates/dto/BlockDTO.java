package com.app.globalgates.dto;

import com.app.globalgates.domain.BlockVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class BlockDTO {
    private Long id;
    private Long blockerId;
    private Long blockedId;
    private String createdDatetime;

    private String memberName;
    private String memberHandle;
    private String memberBio;

    // DB에서 읽은 S3 key
    private String profileImageFileName;

    // 화면에 내려줄 최종 URL
    private String profileImageUrl;

    public BlockVO toBlockVO() {
        return BlockVO.builder()
                .id(id)
                .blockerId(blockerId)
                .blockedId(blockedId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
