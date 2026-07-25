package com.nexushr.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayrollEmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private BigDecimal salary;
    private String employeeCode;
    private String designation; 
    private String departmentName;
    private String role;
    private String status;
    
    // Additional fields specifically for payroll/payslip presentation
    private LocalDate joiningDate;
    private String managerName;
}
