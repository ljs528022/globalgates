package com.app.globalgates.dto.chat;

import com.app.globalgates.domain.chat.ChatMessageVO;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderHandle;
    private String content;
    private boolean isDeleted;
    private boolean readByPartner;
    private String createdDatetime;
    private String updatedDatetime;

    private Long fileId;
    private String fileOriginalName;
    private String filePath;
    private Long fileSize;
    private String fileContentType;

    public ChatMessageVO toVO() {
        return ChatMessageVO.builder()
                .id(id)
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content)
                .isDeleted(isDeleted)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
