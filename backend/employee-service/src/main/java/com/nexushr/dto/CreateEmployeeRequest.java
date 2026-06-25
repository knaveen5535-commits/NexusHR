package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private BigDecimal salary;

    private Long departmentId;

    private Long designationId;

    private Long managerId;
}