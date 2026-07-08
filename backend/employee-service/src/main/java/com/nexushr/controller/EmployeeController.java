package com.nexushr.controller;

import com.nexushr.dto.CreateEmployeeRequest;
import com.nexushr.dto.EmployeeBasicResponse;
import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.UpdateEmployeeRequest;
import com.nexushr.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
            @Valid @RequestBody CreateEmployeeRequest request,
            HttpServletRequest httpRequest) {

        String authHeader =
                httpRequest.getHeader("Authorization");

        return ResponseEntity.ok(
                employeeService.createEmployee(
                        request,
                        authHeader
                )
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
            @Valid @RequestBody UpdateEmployeeRequest request) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(id, request)
        );
    }

    @GetMapping("/manager/team")
    public ResponseEntity<List<EmployeeResponse>>
    getTeamMembers(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        return ResponseEntity.ok(
                employeeService.getTeamMembers(authHeader)
        );
    }

    @GetMapping("/managers")
    public ResponseEntity<List<EmployeeBasicResponse>> getManagers() {
        return ResponseEntity.ok(employeeService.getManagers());
    }

    @GetMapping("/department/{departmentId}/managers")
    public ResponseEntity<List<EmployeeBasicResponse>> getManagersByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(employeeService.getManagersByDepartment(departmentId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<com.nexushr.dto.DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(employeeService.getDashboardStats());
    }
}