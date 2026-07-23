package com.nexushr.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ResignationRequest {
    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "Expected leave date is required")
    @Future(message = "Expected leave date must be in the future")
    private LocalDate expectedLeaveDate;
}
