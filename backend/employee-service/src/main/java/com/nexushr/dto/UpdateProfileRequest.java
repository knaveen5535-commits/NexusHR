package com.nexushr.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String phone;
    private String address;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String profilePhotoUrl;
    
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate dateOfBirth;
    
    private String gender;
    private String bloodGroup;
}
