package com.nexushr.service;

import com.nexushr.dto.CreatePayrollRequest;
import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.PayrollResponse;
import com.nexushr.entity.Payroll;
import com.nexushr.enums.PayrollStatus;
import com.nexushr.exception.EmployeeNotFoundException;
import com.nexushr.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private RestTemplate restTemplate;

    public PayrollResponse createPayroll(
            CreatePayrollRequest request,
            String authHeader) {

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

        // check employee exists in employee-service
        try {

            HttpHeaders headers =
                    new HttpHeaders();

            headers.set(
                    "Authorization",
                    authHeader
            );

            HttpEntity<String> entity =
                    new HttpEntity<>(headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            "http://localhost:8082/api/employees/" +
                                    request.getEmployeeId(),
                            HttpMethod.GET,
                            entity,
                            String.class
                    );

        } catch (Exception e) {
            throw new EmployeeNotFoundException(
                    "Employee does not exist"
            );
        }

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

    public List<PayrollResponse> getPayrollByEmployeeId(
            Long employeeId) {

        List<Payroll> payrolls =
                payrollRepository.findByEmployeeId(
                        employeeId
                );

        return payrolls.stream()
                .map(payroll ->
                        new PayrollResponse(
                                payroll.getId(),
                                payroll.getEmployeeId(),
                                payroll.getBaseSalary(),
                                payroll.getBonus(),
                                payroll.getDeductions(),
                                payroll.getNetSalary(),
                                payroll.getPayDate(),
                                payroll.getStatus()
                        )
                )
                .toList();
    }

    public List<PayrollResponse> getAllPayrolls() {

        List<Payroll> payrolls =
                payrollRepository.findAll();

        return payrolls.stream()
                .map(payroll ->
                        new PayrollResponse(
                                payroll.getId(),
                                payroll.getEmployeeId(),
                                payroll.getBaseSalary(),
                                payroll.getBonus(),
                                payroll.getDeductions(),
                                payroll.getNetSalary(),
                                payroll.getPayDate(),
                                payroll.getStatus()
                        )
                )
                .toList();
    }


    public void deletePayroll(Long id) {

        Payroll payroll =
                payrollRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll not found"
                                )
                        );

        payrollRepository.delete(payroll);
    }

    public PayrollResponse markPayrollAsPaid(
            Long id) {

        Payroll payroll =
                payrollRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll not found"
                                )
                        );

        payroll.setStatus(
                PayrollStatus.PAID
        );

        Payroll updatedPayroll =
                payrollRepository.save(payroll);

        return new PayrollResponse(
                updatedPayroll.getId(),
                updatedPayroll.getEmployeeId(),
                updatedPayroll.getBaseSalary(),
                updatedPayroll.getBonus(),
                updatedPayroll.getDeductions(),
                updatedPayroll.getNetSalary(),
                updatedPayroll.getPayDate(),
                updatedPayroll.getStatus()
        );
    }

    public List<PayrollResponse> getTeamPayrolls(
            Long managerId,
            String authHeader) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);

        HttpEntity<String> entity =
                new HttpEntity<>(headers);

        ResponseEntity<EmployeeResponse[]> response =
                restTemplate.exchange(
                        "http://localhost:8082/api/employees/manager/"
                                + managerId + "/team",
                        HttpMethod.GET,
                        entity,
                        EmployeeResponse[].class
                );

        List<Long> employeeIds =
                Arrays.stream(response.getBody())
                        .map(EmployeeResponse::getId)
                        .toList();

        List<Payroll> payrolls =
                payrollRepository.findByEmployeeIdIn(
                        employeeIds
                );

        return payrolls.stream()
                .map(payroll ->
                        new PayrollResponse(
                                payroll.getId(),
                                payroll.getEmployeeId(),
                                payroll.getBaseSalary(),
                                payroll.getBonus(),
                                payroll.getDeductions(),
                                payroll.getNetSalary(),
                                payroll.getPayDate(),
                                payroll.getStatus()
                        )
                )
                .toList();
    }

}