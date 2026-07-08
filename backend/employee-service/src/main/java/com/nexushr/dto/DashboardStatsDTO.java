package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalEmployees;
    private long activeEmployees;
    private long departmentsCount;
    private long managersCount;
    private long hrStaffCount;
    private BigDecimal monthlyPayrollCost;
}
