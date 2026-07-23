package com.nexushr.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ApproveResignationRequest {
    @NotNull(message = "Approved leave date is required")
    private LocalDate approvedLeaveDate;
}
