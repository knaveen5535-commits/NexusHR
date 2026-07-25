package com.nexushr.repository;

import com.nexushr.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    @Query("SELECT s FROM SalaryStructure s WHERE s.employeeId = :employeeId AND (s.isActive = true OR s.isActive IS NULL)")
    Optional<SalaryStructure> findActiveStructureByEmployeeId(@Param("employeeId") Long employeeId);
    
    // Kept for backward compatibility or fetching all structures for an employee
    List<SalaryStructure> findByEmployeeId(Long employeeId);
}
