package com.app.globalgates.dto.chat;

import lombok.Data;

@Data
public class ProfanityCheckResponseDTO {
//    FastAPI에서 선언한 필드와 동일한 이름으로 설정
//    기본 자료형x, 클래스 자료형으로 사용해야한다.
    private String label;
    private Boolean isAbusive;
    private Double pAbusive;
    private Double pClean;
    private String action;
}
