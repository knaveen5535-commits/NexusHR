package com.nexushr.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AutoProvisionRequestDTO {
    private Long employeeId;
    private Long designationId;
    private String designationName;
    private BigDecimal baseSalary;
}
