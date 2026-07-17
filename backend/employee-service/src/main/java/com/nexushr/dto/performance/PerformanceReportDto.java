package com.nexushr.dto.performance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReportDto {
    private int totalEmployees;
    private int generatedCount;
    private int outstandingCount;
    private int excellentCount;
    private int veryGoodCount;
    private int goodCount;
    private int averageCount;
    private int needsImprovementCount;
    private double averageOverallScore;
    
    private List<PerformanceRecordDto> topPerformers;
    private List<PerformanceRecordDto> lowestPerformers;
}
