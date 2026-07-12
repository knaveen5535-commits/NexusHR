package com.nexushr.repository;

import com.nexushr.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findByDepartmentIdAndDesignationType(Long departmentId, com.nexushr.enums.Role designationType);
    List<Designation> findByDepartmentId(Long departmentId);
    List<Designation> findByDesignationType(com.nexushr.enums.Role designationType);
}
