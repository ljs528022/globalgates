package com.app.globalgates.auth;

import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.dto.MemberDTO;
import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@ToString
public class CustomUserDetails implements UserDetails {
    private Long id;
    private String memberEmail;
    private String memberName;
    private String memberPassword;
    private String memberNickname;
    private String memberHandle;
    private String memberPhone;
    private String memberBio;
    private String memberRegion;
    private Status memberStatus;
    private MemberRole memberRole;
    private boolean pushEnabled;
    private String memberLanguage;
    private String birthDate;
    private String lastLoginAt;
    private String loginId;
    private String createdDatetime;
    private String updatedDatetime;

    public CustomUserDetails(MemberDTO memberDTO, String loginId) {
        this.id = memberDTO.getId();
        this.memberEmail = memberDTO.getMemberEmail();
        this.memberName = memberDTO.getMemberName();
        this.memberPassword = memberDTO.getMemberPassword();
        this.memberNickname = memberDTO.getMemberNickname();
        this.memberHandle = memberDTO.getMemberHandle();
        this.memberPhone = memberDTO.getMemberPhone();
        this.memberBio = memberDTO.getMemberBio();
        this.memberRegion = memberDTO.getMemberRegion();
        this.memberStatus = memberDTO.getMemberStatus();
        this.memberRole = memberDTO.getMemberRole();
        this.pushEnabled = memberDTO.isPushEnabled();
        this.memberLanguage = memberDTO.getMemberLanguage();
        this.birthDate = memberDTO.getBirthDate();
        this.lastLoginAt = memberDTO.getLastLoginAt();
        this.loginId = loginId;
        this.createdDatetime = memberDTO.getCreatedDatetime();
        this.updatedDatetime = memberDTO.getUpdatedDatetime();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return memberRole.getAuthorities();
    }

    @Override
    public String getPassword() {
        return memberPassword;
    }

    @Override
    public String getUsername() {
        return loginId;
    }
}
