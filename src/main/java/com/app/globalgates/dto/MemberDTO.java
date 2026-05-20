package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.domain.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter @Setter @ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class MemberDTO implements Serializable {
//    버전 올려야 할 때
//    필드 자료형 변경
//    핵심 비즈니스(인증체제, 다중권한 변경 등) 로직 변경
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String memberEmail;
    private String memberName;
    //    화면에서 받는 건 가능
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String memberPassword;
    private String memberNickname;
    private String memberHandle;
    private String memberPhone;
    private String memberBio;
    private String memberRegion;
    private boolean memberLoginVerified;
    private Status memberStatus;
    private MemberRole memberRole;
    private boolean pushEnabled;
    private String memberLanguage;
    private String memberCountry;
    private String birthDate;
    private String lastLoginAt;
    private String loginId;
    private String createdDatetime;
    private String updatedDatetime;
    private boolean isRemember;
//    oauth
    private String providerId;
    private OAuthProvider provider;
    private String profileURL;
    private Long memberId;
//    business
    private String businessNumber;
    private String companyName;
    private String ceoName;
    private String businessType;
//    category
    private String categoryName;
//    file
    private String originalName;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private FileContentType contentType;
//    follow
    private boolean followed;

    public MemberVO toMemberVO(){
        return MemberVO.builder()
                .id(id)
                .memberEmail(memberEmail)
                .memberName(memberName)
                .memberPassword(memberPassword)
                .memberNickname(memberNickname)
                .memberHandle(memberHandle)
                .memberPhone(memberPhone)
                .memberBio(memberBio)
                .memberRegion(memberRegion)
                .memberLoginVerified(memberLoginVerified)
                .memberStatus(memberStatus)
                .memberRole(memberRole)
                .pushEnabled(pushEnabled)
                .memberLanguage(memberLanguage)
                .memberCountry(memberCountry)
                .birthDate(birthDate)
                .lastLoginAt(lastLoginAt)
                .build();

    }

    public OAuthVO toOAuthVO(){
        return OAuthVO.builder()
                .providerId(providerId)
                .provider(provider)
                .profileURL(profileURL)
                .memberId(memberId)
                .build();
    }

    public BusinessMemberVO toBusinessMemberVO(){
        return BusinessMemberVO.builder()
                .id(memberId)
                .businessNumber(businessNumber)
                .companyName(companyName)
                .ceoName(ceoName)
                .businessType(businessType)
                .build();
    }

    public CategoryVO toCategoryVO(){
        return CategoryVO.builder()
                .categoryName(categoryName)
                .build();
    }

    public FileVO toFileVO(){
        return FileVO.builder()
                .originalName(originalName)
                .fileName(fileName)
                .filePath(filePath)
                .fileSize(fileSize)
                .contentType(FileContentType.IMAGE)
                .createdDatetime(createdDatetime)
                .build();
    }
}
