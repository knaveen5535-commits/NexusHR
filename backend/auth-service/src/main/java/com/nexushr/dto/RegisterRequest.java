package com.nexushr.dto;

import com.nexushr.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class RegisterRequest {



    @NotBlank(message = "Email cannot be empty")

    @Email(message = "Invalid email format")

    private String email;



    @NotBlank(message = "Password required")

    @Size(min = 6, message = "Password must be at least 6 characters")

    private String password;



    @NotNull(message = "Role is required")

    private Role role;

}