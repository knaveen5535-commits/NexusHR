package com.nexushr.dto;

import com.nexushr.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesignationResponse {
    private Long id;
    private String designationName;
    private Long departmentId;
    private Role designationType;
    private boolean active;
}
