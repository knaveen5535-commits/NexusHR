package com.nexushr.dto;

import com.nexushr.enums.LeaveAction;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LeaveApprovalHistoryDto {
    private Long id;
    private Long actionByUserId;
    private String actionByUserName;
    private String actionByRole;
    private LeaveAction action;
    private String comments;
    private LocalDateTime actionDate;
}
