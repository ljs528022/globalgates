package com.app.globalgates.dto.video_chat;

import com.app.globalgates.domain.chat.ChatRoomVO;
import com.app.globalgates.domain.video_chat.VideoChatVO;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoChatDTO {
    private Long id;
    private Long conversationId;
    private Long callerId;
    private Long receiverId;
    private String startedAt;
    private String endedAt;
    private int durationSec;
    private String createdDatetime;
    private String updatedDatetime;

    // 채팅방 이름
    private String title;

    // 채팅방 응답용
    private String roomName;
    private String callerName;
    private String receiverName;

    public VideoChatVO toVO() {
        return VideoChatVO.builder()
                .id(id)
                .conversationId(conversationId)
                .callerId(callerId)
                .receiverId(receiverId)
                .startedAt(startedAt)
                .endedAt(endedAt)
                .durationSec(durationSec)
                .createdDatetime(createdDatetime)
                .build();
    }
}
