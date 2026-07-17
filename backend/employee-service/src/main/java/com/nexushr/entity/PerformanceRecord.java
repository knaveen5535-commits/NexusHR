package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "performance_record", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "performanceYear", "performanceMonth"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer performanceYear;

    @Column(nullable = false)
    private Integer performanceMonth;

    private Double attendanceScore;
    private Double selfReviewScore;
    private Double peerReviewScore;
    private Double managerReviewScore;

    private Double attendanceWeight;
    private Double selfWeight;
    private Double peerWeight;
    private Double managerWeight;

    private Double finalScore;
    private String grade;

    @Column(length = 1000)
    private String remarks;

    private String generatedBy;

    private LocalDateTime generatedAt;

    private boolean published = false;
    private boolean locked = false;

    private boolean managerReviewSubmitted = false;
    private boolean peerReviewSubmitted = false;
    private boolean selfReviewSubmitted = false;
    private boolean attendanceAvailable = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
