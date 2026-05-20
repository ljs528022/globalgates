package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.domain.OAuthVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class OAuthDTO {
    private Long id;
    private String providerId;
    private OAuthProvider provider;
    private String profileURL;
    private Long memberId;
    private String createdDatetime;
    private String updatedDatetime;

    public OAuthVO toOAuthVO(){
        return OAuthVO.builder()
                .id(id)
                .providerId(providerId)
                .provider(provider)
                .profileURL(profileURL)
                .memberId(memberId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}

