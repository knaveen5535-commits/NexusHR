package com.nexushr.controller;

import com.nexushr.dto.CreateEmployeeRequest;
import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.UpdateEmployeeRequest;
import com.nexushr.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @RequestBody CreateEmployeeRequest request) {

        return ResponseEntity.ok(
                employeeService.createEmployee(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {
        return ResponseEntity.ok(
                employeeService.getAllEmployees()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                employeeService.getEmployeeById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                employeeService.deleteEmployee(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeRequest request) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(id, request)
        );
    }

}