package com.app.globalgates.dto;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class FriendsDTO {
    private Long id;
    private String memberName;
    private String memberNickname;
    private String memberHandle;
    private String memberBio;
    private String memberProfileFileName;
    private String followerIntro;
    private Boolean isFollowing;
    private String memberRole;
}
