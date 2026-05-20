package com.app.globalgates.dto;

import com.app.globalgates.domain.EstimationTagVO;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstimationTagDTO {
    private Long id;
    private String tagName;
    private String createdDateTime;

    public EstimationTagVO toEstimationTagVO() {
        return EstimationTagVO.builder()
                .id(id)
                .tagName(tagName)
                .build();
    }
}
