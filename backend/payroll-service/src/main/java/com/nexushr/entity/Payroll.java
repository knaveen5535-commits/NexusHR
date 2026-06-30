package com.nexushr.entity;

import com.nexushr.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "payrolls")
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private BigDecimal baseSalary;

    private BigDecimal bonus;

    private BigDecimal deductions;

    private BigDecimal netSalary;

    private LocalDate payDate;

    @Enumerated(EnumType.STRING)
    private PayrollStatus status;
}