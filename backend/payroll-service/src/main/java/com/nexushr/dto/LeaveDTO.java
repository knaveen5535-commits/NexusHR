package com.nexushr.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveDTO {
    private Long id;
    private Long employeeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}
