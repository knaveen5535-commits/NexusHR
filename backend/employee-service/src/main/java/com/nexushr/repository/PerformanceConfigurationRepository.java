package com.nexushr.repository;

import com.nexushr.entity.PerformanceConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerformanceConfigurationRepository extends JpaRepository<PerformanceConfiguration, Long> {
}
