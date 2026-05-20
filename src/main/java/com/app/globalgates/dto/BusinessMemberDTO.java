package com.app.globalgates.dto;

import com.app.globalgates.domain.BusinessMemberVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class BusinessMemberDTO {
    private Long id;
    private String businessNumber;
    private String companyName;
    private String ceoName;
    private String businessType;
    private String createdDatetime;
    private String updatedDatetime;

    public BusinessMemberVO toBusinessMemberVO(){
        return BusinessMemberVO.builder()
                .id(id)
                .businessNumber(businessNumber)
                .companyName(companyName)
                .ceoName(ceoName)
                .businessType(businessType)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
