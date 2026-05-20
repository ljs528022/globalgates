package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.NotificationType;
import com.app.globalgates.domain.NotificationVO;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class NotificationDTO implements Serializable {
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

    // 발신자 정보 (JOIN)
    private String senderName;
    private String senderHandle;
    private String senderProfileImage;

    // 대상 게시물 내용 (targetType=post 일 때)
    private String postContent;

    // 다수 팔로우 알림용 추가 아바타
    private List<String> extraAvatars;
    private int extraCount;

    public NotificationVO toNotificationVO() {
        return NotificationVO.builder()
                .id(id)
                .recipientId(recipientId)
                .senderId(senderId)
                .notificationType(notificationType)
                .title(title)
                .content(content)
                .targetId(targetId)
                .targetType(targetType)
                .isRead(isRead)
                .build();
    }
}
