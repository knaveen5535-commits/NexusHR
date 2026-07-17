package com.nexushr.dto.performance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private LocalDate attendanceDate;
    private String status;
}
