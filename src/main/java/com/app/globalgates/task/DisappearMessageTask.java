package com.app.globalgates.task;

import com.app.globalgates.repository.chat.ChatMessageDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAmount;
import java.time.Period;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * 사라진 메시지 (windowed-mode):
 *   - 활성화 시점(disappear_activated_at)부터 setting만큼이 윈도우.
 *   - 매 20초마다 점검: activated_at + period < now() → 윈도우 만료
 *   - 만료된 윈도우의 메시지를 일괄 soft delete + 설정을 'none'으로 자동 복구
 *   - WebSocket으로 양쪽 클라이언트에게 AUTO_DEACTIVATED 이벤트 푸시 → UI 갱신
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DisappearMessageTask {
    private final ChatMessageDAO chatMessageDAO;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(cron = "0/20 * * * * ?")
    public void processExpiredWindows() {
        List<Map<String, Object>> settings = chatMessageDAO.findActiveDisappearSettings();
        if (settings.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();

        for (Map<String, Object> s : settings) {
            Long conversationId = ((Number) s.get("conversationid")).longValue();
            Long memberId = ((Number) s.get("memberid")).longValue();
            String setting = (String) s.get("disappearmessage");
            LocalDateTime activatedAt = toLocalDateTime(s.get("activatedat"));
            if (activatedAt == null) continue;

            TemporalAmount period = parsePeriod(setting);
            if (period == null) {
                log.warn("[사라진 메시지] 알 수 없는 설정값: {}", setting);
                continue;
            }
            LocalDateTime expiresAt = activatedAt.plus(period);
            if (now.isBefore(expiresAt)) continue; // 아직 윈도우 진행 중

            int deleted = chatMessageDAO.softDeleteWindowedMessages(conversationId, activatedAt, expiresAt);
            chatMessageDAO.resetDisappearSetting(conversationId, memberId);

            log.info("[사라진 메시지] 만료 처리 conv={}, member={}, setting={}, 삭제={}건",
                    conversationId, memberId, setting, deleted);

            // 양쪽 클라이언트에 알림 (현재 채팅방 토픽으로 broadcast — 둘 다 같은 토픽 구독)
            messagingTemplate.convertAndSend(
                    "/topic/room." + conversationId + ".disappear",
                    Map.of(
                            "type", "AUTO_DEACTIVATED",
                            "conversationId", conversationId,
                            "memberId", memberId,
                            "deletedCount", deleted,
                            "expiredAt", System.currentTimeMillis()
                    )
            );
        }
    }

    private LocalDateTime toLocalDateTime(Object v) {
        if (v == null) return null;
        if (v instanceof LocalDateTime ld) return ld;
        if (v instanceof Timestamp ts) return ts.toLocalDateTime();
        return null;
    }

    private TemporalAmount parsePeriod(String setting) {
        if (setting == null) return null;
        return switch (setting) {
            case "5분" -> Duration.ofMinutes(5);
            case "1 시간" -> Duration.ofHours(1);
            case "8 시간" -> Duration.ofHours(8);
            case "1 일" -> Period.ofDays(1);
            case "1 주" -> Period.ofWeeks(1);
            case "4 주" -> Period.ofWeeks(4);
            default -> null;
        };
    }
}
