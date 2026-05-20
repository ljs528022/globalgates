package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import com.app.globalgates.common.enumeration.OAuthProvider;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
public class OAuthVO extends Period {
    private Long id;
    private String providerId;
    private OAuthProvider provider;
    private String profileURL;
    private Long memberId;
}
