package com.app.globalgates.dto;

import com.app.globalgates.domain.MeetingVO;
import lombok.*;

@Getter @Setter @ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class MeetingDTO {
    private Long id;
    private Long requesterId;
    private Long acceptorId;
    private String title;
    private String content;
    private String createdDatetime;
    private String updatedDatetime;

    // 회의 진행 시간(녹화 길이)
    private int meetingDurationTime;
    // 회의 녹화 파일경로
    private String recodingPath;

    public MeetingVO toVO() {
        return MeetingVO.builder()
                .id(id)
                .requesterId(requesterId)
                .acceptorId(acceptorId)
                .title(title)
                .content(content)
                .meetingDurationTime(meetingDurationTime)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
