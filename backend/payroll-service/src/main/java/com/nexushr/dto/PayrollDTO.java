package com.nexushr.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PayrollDTO {
    private Long id;
    private Long employeeId;
    private String employeeName; // Aggregated field
    private String position; // Aggregated field
    private Integer payrollMonth;
    private Integer payrollYear;
    private String payslipNumber;
    private BigDecimal grossSalary;
    private BigDecimal totalDeductions;
    private BigDecimal totalTaxes;
    private BigDecimal netSalary;
    private String status;
}
