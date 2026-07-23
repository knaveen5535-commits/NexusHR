package com.nexushr.dto;

import com.nexushr.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {
    
    @NotNull(message = "Role is required")
    private Role role;
}
