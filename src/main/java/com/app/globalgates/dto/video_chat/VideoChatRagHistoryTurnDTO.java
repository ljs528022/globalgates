package com.app.globalgates.dto.video_chat;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// 멀티턴 대화의 한 발화 — 프런트가 화면 채팅 라인을 그대로 직렬화해서 보낸다.
// 서버는 stateless 라 호출 시 직전 N 턴을 동봉해야 후속 질문이 맥락에서 해석된다.
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class VideoChatRagHistoryTurnDTO {

    public enum Role {
        USER("user"),
        ASSISTANT("assistant");

        private final String wire;

        Role(String wire) {
            this.wire = wire;
        }

        // FastAPI 측 Literal["user","assistant"] 와 정확히 동일 문자열로 직렬화
        @JsonValue
        public String getWire() {
            return wire;
        }
    }

    @NotNull
    private Role role;

    @NotBlank
    private String content;
}
