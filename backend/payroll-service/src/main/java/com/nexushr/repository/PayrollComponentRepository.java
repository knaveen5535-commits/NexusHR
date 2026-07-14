package com.nexushr.repository;

import com.nexushr.entity.PayrollComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrollComponentRepository extends JpaRepository<PayrollComponent, Long> {
}
