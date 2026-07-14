package com.nexushr.service;

import com.nexushr.dto.EmployeeDTO;
import com.nexushr.dto.PayrollDTO;
import com.nexushr.entity.*;
import com.nexushr.enums.ComponentType;
import com.nexushr.enums.PayrollStatus;
import com.nexushr.enums.ValueType;
import com.nexushr.repository.PayrollRepository;
import com.nexushr.repository.SalaryStructureRepository;
import com.nexushr.repository.TaxSlabRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final TaxSlabRepository taxSlabRepository;
    private final EmployeeClient employeeClient;

    public Payroll generatePayroll(Long employeeId, Integer month, Integer year) {
        payrollRepository.findByEmployeeIdAndPayrollMonthAndPayrollYear(employeeId, month, year)
                .ifPresent(p -> { throw new RuntimeException("Payroll already generated for this month"); });

        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Salary structure not found for employee"));

        BigDecimal grossSalary = structure.getBaseSalary();
        BigDecimal totalDeductions = BigDecimal.ZERO;
        List<PayrollComponent> payrollComponents = new ArrayList<>();

        // Process dynamic components
        for (SalaryComponent sc : structure.getComponents()) {
            BigDecimal amount = sc.getComponentValue();
            if (sc.getValueType() == ValueType.PERCENTAGE) {
                amount = structure.getBaseSalary().multiply(sc.getComponentValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            PayrollComponent pc = PayrollComponent.builder()
                    .name(sc.getName())
                    .componentType(sc.getComponentType())
                    .amount(amount)
                    .build();
            payrollComponents.add(pc);

            if (sc.getComponentType() == ComponentType.EARNING) {
                grossSalary = grossSalary.add(amount);
            } else {
                totalDeductions = totalDeductions.add(amount);
            }
        }

        // Calculate Tax (Simplified Annualized Calculation)
        BigDecimal annualizedSalary = grossSalary.multiply(BigDecimal.valueOf(12));
        List<TaxSlab> slabs = taxSlabRepository.findByFinancialYearOrderByMinSalaryAsc("2026-2027");
        
        BigDecimal annualTax = BigDecimal.ZERO;
        for (TaxSlab slab : slabs) {
            if (annualizedSalary.compareTo(slab.getMinSalary()) > 0) {
                BigDecimal taxableAmountInSlab = annualizedSalary;
                if (slab.getMaxSalary() != null && annualizedSalary.compareTo(slab.getMaxSalary()) > 0) {
                    taxableAmountInSlab = slab.getMaxSalary();
                }
                taxableAmountInSlab = taxableAmountInSlab.subtract(slab.getMinSalary());
                
                BigDecimal taxForSlab = taxableAmountInSlab.multiply(slab.getTaxPercentage()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                annualTax = annualTax.add(taxForSlab);
            }
        }
        
        BigDecimal monthlyTax = annualTax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        totalDeductions = totalDeductions.add(monthlyTax);

        PayrollComponent taxComponent = PayrollComponent.builder()
                .name("Income Tax")
                .componentType(ComponentType.DEDUCTION)
                .amount(monthlyTax)
                .build();
        payrollComponents.add(taxComponent);

        BigDecimal netSalary = grossSalary.subtract(totalDeductions);

        Payroll payroll = Payroll.builder()
                .employeeId(employeeId)
                .payrollMonth(month)
                .payrollYear(year)
                .payslipNumber(generatePayslipNumber(employeeId, month, year))
                .grossSalary(grossSalary)
                .totalDeductions(totalDeductions)
                .totalTaxes(monthlyTax)
                .netSalary(netSalary)
                .status(PayrollStatus.PENDING)
                .build();

        for (PayrollComponent pc : payrollComponents) {
            pc.setPayroll(payroll);
        }
        payroll.setComponents(payrollComponents);

        return payrollRepository.save(payroll);
    }

    public List<PayrollDTO> getAllPayrolls(Integer month, Integer year) {
        List<Payroll> payrolls;
        if (month != null && year != null) {
            payrolls = payrollRepository.findByPayrollMonthAndPayrollYear(month, year);
        } else {
            payrolls = payrollRepository.findAll();
        }
        return payrolls.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<PayrollDTO> getPayrollsByEmployee(Long employeeId) {
        List<Payroll> payrolls = payrollRepository.findByEmployeeIdOrderByPayrollYearDescPayrollMonthDesc(employeeId);
        return payrolls.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private PayrollDTO mapToDTO(Payroll payroll) {
        PayrollDTO dto = new PayrollDTO();
        dto.setId(payroll.getId());
        dto.setEmployeeId(payroll.getEmployeeId());
        dto.setPayrollMonth(payroll.getPayrollMonth());
        dto.setPayrollYear(payroll.getPayrollYear());
        dto.setPayslipNumber(payroll.getPayslipNumber());
        dto.setGrossSalary(payroll.getGrossSalary());
        dto.setTotalDeductions(payroll.getTotalDeductions());
        dto.setTotalTaxes(payroll.getTotalTaxes());
        dto.setNetSalary(payroll.getNetSalary());
        dto.setStatus(payroll.getStatus().name().toLowerCase());

        EmployeeDTO employee = employeeClient.getEmployeeById(payroll.getEmployeeId());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setPosition(employee.getDesignation());

        return dto;
    }

    private String generatePayslipNumber(Long employeeId, Integer month, Integer year) {
        return String.format("PAY-%04d%02d-%04d", year, month, employeeId);
    }
}