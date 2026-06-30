package com.nexushr.controller;

import com.nexushr.dto.CreatePayrollRequest;
import com.nexushr.dto.PayrollResponse;
import com.nexushr.service.PayrollService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/payroll")
public class PayrollController {
    @Autowired
    private PayrollService payrollService;
    @PostMapping
    public ResponseEntity<PayrollResponse> createPayroll(
            @RequestBody CreatePayrollRequest request,
            HttpServletRequest httpRequest
    ) {

        String authHeader =
                httpRequest.getHeader("Authorization");

        return ResponseEntity.ok(
                payrollService.createPayroll(
                        request,
                        authHeader
                )
        );
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<List<PayrollResponse>>
    getPayrollByEmployeeId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                payrollService.getPayrollByEmployeeId(id)
        );
    }


    @GetMapping
    public ResponseEntity<List<PayrollResponse>>
    getAllPayrolls() {

        return ResponseEntity.ok(
                payrollService.getAllPayrolls()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayroll(
            @PathVariable Long id) {

        payrollService.deletePayroll(id);

        return ResponseEntity.ok(
                "Payroll deleted successfully"
        );
    }
}
