package com.app.globalgates.dto;

import com.app.globalgates.domain.MentionVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class MentionDTO {
    private Long id;
    private Long mentionTaggerId;
    private Long mentionTaggedId;
    private Long postId;

    // 멘션 검색 결과용 (회원 정보)
    private String memberName;
    private String memberHandle;
    private String profileFileName;
    private String badgeType;

    public MentionVO toMentionVO() {
        return MentionVO.builder()
                .id(id)
                .mentionTaggerId(mentionTaggerId)
                .mentionTaggedId(mentionTaggedId)
                .postId(postId)
                .build();
    }
}
