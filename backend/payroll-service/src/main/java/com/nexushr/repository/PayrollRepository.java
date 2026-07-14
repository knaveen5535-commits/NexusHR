package com.nexushr.repository;

import com.nexushr.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByPayrollMonthAndPayrollYear(Integer payrollMonth, Integer payrollYear);
    Optional<Payroll> findByEmployeeIdAndPayrollMonthAndPayrollYear(Long employeeId, Integer payrollMonth, Integer payrollYear);
    List<Payroll> findByEmployeeIdOrderByPayrollYearDescPayrollMonthDesc(Long employeeId);
}