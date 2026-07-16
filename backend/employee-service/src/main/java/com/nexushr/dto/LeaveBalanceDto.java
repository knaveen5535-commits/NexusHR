package com.nexushr.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class LeaveBalanceDto {
    private Long id;
    private LeaveTypeDto leaveType;
    private BigDecimal totalDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;
    private BigDecimal remainingDays;
    private Integer year;
}
