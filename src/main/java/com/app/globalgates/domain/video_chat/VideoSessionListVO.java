package com.app.globalgates.domain.video_chat;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

// 내 화상회의 목록 조회용 — tbl_video_session + tbl_ai_video_summary LEFT JOIN 결과
@Getter @ToString
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor
@Builder
public class VideoSessionListVO {
    private Long id;
    private Long conversationId;
    private Long callerId;
    private Long receiverId;
    private String startedAt;
    private String endedAt;
    private Integer durationSec;
    private String summary;

    // tbl_member LEFT JOIN — 수신자 표시명 (둘 다 nullable: 회원 탈퇴/삭제 케이스)
    private String receiverHandle;
    private String receiverNickname;
}
