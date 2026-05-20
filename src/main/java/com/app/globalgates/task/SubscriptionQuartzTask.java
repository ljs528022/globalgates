package com.app.globalgates.task;

import com.app.globalgates.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionQuartzTask {
    private final SubscriptionService subscriptionService;

    /*
     *   0 * * * * * : 매 분 0초마다
     *   0/1 * * * * : 매 1초 간격
     *   0 0/1 * * * : 매 1분 간격
     *   0 0/5 * ? : 매 5분 간격
     *   0 0 0/1 * * : 매 1시간 간격
     *   0 0 0 * * ? : 매일 0시 마다
     *   0 0 0 1 * ? : 매월 1일 마다
     *   * 10-13 * * * * : 매 10, 11, 12, 13분에 동작한다.
     * */
    @Scheduled(cron = "0 0 0 * * ?")
    public void check() {
        // 실행할 문장 작성
        log.info("쿼츠 들어옴?");
        subscriptionService.managingSchedule();
        log.info("들어옴");
    }
}
