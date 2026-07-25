package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDTO {
    private int workingDays;
    private int presentDays;
    private int absentDays;
    private int lopDays;
    private int paidLeave;
    private int unpaidLeave;
    private int halfDays;
    private BigDecimal overtimeHours;
}
