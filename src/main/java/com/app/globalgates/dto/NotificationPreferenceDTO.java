package com.app.globalgates.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class NotificationPreferenceDTO {
    private Long id;
    private Long memberId;

    private boolean pushConnect;
    private boolean pushExpert;
    private boolean pushLikes;
    private boolean pushPosts;
    private boolean pushComments;
    private boolean pushChatMessages;
    private boolean pushQuotes;
    private boolean pushSystem;
    private boolean pushMentions;
}
