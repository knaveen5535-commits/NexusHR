package com.nexushr.dto;

import com.nexushr.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDesignationRequest {
    @NotBlank(message = "Designation name is required")
    private String designationName;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Designation type is required")
    private Role designationType;
}
