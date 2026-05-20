package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
public class EstimationVO extends Period {
    private Long id;
    private Long requesterId;
    private Long receiverId;
    private Long productId;
    private String title;
    private String content;
    private String location;
    private String deadLine;
    private String status;
}
