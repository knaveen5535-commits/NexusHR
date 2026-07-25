package com.nexushr.dto;

import lombok.Data;

@Data
public class PayrollStatusDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer payrollMonth;
    private Integer payrollYear;
    private String status;
}
