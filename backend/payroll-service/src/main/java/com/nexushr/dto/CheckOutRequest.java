package com.nexushr.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CheckOutRequest {
    private Long employeeId;
    private LocalDateTime checkOutTime;
    private String remarks;
}
