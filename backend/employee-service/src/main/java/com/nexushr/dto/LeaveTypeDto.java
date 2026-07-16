package com.nexushr.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LeaveTypeDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal defaultDays;
}
