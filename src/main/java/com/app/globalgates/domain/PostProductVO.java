package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class PostProductVO extends Period {
    private Long id;
    private int productPrice;
    private int productStock;
    private Long productCategoryId;
}
