package com.nexushr.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DropConstraintConfig implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DropConstraintConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_profile_verification_status_check");
            System.out.println("Successfully dropped employees_profile_verification_status_check constraint if it existed.");
        } catch (Exception e) {
            System.err.println("Failed to drop employees constraint: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE employee_documents DROP CONSTRAINT IF EXISTS employee_documents_status_check");
            System.out.println("Successfully dropped employee_documents_status_check constraint if it existed.");
        } catch (Exception e) {
            System.err.println("Failed to drop employee_documents constraint: " + e.getMessage());
        }
    }
}
