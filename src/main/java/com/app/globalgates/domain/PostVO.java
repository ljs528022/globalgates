package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import com.app.globalgates.common.enumeration.Status;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@NoArgsConstructor(access=AccessLevel.PROTECTED)
@SuperBuilder
public class PostVO extends Period {

    private Long id;
    private Long memberId;
    private Status postStatus;
    private String postTitle;
    private String postContent;
    private String location;
    private Long replyPostId;

}
