package com.nexushr.service;

import com.nexushr.dto.performance.PerformanceConfigurationDto;
import com.nexushr.dto.performance.PerformanceGenerateRequest;
import com.nexushr.dto.performance.PerformanceRecordDto;
import com.nexushr.dto.performance.PerformanceReportDto;

import java.util.List;

public interface PerformanceService {
    PerformanceConfigurationDto getConfiguration();
    PerformanceConfigurationDto updateConfiguration(PerformanceConfigurationDto request);

    void generateMonthlyPerformance(PerformanceGenerateRequest request, String generatedBy, String authHeader);
    void publishPerformance(PerformanceGenerateRequest request);

    PerformanceRecordDto getMyPerformance(Long employeeId, Integer year, Integer month, boolean requirePublished);
    List<PerformanceRecordDto> getMyPerformanceHistory(Long employeeId, boolean requirePublished);

    List<PerformanceRecordDto> getTeamPerformance(Long managerId, Integer year, Integer month, boolean requirePublished);
    List<PerformanceRecordDto> getAllPerformance(Integer year, Integer month);
    
    PerformanceReportDto getPerformanceReport(Integer year, Integer month);
}
