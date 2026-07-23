package com.nexushr.dto.performance;

import com.nexushr.dto.EmployeeResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceRecordDto {
    private Long id;
    private EmployeeResponse employee;
    private Integer performanceYear;
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
    private String remarks;
    
    private String generatedBy;
    private LocalDateTime generatedAt;
    
    private boolean published;
    private boolean locked;
    
    private boolean managerReviewSubmitted;
    private boolean peerReviewSubmitted;
    private boolean selfReviewSubmitted;
    private boolean attendanceAvailable;
}
