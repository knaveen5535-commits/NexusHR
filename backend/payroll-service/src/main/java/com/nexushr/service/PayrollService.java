package com.nexushr.service;

import com.nexushr.dto.EmployeeDTO;
import com.nexushr.dto.PayrollDTO;
import com.nexushr.dto.BulkPayrollResultDTO;
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
    private final AttendanceService attendanceService;

    public Payroll generatePayroll(Long employeeId, Integer month, Integer year) {
        payrollRepository.findByEmployeeIdAndPayrollMonthAndPayrollYear(employeeId, month, year)
                .ifPresent(p -> { 
                    if (p.getStatus() != PayrollStatus.REJECTED) {
                        throw new RuntimeException("Payroll already generated for this month and is not rejected");
                    }
                    // If it is REJECTED, we delete it to make way for the new one
                    payrollRepository.delete(p);
                });

        SalaryStructure structure = salaryStructureRepository.findActiveStructureByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Active salary structure not found for employee"));
        
        // Fetch snapshot data
        EmployeeDTO employee = employeeClient.getEmployeeById(employeeId);
        if (employee.getId() == null) {
            throw new RuntimeException("Employee details could not be fetched");
        }
        if ("ONBOARDING".equalsIgnoreCase(employee.getStatus())) {
            throw new RuntimeException("Cannot generate payroll for onboarding employees");
        }

        // Attendance Calculation
        java.time.YearMonth yearMonth = java.time.YearMonth.of(year, month);
        int totalDays = yearMonth.lengthOfMonth();
        java.time.LocalDate startDate = yearMonth.atDay(1);
        java.time.LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<com.nexushr.dto.AttendanceDTO> attendance = attendanceService.getEmployeeAttendance(employeeId, startDate, endDate);
        
        // Count absent days (assuming working days are Mon-Fri, simplified approach)
        long workingDays = java.util.stream.IntStream.rangeClosed(1, totalDays)
            .mapToObj(yearMonth::atDay)
            .filter(d -> d.getDayOfWeek() != java.time.DayOfWeek.SATURDAY && d.getDayOfWeek() != java.time.DayOfWeek.SUNDAY)
            .count();
            
        long presentDays = attendance.stream()
            .filter(a -> "present".equalsIgnoreCase(a.getStatus()) || "late".equalsIgnoreCase(a.getStatus()))
            .count();
            
        // If there are absolutely zero attendance records for this month, assume 100% attendance (Salaried default)
        long lopDays = 0;
        if (!attendance.isEmpty()) {
            lopDays = workingDays > presentDays ? workingDays - presentDays : 0;
        }

        BigDecimal prorationFactor = BigDecimal.ONE;
        if (workingDays > 0) {
            prorationFactor = BigDecimal.valueOf(workingDays - lopDays).divide(BigDecimal.valueOf(workingDays), 4, RoundingMode.HALF_UP);
        }

        BigDecimal grossSalary = structure.getBaseSalary().multiply(prorationFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalDeductions = BigDecimal.ZERO;
        List<PayrollComponent> payrollComponents = new ArrayList<>();

        // Process dynamic components
        for (SalaryComponent sc : structure.getComponents()) {
            BigDecimal amount = sc.getComponentValue();
            if (sc.getValueType() == ValueType.PERCENTAGE) {
                amount = structure.getBaseSalary().multiply(sc.getComponentValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            // Prorate dynamic components as well
            amount = amount.multiply(prorationFactor).setScale(2, RoundingMode.HALF_UP);

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
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .employeeCode(employee.getEmployeeCode() != null ? employee.getEmployeeCode() : "N/A")
                .departmentName(employee.getDepartmentName() != null ? employee.getDepartmentName() : "N/A")
                .designationName(employee.getDesignation() != null ? employee.getDesignation() : "N/A")
                .baseSalaryUsed(structure.getBaseSalary())
                .payrollMonth(month)
                .payrollYear(year)
                .payslipNumber(generatePayslipNumber(employeeId, month, year))
                .grossSalary(grossSalary)
                .totalDeductions(totalDeductions)
                .totalTaxes(monthlyTax)
                .netSalary(netSalary)
                .status(PayrollStatus.GENERATED)
                .build();

        for (PayrollComponent pc : payrollComponents) {
            pc.setPayroll(payroll);
        }
        payroll.setComponents(payrollComponents);

        return payrollRepository.save(payroll);
    }

    public BulkPayrollResultDTO generateBulkPayroll(Integer month, Integer year) {
        List<SalaryStructure> activeStructures = salaryStructureRepository.findAll().stream()
                .filter(s -> s.getIsActive() == null || Boolean.TRUE.equals(s.getIsActive()))
                .collect(Collectors.toList());

        BulkPayrollResultDTO result = new BulkPayrollResultDTO();
        
        for (SalaryStructure structure : activeStructures) {
            try {
                // Skip ADMIN role or inactive employees
                EmployeeDTO emp = employeeClient.getEmployeeById(structure.getEmployeeId());
                if (emp.getId() == null || "ADMIN".equals(emp.getRole()) || "INACTIVE".equalsIgnoreCase(emp.getStatus()) || "ONBOARDING".equalsIgnoreCase(emp.getStatus())) {
                    result.setSkipped(result.getSkipped() + 1);
                    continue;
                }
                
                generatePayroll(structure.getEmployeeId(), month, year);
                result.setProcessed(result.getProcessed() + 1);
            } catch (Exception e) {
                // If already generated, count as skipped. Else count as failed.
                if (e.getMessage() != null && e.getMessage().contains("already generated")) {
                    result.setSkipped(result.getSkipped() + 1);
                } else {
                    result.setFailed(result.getFailed() + 1);
                    result.getErrors().add("Emp " + structure.getEmployeeId() + ": " + e.getMessage());
                }
            }
        }
        
        return result;
    }

    public Payroll submitForReview(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
        String role = currentEmployee.getRole();
        if (!"HR".equals(role) && !"ADMIN".equals(role)) {
            throw new org.springframework.security.access.AccessDeniedException("Only HR/Admin can submit for review");
        }
        if (payroll.getStatus() != PayrollStatus.GENERATED) {
            throw new RuntimeException("Only GENERATED payrolls can be submitted for review");
        }
        payroll.setStatus(PayrollStatus.UNDER_REVIEW);
        return payrollRepository.save(payroll);
    }

    public Payroll approvePayroll(Long payrollId, String remarks) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
        if (!"ADMIN".equals(currentEmployee.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Only Admin can approve payroll");
        }
        if (payroll.getStatus() != PayrollStatus.GENERATED && payroll.getStatus() != PayrollStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only GENERATED or UNDER_REVIEW payrolls can be approved");
        }
        payroll.setStatus(PayrollStatus.APPROVED);
        payroll.setRemarks(remarks);
        return payrollRepository.save(payroll);
    }

    public Payroll markAsPaid(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
        String role = currentEmployee.getRole();
        if (!"HR".equals(role) && !"ADMIN".equals(role)) {
            throw new org.springframework.security.access.AccessDeniedException("Only HR/Admin can mark as paid");
        }
        if (payroll.getStatus() != PayrollStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED payrolls can be marked as paid");
        }
        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaymentDate(java.time.LocalDate.now());
        return payrollRepository.save(payroll);
    }

    public Payroll rejectPayroll(Long payrollId, String remarks) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        EmployeeDTO currentEmployee = employeeClient.getCurrentEmployee();
        if (!"ADMIN".equals(currentEmployee.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Only Admin can reject payroll");
        }
        if (payroll.getStatus() == PayrollStatus.PAID) {
            throw new RuntimeException("Cannot reject a payroll that has already been PAID");
        }
        payroll.setStatus(PayrollStatus.REJECTED);
        payroll.setRemarks(remarks);
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
        dto.setRemarks(payroll.getRemarks());

        // Use snapshotted values instead of fetching via REST API
        dto.setEmployeeName(payroll.getEmployeeName());
        dto.setEmployeeCode(payroll.getEmployeeCode());
        dto.setPosition(payroll.getDesignationName());

        return dto;
    }

    private String generatePayslipNumber(Long employeeId, Integer month, Integer year) {
        return String.format("PAY-%04d%02d-%04d", year, month, employeeId);
    }
}