package com.nexushr.dto;

import lombok.Data;

@Data
public class VerificationRequest {
    private String status;
    private String rejectionReason;
    private String comments;
}
