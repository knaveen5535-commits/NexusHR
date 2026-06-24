package com.nexushr.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/profile")
    public String employee() {
        return "Employee Access";
    }
}