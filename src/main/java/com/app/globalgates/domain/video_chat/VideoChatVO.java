package com.app.globalgates.domain.video_chat;

import lombok.*;

@Getter @ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class VideoChatVO {
    private Long id;
    private Long conversationId;
    private Long callerId;
    private Long receiverId;
    private String startedAt;
    private String endedAt;
    private int durationSec;
    private String createdDatetime;
}
