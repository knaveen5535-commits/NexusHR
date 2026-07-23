package com.nexushr.config;

import com.nexushr.entity.SalaryComponent;
import com.nexushr.entity.SalaryStructure;
import com.nexushr.enums.ComponentType;
import com.nexushr.enums.ValueType;
import com.nexushr.repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SalaryStructureRepository salaryStructureRepository;

    @Override
    public void run(String... args) throws Exception {
        if (salaryStructureRepository.count() == 0) {
            System.out.println("Seeding dummy salary structures...");
            // Seed for employee 1 (HR), 2 (Manager), 3 (Employee) based on usual IDs
            for (long i = 1; i <= 5; i++) {
                SalaryStructure ss = SalaryStructure.builder()
                        .employeeId(i)
                        .baseSalary(BigDecimal.valueOf(3000 + (1000 * i)))
                        .effectiveFrom(LocalDate.of(2024, 1, 1))
                        .isActive(true)
                        .build();

                SalaryComponent sc = SalaryComponent.builder()
                        .name("HRA")
                        .componentType(ComponentType.EARNING)
                        .valueType(ValueType.PERCENTAGE)
                        .componentValue(BigDecimal.valueOf(40))
                        .build();
                sc.setSalaryStructure(ss);

                SalaryComponent pf = SalaryComponent.builder()
                        .name("PF")
                        .componentType(ComponentType.DEDUCTION)
                        .valueType(ValueType.PERCENTAGE)
                        .componentValue(BigDecimal.valueOf(12))
                        .build();
                pf.setSalaryStructure(ss);

                ss.setComponents(List.of(sc, pf));
                salaryStructureRepository.save(ss);
            }
            System.out.println("Dummy salary structures seeded.");
        }
    }
}
