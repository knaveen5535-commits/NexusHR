package com.nexushr.dto;

import com.nexushr.enums.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {

    private Long id;

    private Long employeeId;

    private BigDecimal baseSalary;

    private BigDecimal bonus;

    private BigDecimal deductions;

    private BigDecimal netSalary;

    private LocalDate payDate;

    private PayrollStatus status;
}
