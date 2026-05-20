package com.app.globalgates.dto;

import com.app.globalgates.domain.FollowVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class FollowDTO {
    private Long id;
    private Long followerId;
    private Long followingId;
    private String createdDatetime;

    // 팔로우 대상 회원 정보
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFileName;

    public FollowVO toFollowVO() {
        return FollowVO.builder()
                .id(id)
                .followerId(followerId)
                .followingId(followingId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
