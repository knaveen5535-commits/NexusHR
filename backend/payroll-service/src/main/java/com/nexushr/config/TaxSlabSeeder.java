package com.nexushr.config;

import com.nexushr.entity.TaxSlab;
import com.nexushr.repository.TaxSlabRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
public class TaxSlabSeeder implements CommandLineRunner {

    private final TaxSlabRepository taxSlabRepository;

    @Override
    public void run(String... args) throws Exception {
        if (taxSlabRepository.count() == 0) {
            System.out.println("Seeding Tax Slabs...");
            
            TaxSlab slab1 = TaxSlab.builder()
                    .financialYear("2026-2027")
                    .minSalary(BigDecimal.ZERO)
                    .maxSalary(BigDecimal.valueOf(300000))
                    .taxPercentage(BigDecimal.ZERO)
                    .fixedDeduction(BigDecimal.ZERO)
                    .build();

            TaxSlab slab2 = TaxSlab.builder()
                    .financialYear("2026-2027")
                    .minSalary(BigDecimal.valueOf(300001))
                    .maxSalary(BigDecimal.valueOf(600000))
                    .taxPercentage(BigDecimal.valueOf(5))
                    .fixedDeduction(BigDecimal.ZERO)
                    .build();

            TaxSlab slab3 = TaxSlab.builder()
                    .financialYear("2026-2027")
                    .minSalary(BigDecimal.valueOf(600001))
                    .maxSalary(BigDecimal.valueOf(900000))
                    .taxPercentage(BigDecimal.valueOf(10))
                    .fixedDeduction(BigDecimal.valueOf(15000))
                    .build();

            TaxSlab slab4 = TaxSlab.builder()
                    .financialYear("2026-2027")
                    .minSalary(BigDecimal.valueOf(900001))
                    .maxSalary(BigDecimal.valueOf(1200000))
                    .taxPercentage(BigDecimal.valueOf(15))
                    .fixedDeduction(BigDecimal.valueOf(45000))
                    .build();

            TaxSlab slab5 = TaxSlab.builder()
                    .financialYear("2026-2027")
                    .minSalary(BigDecimal.valueOf(1200001))
                    .maxSalary(null) // No max limit
                    .taxPercentage(BigDecimal.valueOf(30))
                    .fixedDeduction(BigDecimal.valueOf(115000))
                    .build();

            taxSlabRepository.saveAll(List.of(slab1, slab2, slab3, slab4, slab5));
            System.out.println("Tax Slabs seeded successfully.");
        }
    }
}
