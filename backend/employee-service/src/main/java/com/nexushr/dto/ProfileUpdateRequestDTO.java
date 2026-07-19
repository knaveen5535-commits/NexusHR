package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequestDTO {
    private Long id;
    
    private EmployeeBasicResponse employee;

    private String requestedPhone;
    private String requestedAddress;
    private LocalDate requestedDateOfBirth;
    private String requestedGender;
    private String requestedBloodGroup;
    private String requestedEmergencyContactName;
    private String requestedEmergencyContactNumber;
    private String requestedProfilePhotoUrl;

    private String status;
    private String rejectionReason;
    private String reviewerComment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime reviewedAt;
    private EmployeeBasicResponse reviewedBy;
}
