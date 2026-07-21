package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocumentDto {
    private Long id;
    private String documentType;
    private String documentName;
    private String documentUrl;
    private LocalDateTime uploadDate;
    private String status;
    private Long hrReviewedBy;
    private LocalDateTime hrReviewedAt;
    private String hrDecision;
    private String hrComments;
    private Long adminReviewedBy;
    private LocalDateTime adminReviewedAt;
    private String adminDecision;
    private String adminComments;
    private EmployeeBasicResponse employee;
}
