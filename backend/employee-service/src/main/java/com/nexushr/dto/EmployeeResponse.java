package com.nexushr.dto;

import com.nexushr.enums.EmployeeStatus;
import com.nexushr.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;

    private String employeeCode;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private java.math.BigDecimal salary;

    private String departmentName;

    private String designation;

    private Long managerId;

    private String managerName;

    private EmployeeStatus status;

    private Role role;

    private java.time.LocalDate joiningDate;

    private java.time.LocalDate leaveDate;

    private java.time.LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    private String employmentType;

    private String address;

    private String emergencyContactName;

    private String emergencyContactNumber;

    private String profilePhotoUrl;

    private java.util.List<EmployeeDocumentDto> documents;
}