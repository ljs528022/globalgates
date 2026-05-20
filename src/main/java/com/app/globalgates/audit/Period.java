package com.app.globalgates.audit;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@SuperBuilder
@NoArgsConstructor
public abstract class Period {
    private String createdDatetime;
    private String updatedDatetime;
}
