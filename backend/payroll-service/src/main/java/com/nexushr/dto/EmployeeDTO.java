package com.nexushr.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private java.math.BigDecimal salary;
    private String employeeCode;
    private String designation; 
    private String departmentName;
    private String role;
    private String status;
}
