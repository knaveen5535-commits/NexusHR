package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "performance_configuration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double attendanceWeight = 30.0;

    @Column(nullable = false)
    private Double selfWeight = 8.0;

    @Column(nullable = false)
    private Double peerWeight = 12.0;

    @Column(nullable = false)
    private Double managerWeight = 50.0;

    @Column(nullable = false)
    private Integer reviewWindowStartDay = 1;

    @Column(nullable = false)
    private Integer reviewWindowEndDay = 5;

    @Column(nullable = false)
    private Double minimumAttendanceRequired = 0.0;

    @Column(nullable = false)
    private Boolean performanceEnabled = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
