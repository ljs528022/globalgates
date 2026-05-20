package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.Status;
import lombok.*;

@Getter @Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class InquiryMemberDTO {
    private Long id;
    private String memberEmail;
    private String memberName;
    private String memberNickname;
    private String memberHandle;
    private String memberPhone;
    private String memberBio;
    private String memberRegion;
    private Status memberStatus;
    private MemberRole memberRole;
    private String memberLanguage;
    private String birthDate;
    private String lastLoginAt;
    private String loginId;
    private String createdDatetime;
    private String updatedDatetime;
    private boolean isRemember;
//    프로필 이미지
    private String filePath;
//    팔로우한 가장 신뢰도 높은 전문가 핸들
    private String expertHandle;
//    관심 품목
    private String categoryName;
//    팔로우 여부
    private boolean followed;
}
