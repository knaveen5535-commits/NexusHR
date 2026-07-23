package com.nexushr.repository;

import com.nexushr.entity.Resignation;
import com.nexushr.enums.ResignationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResignationRepository extends JpaRepository<Resignation, Long> {
    List<Resignation> findByEmployeeId(Long employeeId);
    boolean existsByEmployeeIdAndStatus(Long employeeId, ResignationStatus status);
}
