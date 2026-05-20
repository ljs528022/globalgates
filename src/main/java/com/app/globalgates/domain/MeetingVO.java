package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class MeetingVO extends Period {
    private Long id;
    private Long requesterId;
    private Long acceptorId;
    private String title;
    private String content;
    private int meetingDurationTime;
}
