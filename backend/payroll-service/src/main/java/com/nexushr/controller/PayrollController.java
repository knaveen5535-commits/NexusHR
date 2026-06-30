package com.nexushr.controller;

import com.nexushr.dto.CreatePayrollRequest;
import com.nexushr.dto.PayrollResponse;
import com.nexushr.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class PayrollController {
    @Autowired
    private PayrollService payrollService;
    @PostMapping
    public ResponseEntity<PayrollResponse>
    createPayroll(
            @Valid
            @RequestBody
            CreatePayrollRequest request) {

        return ResponseEntity.ok(
                payrollService.createPayroll(request)
        );
    }
}
