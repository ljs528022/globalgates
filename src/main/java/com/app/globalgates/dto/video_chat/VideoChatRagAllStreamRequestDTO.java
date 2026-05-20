package com.app.globalgates.dto.video_chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

// 전체 회의 통합 RAG SSE 요청 — 회원의 모든 회의 요약을 컨텍스트로 답하는 챗봇용.
// videoSessionId 자체를 받지 않는다 — 호출자 실수로 회의별/전체가 섞이는 것을 차단.
// history 는 "전체 RAG 채팅창" 의 직전 턴들 (회의별 채팅창과 별도 라인).
@Getter
@Setter
@ToString
@NoArgsConstructor
public class VideoChatRagAllStreamRequestDTO {

    @NotBlank
    private String question;

    @Valid
    @Size(max = 20)
    private List<VideoChatRagHistoryTurnDTO> history = new ArrayList<>();
}
