package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "leave_balances",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "leave_type_id", "year"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "total_days", precision = 5, scale = 2)
    private BigDecimal totalDays = BigDecimal.ZERO;

    @Column(name = "used_days", precision = 5, scale = 2)
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "pending_days", precision = 5, scale = 2)
    private BigDecimal pendingDays = BigDecimal.ZERO;

    @Column(name = "remaining_days", precision = 5, scale = 2)
    private BigDecimal remainingDays = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer year;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
