package com.app.globalgates.dto;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
public class CommunityMemberDTO {

    private Long communityId;
    private Long memberId;
    private String memberRole;
    private String joinedAt;
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFilePath;

}
