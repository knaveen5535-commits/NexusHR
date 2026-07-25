package com.nexushr.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SalaryComponentDTO {
    private Long id;
    private String name;
    private String componentType;
    private String valueType;
    private BigDecimal componentValue;
}
