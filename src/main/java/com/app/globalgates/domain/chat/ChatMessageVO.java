package com.app.globalgates.domain.chat;

import com.app.globalgates.audit.Period;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
public class ChatMessageVO extends Period {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String content;
    private boolean isDeleted;
}
