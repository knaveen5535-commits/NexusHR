package com.nexushr.service;

import com.nexushr.dto.AttendanceDTO;
import com.nexushr.dto.CheckInRequest;
import com.nexushr.dto.CheckOutRequest;
import com.nexushr.dto.EmployeeDTO;
import com.nexushr.entity.Attendance;
import com.nexushr.enums.AttendanceSource;
import com.nexushr.enums.AttendanceStatus;
import com.nexushr.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeClient employeeClient;

    private static final LocalTime STANDARD_CHECK_IN_TIME = LocalTime.of(9, 30);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public Attendance checkIn(CheckInRequest request) {
        LocalDate today = request.getCheckInTime().toLocalDate();
        
        // Prevent double check-in
        attendanceRepository.findByEmployeeIdAndAttendanceDate(request.getEmployeeId(), today)
                .ifPresent(a -> { throw new RuntimeException("Already checked in today"); });

        LocalTime checkInLocalTime = request.getCheckInTime().toLocalTime();
        if (checkInLocalTime.isBefore(LocalTime.of(5, 0)) || checkInLocalTime.isAfter(LocalTime.of(15, 0))) {
            throw new RuntimeException("The check-in system is only active between 05:00 AM and 03:00 PM.");
        }

        AttendanceStatus status = AttendanceStatus.PRESENT;
        if (checkInLocalTime.isAfter(STANDARD_CHECK_IN_TIME)) {
            status = AttendanceStatus.LATE;
        }

        Attendance attendance = Attendance.builder()
                .employeeId(request.getEmployeeId())
                .attendanceDate(today)
                .checkInTime(request.getCheckInTime())
                .status(status)
                .source(AttendanceSource.valueOf(request.getSource().toUpperCase()))
                .build();

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(CheckOutRequest request) {
        LocalDate today = request.getCheckOutTime().toLocalDate();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(request.getEmployeeId(), today)
                .orElseThrow(() -> new RuntimeException("No check-in record found for today"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already checked out today");
        }

        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setRemarks(request.getRemarks());

        // Calculate working hours
        Duration duration = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime());
        double hours = duration.toMinutes() / 60.0;
        attendance.setWorkingHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));

        // Overtime calculation (if > 8 hours)
        if (hours > 8.0) {
            attendance.setOvertimeHours(BigDecimal.valueOf(hours - 8.0).setScale(2, RoundingMode.HALF_UP));
        }

        return attendanceRepository.save(attendance);
    }

    public List<AttendanceDTO> getAllAttendance(LocalDate startDate, LocalDate endDate) {
        List<Attendance> records = attendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        return records.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getTeamAttendance(LocalDate startDate, LocalDate endDate) {
        List<EmployeeDTO> team = employeeClient.getTeamMembers();
        List<Long> teamIds = team.stream().map(EmployeeDTO::getId).collect(Collectors.toList());
        
        if (teamIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<Attendance> records = attendanceRepository.findByAttendanceDateBetween(startDate, endDate)
                .stream()
                .filter(a -> teamIds.contains(a.getEmployeeId()))
                .collect(Collectors.toList());
                
        return records.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> records = attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, startDate, endDate);
        return records.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private AttendanceDTO mapToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setEmployeeId(attendance.getEmployeeId());
        dto.setAttendanceDate(attendance.getAttendanceDate());
        
        if (attendance.getCheckInTime() != null) {
            dto.setCheckInTime(attendance.getCheckInTime().format(TIME_FORMATTER));
        } else {
            dto.setCheckInTime("--");
        }
        
        if (attendance.getCheckOutTime() != null) {
            dto.setCheckOutTime(attendance.getCheckOutTime().format(TIME_FORMATTER));
            if (attendance.getWorkingHours() != null) {
                int hours = attendance.getWorkingHours().intValue();
                int minutes = (int) Math.round((attendance.getWorkingHours().doubleValue() - hours) * 60);
                dto.setTotalHours(hours + "h " + minutes + "m");
            } else {
                dto.setTotalHours("--");
            }
        } else {
            dto.setCheckOutTime("--");
            dto.setTotalHours("--");
        }
        
        dto.setStatus(attendance.getStatus().name().toLowerCase());
        dto.setRemarks(attendance.getRemarks());

        // Fetch Employee Name and Details
        EmployeeDTO employee = employeeClient.getEmployeeById(attendance.getEmployeeId());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setDepartment(employee.getDepartmentName() != null ? employee.getDepartmentName() : "General");
        dto.setDesignation(employee.getDesignation() != null ? employee.getDesignation() : "Employee");

        return dto;
    }
}
