package com.nexushr.service;

import com.nexushr.dto.CreatePayrollRequest;
import com.nexushr.dto.PayrollResponse;
import com.nexushr.entity.Payroll;
import com.nexushr.enums.PayrollStatus;
import com.nexushr.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    public PayrollResponse createPayroll(
            CreatePayrollRequest request) {

        BigDecimal bonus =
                request.getBonus() != null
                        ? request.getBonus()
                        : BigDecimal.ZERO;

        BigDecimal deductions =
                request.getDeductions() != null
                        ? request.getDeductions()
                        : BigDecimal.ZERO;

        BigDecimal netSalary =
                request.getBaseSalary()
                        .add(bonus)
                        .subtract(deductions);

        Payroll payroll = new Payroll();

        payroll.setEmployeeId(
                request.getEmployeeId()
        );

        payroll.setBaseSalary(
                request.getBaseSalary()
        );

        payroll.setBonus(bonus);

        payroll.setDeductions(deductions);

        payroll.setNetSalary(netSalary);

        payroll.setPayDate(
                LocalDate.now()
        );

        payroll.setStatus(
                PayrollStatus.PENDING
        );

        Payroll savedPayroll =
                payrollRepository.save(payroll);

        return new PayrollResponse(
                savedPayroll.getId(),
                savedPayroll.getEmployeeId(),
                savedPayroll.getBaseSalary(),
                savedPayroll.getBonus(),
                savedPayroll.getDeductions(),
                savedPayroll.getNetSalary(),
                savedPayroll.getPayDate(),
                savedPayroll.getStatus()
        );
    }
}
