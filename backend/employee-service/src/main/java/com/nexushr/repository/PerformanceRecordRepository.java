package com.nexushr.repository;

import com.nexushr.entity.PerformanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRecordRepository extends JpaRepository<PerformanceRecord, Long> {
    Optional<PerformanceRecord> findByEmployeeIdAndPerformanceYearAndPerformanceMonth(Long employeeId, Integer year, Integer month);
    List<PerformanceRecord> findByEmployeeIdOrderByPerformanceYearDescPerformanceMonthDesc(Long employeeId);
    List<PerformanceRecord> findByPerformanceYearAndPerformanceMonth(Integer year, Integer month);
}
