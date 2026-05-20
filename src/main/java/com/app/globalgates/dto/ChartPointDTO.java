package com.app.globalgates.dto;

import lombok.Data;

@Data
public class ChartPointDTO {
    private String label;
    private Long value;
    private Long secondaryValue;
}
