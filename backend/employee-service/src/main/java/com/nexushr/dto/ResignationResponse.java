package com.nexushr.dto;

import com.nexushr.enums.ResignationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResignationResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private String reason;
    private LocalDate expectedLeaveDate;
    private LocalDate approvedLeaveDate;
    private ResignationStatus status;
    private LocalDateTime createdAt;
}
