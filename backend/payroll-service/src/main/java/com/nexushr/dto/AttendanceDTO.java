package com.nexushr.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName; // Aggregated field
    private String department;
    private String designation;
    private LocalDate attendanceDate;
    private String checkInTime; // Formatted
    private String checkOutTime; // Formatted
    private String totalHours; // Formatted
    private String status;
    private String remarks;
}
