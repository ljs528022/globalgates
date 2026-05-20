package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.OAuthProvider;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class MemberSessionDTO {
    private Long id;
    private String memberName;
    private String memberEmail;
    private String memberHandle;
    private String memberPhone;
    private String memberRegion;
    private String memberLanguage;
    private String lastLogin;
    private String loginId;
    private boolean pushEnabled;
    private String createdDatetime;
    private String updatedDatetime;
    //    oauth
    private String providerId;
    private OAuthProvider provider;
    private String profileURL;
    private Long memberId;


}
