package com.app.globalgates.dto.chat;

import com.app.globalgates.domain.chat.ChatRoomVO;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDTO {
    private Long id;
    private String title;
    private Long senderId;
    private Long invitedId;
    private String senderName;
    private String invitedName;
    private String invitedHandle;
    private String alias;
    private String partnerProfileFileName;
    private String lastMessage;
    private String lastMessageTime;
    private Long unreadCount;
    private String createdDatetime;
    private String updatedDatetime;

    public ChatRoomVO toVO() {
        return ChatRoomVO.builder()
                .id(id)
                .title(title)
                .senderId(senderId)
                .invitedId(invitedId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
