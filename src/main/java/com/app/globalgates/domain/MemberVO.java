package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.Status;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
public class MemberVO extends Period {
    private Long id;
    private String memberEmail;
    private String memberName;
    private String memberPassword;
    private String memberNickname;
    private String memberHandle;
    private String memberPhone;
    private String memberBio;
    private boolean memberLoginVerified;
    private String memberRegion;
    private Status memberStatus;
    private MemberRole memberRole;
    private boolean pushEnabled;
    private String memberLanguage;
    private String memberCountry;
    private String birthDate;
    private String lastLoginAt;
}
