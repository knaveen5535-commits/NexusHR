package com.nexushr.dto;

import com.nexushr.enums.Role;
import lombok.Data;

@Data
public class UpdateDesignationRequest {
    private String designationName;
    private Long departmentId;
    private Role designationType;
}
