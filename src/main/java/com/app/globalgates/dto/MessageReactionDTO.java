package com.app.globalgates.dto;

import com.app.globalgates.domain.MessageReactionVO;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReactionDTO {
    private Long id;
    private Long messageId;
    private Long memberId;
    private String emoji;
    private Long conversationId;
    private boolean removed;
    private String createdDatetime;

    public MessageReactionVO toVO() {
        return MessageReactionVO.builder()
                .id(id)
                .messageId(messageId)
                .memberId(memberId)
                .emoji(emoji)
                .build();
    }
}
