package com.nexushr.config;

import com.nexushr.entity.Employee;
import com.nexushr.entity.LeaveType;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveBalanceRepository;
import com.nexushr.repository.LeaveTypeRepository;
import com.nexushr.service.LeaveService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class LeaveDataSeeder {

    @Bean
    public CommandLineRunner initLeaveData(
            LeaveTypeRepository leaveTypeRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            EmployeeRepository employeeRepository,
            LeaveService leaveService) {
        return args -> {
            // Ensure default leave types exist
            if (leaveTypeRepository.count() == 0) {
                LeaveType annual = new LeaveType();
                annual.setName("Annual");
                annual.setDescription("Annual Paid Leave");
                annual.setDefaultDays(new BigDecimal("20"));
                leaveTypeRepository.save(annual);

                LeaveType sick = new LeaveType();
                sick.setName("Sick");
                sick.setDescription("Sick Leave");
                sick.setDefaultDays(new BigDecimal("10"));
                leaveTypeRepository.save(sick);

                LeaveType personal = new LeaveType();
                personal.setName("Personal");
                personal.setDescription("Personal Leave");
                personal.setDefaultDays(new BigDecimal("5"));
                leaveTypeRepository.save(personal);
            }

            // Ensure all existing employees have leave balances for the current year
            int currentYear = LocalDate.now().getYear();
            List<LeaveType> allTypes = leaveTypeRepository.findAll();
            List<Employee> allEmployees = employeeRepository.findAll();

            for (Employee employee : allEmployees) {
                for (LeaveType type : allTypes) {
                    leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), type.getId(), currentYear)
                            .orElseGet(() -> leaveService.initializeLeaveBalance(employee, type, currentYear));
                }
            }
        };
    }
}
