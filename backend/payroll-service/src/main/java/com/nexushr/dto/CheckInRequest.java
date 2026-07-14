package com.nexushr.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CheckInRequest {
    private Long employeeId;
    private LocalDateTime checkInTime;
    private String source;
}
