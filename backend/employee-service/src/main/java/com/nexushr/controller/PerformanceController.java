package com.nexushr.controller;

import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.performance.PerformanceConfigurationDto;
import com.nexushr.dto.performance.PerformanceGenerateRequest;
import com.nexushr.dto.performance.PerformanceRecordDto;
import com.nexushr.dto.performance.PerformanceReportDto;
import com.nexushr.enums.Role;
import com.nexushr.service.EmployeeService;
import com.nexushr.service.PerformanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;
    private final EmployeeService employeeService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateMonthlyPerformance(
            @Valid @RequestBody PerformanceGenerateRequest request,
            HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        EmployeeResponse admin = getAdminOrHrEmployee(httpRequest, true);
        String generatedBy = admin.getFirstName() + " " + admin.getLastName();
        performanceService.generateMonthlyPerformance(request, generatedBy, authHeader);
        return ResponseEntity.ok("Performance generation initiated successfully");
    }

    @PostMapping("/publish")
    public ResponseEntity<String> publishPerformance(
            @Valid @RequestBody PerformanceGenerateRequest request,
            HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, true);
        performanceService.publishPerformance(request);
        return ResponseEntity.ok("Performance published successfully");
    }



    @GetMapping("/me")
    public ResponseEntity<PerformanceRecordDto> getMyPerformance(
            @RequestParam Integer year, 
            @RequestParam Integer month,
            HttpServletRequest httpRequest) {
        EmployeeResponse employee = getCurrentEmployee(httpRequest);
        return ResponseEntity.ok(performanceService.getMyPerformance(employee.getId(), year, month, true));
    }
    
    @GetMapping("/history/me")
    public ResponseEntity<List<PerformanceRecordDto>> getMyPerformanceHistory(HttpServletRequest httpRequest) {
        EmployeeResponse employee = getCurrentEmployee(httpRequest);
        return ResponseEntity.ok(performanceService.getMyPerformanceHistory(employee.getId(), true));
    }

    @GetMapping("/team")
    public ResponseEntity<List<PerformanceRecordDto>> getTeamPerformance(
            @RequestParam Integer year, 
            @RequestParam Integer month,
            HttpServletRequest httpRequest) {
        EmployeeResponse manager = getManagerEmployee(httpRequest);
        return ResponseEntity.ok(performanceService.getTeamPerformance(manager.getId(), year, month, true));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PerformanceRecordDto>> getAllPerformance(
            @RequestParam Integer year, 
            @RequestParam Integer month,
            HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, false);
        return ResponseEntity.ok(performanceService.getAllPerformance(year, month));
    }

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<List<PerformanceRecordDto>> getEmployeePerformanceHistory(
            @PathVariable Long employeeId,
            HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, false);
        return ResponseEntity.ok(performanceService.getMyPerformanceHistory(employeeId, false));
    }

    @GetMapping("/report")
    public ResponseEntity<PerformanceReportDto> getPerformanceReport(
            @RequestParam Integer year, 
            @RequestParam Integer month,
            HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, false);
        return ResponseEntity.ok(performanceService.getPerformanceReport(year, month));
    }

    @GetMapping("/configuration")
    public ResponseEntity<PerformanceConfigurationDto> getConfiguration(HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, true);
        return ResponseEntity.ok(performanceService.getConfiguration());
    }

    @GetMapping("/generated-months")
    public ResponseEntity<List<String>> getGeneratedMonths(HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, false);
        return ResponseEntity.ok(performanceService.getGeneratedMonths());
    }

    @PutMapping("/configuration")
    public ResponseEntity<PerformanceConfigurationDto> updateConfiguration(
            @RequestBody PerformanceConfigurationDto request,
            HttpServletRequest httpRequest) {
        getAdminOrHrEmployee(httpRequest, true);
        return ResponseEntity.ok(performanceService.updateConfiguration(request));
    }

    private EmployeeResponse getCurrentEmployee(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        return employeeService.getCurrentEmployee(authHeader);
    }

    private EmployeeResponse getAdminOrHrEmployee(HttpServletRequest httpRequest, boolean adminOnly) {
        EmployeeResponse employee = getCurrentEmployee(httpRequest);
        if (adminOnly) {
            if (employee.getRole() != Role.ADMIN) {
                throw new RuntimeException("Unauthorized: Admin access required");
            }
        } else {
            if (employee.getRole() != Role.ADMIN && employee.getRole() != Role.HR) {
                throw new RuntimeException("Unauthorized: Admin or HR access required");
            }
        }
        return employee;
    }
    
    private EmployeeResponse getManagerEmployee(HttpServletRequest httpRequest) {
        EmployeeResponse employee = getCurrentEmployee(httpRequest);
        if (employee.getRole() != Role.MANAGER && employee.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized: Manager access required");
        }
        return employee;
    }
}
