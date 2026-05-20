package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.NotificationType;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class NotificationVO {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private NotificationType notificationType;
    private String title;
    private String content;
    private Long targetId;
    private String targetType;
    private boolean isRead;
    private String createdDatetime;
}
