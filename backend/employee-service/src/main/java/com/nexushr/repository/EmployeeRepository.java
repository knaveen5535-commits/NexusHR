package com.nexushr.repository;

import com.nexushr.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);
    java.util.Optional<Employee> findByEmail(String email);
    List<Employee> findByManagerId(Long managerId);
    List<Employee> findByRole(com.nexushr.enums.Role role);
    List<Employee> findByRoleAndDepartmentId(com.nexushr.enums.Role role, Long departmentId);
    long countByStatus(com.nexushr.enums.EmployeeStatus status);
    long countByRole(com.nexushr.enums.Role role);
    long countByDepartmentId(Long departmentId);
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(e.salary), 0) FROM Employee e")
    java.math.BigDecimal sumSalary();
}