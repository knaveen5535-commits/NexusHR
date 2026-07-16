package com.nexushr.dto;

import com.nexushr.enums.LeaveStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private String designationName;
    private Long managerId;
    private String managerName;
    
    private LeaveTypeDto leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal numberOfDays;
    private String reason;
    private String attachmentUrl;
    private String emergencyContact;
    private LeaveStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<LeaveApprovalHistoryDto> approvalHistories;
}
