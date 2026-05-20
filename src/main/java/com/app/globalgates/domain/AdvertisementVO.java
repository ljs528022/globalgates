package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import com.app.globalgates.common.enumeration.AdStatus;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
@NoArgsConstructor
public class AdvertisementVO extends Period {
    private Long id;
    private Long advertiserId;
    private String title;
    private String headline;
    private String description;
    private String landingUrl;
    private int budget;
    private int impressionEstimate;
    private String receiptId;
    private AdStatus status;
    private String startedAt;
    private String createdDatetime;
    private String updatedDatetime;
}
