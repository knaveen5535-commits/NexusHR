package com.nexushr.scheduler;

import com.nexushr.entity.Employee;
import com.nexushr.enums.EmployeeStatus;
import com.nexushr.repository.EmployeeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EmployeeStatusScheduler {

    private final EmployeeRepository employeeRepository;

    public EmployeeStatusScheduler(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void updateEmployeeStatus() {
        LocalDate today = LocalDate.now();
        List<Employee> allActive = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE && e.getLeaveDate() != null)
                .collect(Collectors.toList());

        for (Employee emp : allActive) {
            // If the leave date is today or in the past, update status to INACTIVE
            if (!emp.getLeaveDate().isAfter(today)) {
                emp.setStatus(EmployeeStatus.INACTIVE);
                employeeRepository.save(emp);
            }
        }
    }
}
