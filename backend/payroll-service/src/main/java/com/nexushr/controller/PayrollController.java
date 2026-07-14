package com.nexushr.controller;

import com.nexushr.dto.PayrollDTO;
import com.nexushr.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

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

    @GetMapping
    public ResponseEntity<List<PayrollDTO>> getAllPayrolls(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(payrollService.getAllPayrolls(month, year));
    }
}
