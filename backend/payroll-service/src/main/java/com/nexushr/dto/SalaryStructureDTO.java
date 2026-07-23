package com.nexushr.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SalaryStructureDTO {
    private Long id;
    private Long employeeId;
    private BigDecimal baseSalary;
    private String effectiveFrom;
    private String endDate;
    private Boolean isActive;
    private List<SalaryComponentDTO> components;
}
