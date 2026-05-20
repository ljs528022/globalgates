package com.app.globalgates.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatReadReceiptDTO {
    private Long conversationId;
    private Long readerId;
    private Long lastReadMessageId;
}
