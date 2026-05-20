package com.app.globalgates.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

// FastAPI 추천 응답 전체 — Spring 컨트롤러 → 프론트로 그대로 전달한다.
//
// baseId / method 는 FastAPI 가 에코백한 값으로, 프론트의 캐시 키나 로깅에 유용하다.
// items 는 유사도 내림차순 Top-N (자기 자신 제외).
@Getter
@Setter
@ToString
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommunityRecommendResponseDTO {

    private Long baseId;
    private String method;
    private List<CommunityRecommendItemDTO> items = new ArrayList<>();
}
