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
public class BusinessMemberVO extends Period {
    private Long id;
    private String businessNumber;
    private String companyName;
    private String ceoName;
    private String businessType;
}
