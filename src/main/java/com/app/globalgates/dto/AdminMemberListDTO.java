package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class AdminMemberListDTO {
    private Long id;
    private String memberName;
    private String memberEmail;
    private String companyName;
    private String birthDate;
    private MemberRole memberRole;
    private SubscriptionTier subscriptionTier;
    private SubscriptionStatus subscriptionStatus;
    private Status memberStatus;
    private String createdDatetime;
}
