package com.app.globalgates.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// FastAPI 추천 응답의 items[] 한 row.
// FastAPI 가 보내는 필드명(camelCase) 그대로 매핑 — 별도 변환 없이 프론트로 전달 가능.
//
// similarity 필드는 응답에 포함되지만 UI 노출 여부는 프론트가 결정한다.
// 정렬/로깅/A·B 테스트/협업필터링 가중치 합성 등에 활용된다.
@Getter
@Setter
@ToString
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommunityRecommendItemDTO {

    private Long id;
    private String communityName;
    private String tags;
    private Long categoryId;
    private String category;
    private Double similarity;
}
