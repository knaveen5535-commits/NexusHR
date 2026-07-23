package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeBasicResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String departmentName;
    private String designationTitle;

    public EmployeeBasicResponse(Long id, String firstName, String lastName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
