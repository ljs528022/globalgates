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
public class ChatRoomVO extends Period {
    private Long id;
    private String title;
    private Long senderId;
    private Long invitedId;
}
