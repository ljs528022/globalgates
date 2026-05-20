package com.app.globalgates.dto.chat;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatExpertDTO {
    private Long id;
    private String memberName;
    private String memberNickname;
    private String memberHandle;
    private String memberBio;
    private String memberProfileFileName;
    private boolean connected;
    private String followerIntro;
    private String alias;
    private String displayName;
}
