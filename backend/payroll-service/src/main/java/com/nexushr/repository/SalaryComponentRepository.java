package com.nexushr.repository;

import com.nexushr.entity.SalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, Long> {
}
