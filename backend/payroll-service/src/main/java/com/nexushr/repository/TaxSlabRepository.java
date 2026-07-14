package com.nexushr.repository;

import com.nexushr.entity.TaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlab, Long> {
    List<TaxSlab> findByFinancialYearOrderByMinSalaryAsc(String financialYear);
}
