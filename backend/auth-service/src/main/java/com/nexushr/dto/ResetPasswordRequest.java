package com.nexushr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_\\-]).{8,64}$",
        message = "Password must be 8-64 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    @Pattern(
        regexp = "^\\S+$",
        message = "Password cannot contain spaces"
    )
    private String newPassword;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;
}