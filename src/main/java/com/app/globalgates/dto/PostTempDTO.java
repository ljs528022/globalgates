package com.app.globalgates.dto;

import com.app.globalgates.domain.PostTempVO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostTempDTO {
    private Long id;
    private Long memberId;
    private String postTempContent;
    private String postTempLocation;
    private String postTempTags;
    private String createdDatetime;
    private String updatedDatetime;

    public PostTempVO toPostTempVO() {
        return PostTempVO.builder()
                .id(id)
                .memberId(memberId)
                .postTempContent(postTempContent)
                .postTempLocation(postTempLocation)
                .postTempTags(postTempTags)
                .build();
    }
}
