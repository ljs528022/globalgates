package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.AdStatus;
import com.app.globalgates.domain.AdvertisementVO;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class AdvertisementDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

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

    // 광고주 정보 (JOIN)
    private String advertiserName;
    private String advertiserHandle;
    private String advertiserProfileFileName;

    // 광고 이미지 리스트
    private List<FileAdvertisementDTO> adImageList;

    // 광고 이미지 경로 List
    private List<String> imgUrls;

    public AdvertisementVO toAdVO() {
        return AdvertisementVO.builder()
                .id(id)
                .advertiserId(advertiserId)
                .title(title)
                .headline(headline)
                .description(description)
                .landingUrl(landingUrl)
                .budget(budget)
                .impressionEstimate(impressionEstimate)
                .receiptId(receiptId)
                .status(status)
                .startedAt(startedAt)
                .build();
    }
}