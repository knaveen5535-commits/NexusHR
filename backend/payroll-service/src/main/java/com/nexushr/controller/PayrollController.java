package com.nexushr.controller;

import com.nexushr.dto.PayrollDTO;
import com.nexushr.dto.PayrollStatusDTO;
import com.nexushr.enums.PayrollStatus;
import com.nexushr.service.PayrollService;
import com.nexushr.service.EmployeeClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final EmployeeClient employeeClient;
    private final com.nexushr.service.PayslipService payslipService;

    @PostMapping("/generate")
    public ResponseEntity<?> generatePayroll(@RequestParam Long employeeId,
                                             @RequestParam Integer month,
                                             @RequestParam Integer year) {
        try {
            return ResponseEntity.ok(payrollService.generatePayroll(employeeId, month, year));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/generate/bulk")
    public ResponseEntity<?> generateBulkPayroll(@RequestParam Integer month,
                                                 @RequestParam Integer year) {
        try {
            return ResponseEntity.ok(payrollService.generateBulkPayroll(month, year));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/submit-review")
    public ResponseEntity<?> submitForReview(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(payrollService.submitForReview(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approvePayroll(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        try {
            return ResponseEntity.ok(payrollService.approvePayroll(id, remarks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(payrollService.markAsPaid(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPayroll(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        try {
            return ResponseEntity.ok(payrollService.rejectPayroll(id, remarks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PayrollDTO>> getAllPayrolls(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(payrollService.getAllPayrolls(month, year));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyPayrolls() {
        try {
            com.nexushr.dto.EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
            return ResponseEntity.ok(payrollService.getPayrollsByEmployee(currentEmployee.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getPayrollsByEmployee(@PathVariable Long employeeId) {
        try {
            // Ownership validation
            com.nexushr.dto.EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
            if (!currentEmployee.getId().equals(employeeId) 
                    && !"HR".equals(currentEmployee.getRole()) 
                    && !"ADMIN".equals(currentEmployee.getRole())) {
                return ResponseEntity.status(403).body("Access Denied: You can only view your own payroll");
            }
            return ResponseEntity.ok(payrollService.getPayrollsByEmployee(employeeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/team")
    public ResponseEntity<?> getTeamPayrollStatus(@RequestParam(required = false) Integer month, @RequestParam(required = false) Integer year) {
        try {
            List<com.nexushr.dto.EmployeeDTO> team = employeeClient.getTeamMembers();
            List<Long> teamIds = team.stream().map(com.nexushr.dto.EmployeeDTO::getId).toList();

            List<PayrollDTO> teamStatuses = payrollService.getAllPayrolls(month, year).stream()
                    .filter(p -> teamIds.contains(p.getEmployeeId()))
                    .map(p -> {
                        if (p.getEmployeeCode() == null || "N/A".equals(p.getEmployeeCode())) {
                            team.stream()
                                .filter(e -> e.getId().equals(p.getEmployeeId()))
                                .findFirst()
                                .ifPresent(e -> p.setEmployeeCode(e.getEmployeeCode()));
                        }
                        return p;
                    })
                    .toList();

            return ResponseEntity.ok(teamStatuses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/payslip/download")
    public ResponseEntity<?> downloadPayslip(@PathVariable Long id) {
        try {
            // First find the payroll by searching through getPayrollsByEmployee if possible, or fetch all and filter
            // Wait, we don't have a getPayrollById method in PayrollService.
            // Let's get it by fetching all and matching ID, since this is a quick implementation
            PayrollDTO payroll = payrollService.getAllPayrolls(null, null).stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Payroll not found"));

            // Ownership check
            com.nexushr.dto.EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
            if (!currentEmployee.getId().equals(payroll.getEmployeeId())
                    && !"HR".equals(currentEmployee.getRole())
                    && !"ADMIN".equals(currentEmployee.getRole())) {
                if ("MANAGER".equals(currentEmployee.getRole())) {
                    List<com.nexushr.dto.EmployeeDTO> team = employeeClient.getTeamMembers();
                    boolean isTeamMember = team.stream().anyMatch(e -> e.getId().equals(payroll.getEmployeeId()));
                    if (!isTeamMember) {
                        return ResponseEntity.status(403).body("Access Denied: You can only download payslips for your team members");
                    }
                } else {
                    return ResponseEntity.status(403).body("Access Denied: You can only download your own payslip");
                }
            }

            if (!"PAID".equalsIgnoreCase(payroll.getStatus())) {
                return ResponseEntity.badRequest().body("Payslip is only available for PAID payrolls");
            }

            byte[] pdfBytes = payslipService.generatePayslipPdf(payroll);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Payslip_" + payroll.getPayslipNumber() + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
