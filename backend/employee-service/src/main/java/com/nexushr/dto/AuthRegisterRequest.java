package com.nexushr.dto;

import com.nexushr.enums.Role;
import lombok.Data;

@Data
public class AuthRegisterRequest {

    private String email;
    private String password;
    private Role role;
}