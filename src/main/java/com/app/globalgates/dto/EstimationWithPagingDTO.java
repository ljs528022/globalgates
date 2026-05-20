package com.app.globalgates.dto;

import com.app.globalgates.common.pagination.Criteria;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class EstimationWithPagingDTO {
    private List<EstimationDTO> estimations = new ArrayList<>();
    private Criteria criteria;
}
