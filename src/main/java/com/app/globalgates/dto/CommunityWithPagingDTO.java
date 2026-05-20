package com.app.globalgates.dto;

import com.app.globalgates.common.pagination.Criteria;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class CommunityWithPagingDTO {
    private List<CommunityDTO> communities;
    private Criteria criteria;
}
