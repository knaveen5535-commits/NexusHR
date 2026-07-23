package com.nexushr.scheduler;

import com.nexushr.dto.EmployeeDTO;
import com.nexushr.entity.Attendance;
import com.nexushr.enums.AttendanceSource;
import com.nexushr.enums.AttendanceStatus;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.service.EmployeeClient;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AttendanceScheduler {

    private final AttendanceRepository attendanceRepository;
    private final com.nexushr.repository.SalaryStructureRepository salaryStructureRepository;

    /**
     * Runs every weekday (Monday to Friday) at exactly 15:00 (3:00 PM) IST.
     * Checks all active employees. If they have not checked in yet today,
     * an explicit ABSENT record is inserted for them.
     */
    @Scheduled(cron = "0 0 15 * * MON-FRI", zone = "Asia/Kolkata")
    public void markAbsentForMissingCheckIns() {
        System.out.println("Running 3:00 PM automated Attendance Check...");
        LocalDate today = LocalDate.now();
        
        try {
            // Get all employee IDs who have an active salary structure
            List<com.nexushr.entity.SalaryStructure> activeStructures = salaryStructureRepository.findAll().stream()
                .filter(s -> s.getIsActive() != null && s.getIsActive())
                .toList();

            int absentMarked = 0;

            for (com.nexushr.entity.SalaryStructure structure : activeStructures) {
                Long empId = structure.getEmployeeId();
                
                // Check if they already have an attendance record for today
                Optional<Attendance> existingRecord = attendanceRepository.findByEmployeeIdAndAttendanceDate(empId, today);
                
                if (existingRecord.isEmpty()) {
                    // They haven't checked in by 3:00 PM. Mark them ABSENT.
                    Attendance absentRecord = new Attendance();
                    absentRecord.setEmployeeId(empId);
                    absentRecord.setAttendanceDate(today);
                    absentRecord.setStatus(AttendanceStatus.ABSENT);
                    absentRecord.setWorkingHours(BigDecimal.ZERO);
                    absentRecord.setRemarks("System Auto-Marked Absent (No check-in by 3:00 PM)");
                    absentRecord.setSource(AttendanceSource.SYSTEM);
                    
                    attendanceRepository.save(absentRecord);
                    absentMarked++;
                }
            }
            
            System.out.println("Successfully marked " + absentMarked + " employees as ABSENT for " + today);
            
        } catch (Exception e) {
            System.err.println("Failed to run attendance scheduler: " + e.getMessage());
        }
    }
}
