package com.app.globalgates.dto.video_chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

// 단일 회의 RAG SSE 요청 — 특정 회의 1건에만 답하는 챗봇용.
// member_id 는 세션에서 추출하므로 body 에 받지 않는다 (BOLA 방지).
// videoSessionId 필수 — 회원 전체 통합 RAG 모드는 별도 DTO/엔드포인트로 분리되어 있음.
// history 는 같은 회의 채팅창의 직전 턴들 (없으면 빈 배열). FastAPI 측 상한과 동일하게 20 까지.
@Getter
@Setter
@ToString
@NoArgsConstructor
public class VideoChatRagStreamRequestDTO {

    @NotBlank
    private String question;

    @NotNull
    private Long videoSessionId;

    @Valid
    @Size(max = 20)
    private List<VideoChatRagHistoryTurnDTO> history = new ArrayList<>();
}
