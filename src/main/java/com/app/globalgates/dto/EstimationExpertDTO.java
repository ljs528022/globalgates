package com.app.globalgates.dto;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstimationExpertDTO {
    private Long id;
    private String memberName;
    private String memberNickname;
    private String memberHandle;
    private String memberEmail;
    private String memberProfileFileName;
}
