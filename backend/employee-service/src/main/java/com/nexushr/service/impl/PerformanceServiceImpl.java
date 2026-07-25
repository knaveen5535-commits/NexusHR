package com.nexushr.service.impl;

import com.nexushr.client.AttendanceClient;
import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.performance.AttendanceDTO;
import com.nexushr.dto.performance.PerformanceConfigurationDto;
import com.nexushr.dto.performance.PerformanceGenerateRequest;
import com.nexushr.dto.performance.PerformanceRecordDto;
import com.nexushr.dto.performance.PerformanceReportDto;
import com.nexushr.entity.Employee;
import com.nexushr.entity.ManagerReview;
import com.nexushr.entity.PeerFeedback;
import com.nexushr.entity.PerformanceConfiguration;
import com.nexushr.entity.PerformanceRecord;
import com.nexushr.entity.SelfReview;
import com.nexushr.enums.EmployeeStatus;
import com.nexushr.enums.Role;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.ManagerReviewRepository;
import com.nexushr.repository.PeerFeedbackRepository;
import com.nexushr.repository.PerformanceConfigurationRepository;
import com.nexushr.repository.PerformanceRecordRepository;
import com.nexushr.repository.SelfReviewRepository;
import com.nexushr.service.PerformanceService;
import com.nexushr.util.PerformanceUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceRecordRepository performanceRecordRepository;
    private final PerformanceConfigurationRepository configurationRepository;
    private final EmployeeRepository employeeRepository;
    
    private final SelfReviewRepository selfReviewRepository;
    private final PeerFeedbackRepository peerFeedbackRepository;
    private final ManagerReviewRepository managerReviewRepository;
    
    private final AttendanceClient attendanceClient;

    @Override
    public PerformanceConfigurationDto getConfiguration() {
        PerformanceConfiguration config = getOrCreateConfiguration();
        return mapToDto(config);
    }

    @Override
    @Transactional
    public PerformanceConfigurationDto updateConfiguration(PerformanceConfigurationDto request) {
        PerformanceConfiguration config = getOrCreateConfiguration();
        
        if (request.getAttendanceWeight() != null) config.setAttendanceWeight(request.getAttendanceWeight());
        if (request.getSelfWeight() != null) config.setSelfWeight(request.getSelfWeight());
        if (request.getPeerWeight() != null) config.setPeerWeight(request.getPeerWeight());
        if (request.getManagerWeight() != null) config.setManagerWeight(request.getManagerWeight());
        
        if (request.getReviewWindowStartDay() != null) config.setReviewWindowStartDay(request.getReviewWindowStartDay());
        if (request.getReviewWindowEndDay() != null) config.setReviewWindowEndDay(request.getReviewWindowEndDay());
        if (request.getMinimumAttendanceRequired() != null) config.setMinimumAttendanceRequired(request.getMinimumAttendanceRequired());
        if (request.getPerformanceEnabled() != null) config.setPerformanceEnabled(request.getPerformanceEnabled());
        
        return mapToDto(configurationRepository.save(config));
    }

    @Override
    @Transactional
    public void generateMonthlyPerformance(PerformanceGenerateRequest request, String generatedBy, String authHeader) {
        PerformanceConfiguration config = getOrCreateConfiguration();
        if (!config.getPerformanceEnabled()) {
            throw new RuntimeException("Performance generation is currently disabled in configuration.");
        }

        LocalDate now = LocalDate.now();
        YearMonth targetMonth = YearMonth.of(request.getYear(), request.getMonth());
        if (!now.isAfter(targetMonth.atEndOfMonth())) {
            throw new IllegalArgumentException("Performance can only be generated after the target month has concluded.");
        }
        
        List<Employee> allEmployees = employeeRepository.findAll().stream()
                .filter(e -> (e.getRole() == Role.EMPLOYEE || e.getRole() == Role.MANAGER) && e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.toList());
        
        for (Employee emp : allEmployees) {
            Optional<PerformanceRecord> existingRecordOpt = performanceRecordRepository
                    .findByEmployeeIdAndPerformanceYearAndPerformanceMonth(emp.getId(), request.getYear(), request.getMonth());
                    
            if (existingRecordOpt.isPresent()) {
                log.info("Performance record already generated for employee {} for {}/{}", emp.getId(), request.getMonth(), request.getYear());
                continue; // Cannot regenerate record
            }

            PerformanceRecord record = new PerformanceRecord();
            record.setEmployee(emp);
            record.setPerformanceYear(request.getYear());
            record.setPerformanceMonth(request.getMonth());
            
            // Set weights
            if (emp.getRole() == Role.MANAGER) {
                record.setAttendanceWeight(65.0);
                record.setSelfWeight(10.0);
                record.setPeerWeight(25.0);
                record.setManagerWeight(0.0);
            } else {
                record.setAttendanceWeight(config.getAttendanceWeight());
                record.setSelfWeight(config.getSelfWeight());
                record.setPeerWeight(config.getPeerWeight());
                record.setManagerWeight(config.getManagerWeight());
            }

            // 1. Attendance Score
            double attendanceScore = calculateAttendanceScore(emp.getId(), request.getYear(), request.getMonth(), authHeader);
            record.setAttendanceScore(attendanceScore);
            record.setAttendanceAvailable(attendanceScore > 0);

            // 2. Self Review
            Optional<SelfReview> selfReview = selfReviewRepository.findByRevieweeIdAndReviewYearAndReviewMonthAndDeletedFalse(emp.getId(), request.getYear(), request.getMonth());
            if (selfReview.isPresent()) {
                record.setSelfReviewScore(PerformanceUtil.normalizeRatingToPercentage(selfReview.get().getOverallRating()));
                record.setSelfReviewSubmitted(true);
            } else {
                record.setSelfReviewScore(0.0);
                record.setSelfReviewSubmitted(false);
            }

            // 3. Peer Feedback (average)
            List<PeerFeedback> peerFeedbacks = peerFeedbackRepository.findByRevieweeIdAndReviewYearAndReviewMonthAndDeletedFalse(emp.getId(), request.getYear(), request.getMonth());
            if (!peerFeedbacks.isEmpty()) {
                double avgPeer = peerFeedbacks.stream()
                        .mapToInt(f -> f.getOverallRating() != null ? f.getOverallRating() : 0)
                        .average().orElse(0.0);
                record.setPeerReviewScore(PerformanceUtil.normalizeRatingToPercentage((int) Math.round(avgPeer)));
                record.setPeerReviewSubmitted(true);
            } else {
                record.setPeerReviewScore(0.0);
                record.setPeerReviewSubmitted(false);
            }

            // 4. Manager Review
            Optional<ManagerReview> managerReview = managerReviewRepository.findByRevieweeIdAndReviewYearAndReviewMonthAndDeletedFalse(emp.getId(), request.getYear(), request.getMonth());
            if (managerReview.isPresent()) {
                record.setManagerReviewScore(PerformanceUtil.normalizeRatingToPercentage(managerReview.get().getOverallRating()));
                record.setManagerReviewSubmitted(true);
            } else {
                record.setManagerReviewScore(0.0);
                record.setManagerReviewSubmitted(false);
            }

            // Calculate final score
            double finalScore = (record.getAttendanceScore() * record.getAttendanceWeight() / 100.0) +
                                (record.getSelfReviewScore() * record.getSelfWeight() / 100.0) +
                                (record.getPeerReviewScore() * record.getPeerWeight() / 100.0) +
                                (record.getManagerReviewScore() * record.getManagerWeight() / 100.0);
                                
            record.setFinalScore(Math.round(finalScore * 100.0) / 100.0); // round to 2 decimals
            record.setGrade(PerformanceUtil.calculateGrade(record.getFinalScore()));
            
            // Determine remarks
            StringBuilder remarks = new StringBuilder();
            if (record.getManagerWeight() > 0 && !record.isManagerReviewSubmitted()) remarks.append("Manager review missing. ");
            if (record.getSelfWeight() > 0 && !record.isSelfReviewSubmitted()) remarks.append("Self review missing. ");
            if (record.getPeerWeight() > 0 && !record.isPeerReviewSubmitted()) remarks.append("Peer review missing. ");
            if (record.getAttendanceWeight() > 0 && !record.isAttendanceAvailable()) remarks.append("Attendance data missing/zero. ");
            record.setRemarks(remarks.toString().trim());

            record.setGeneratedBy(generatedBy);
            record.setGeneratedAt(LocalDateTime.now());
            
            performanceRecordRepository.save(record);
        }
    }

    private double calculateAttendanceScore(Long employeeId, int year, int month, String authHeader) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<AttendanceDTO> attendances = attendanceClient.getEmployeeAttendance(employeeId, startDate, endDate, authHeader);
        if (attendances == null || attendances.isEmpty()) {
            return 0.0;
        }
        
        // Count working days in the month (Mon-Fri) up to today
        LocalDate calcEndDate = endDate;
        if (yearMonth.equals(YearMonth.now())) {
            calcEndDate = LocalDate.now();
        }
        
        long workingDays = 0;
        LocalDate current = startDate;
        while (!current.isAfter(calcEndDate)) {
            if (current.getDayOfWeek().getValue() < 6) { // 1 = Monday, 5 = Friday
                workingDays++;
            }
            current = current.plusDays(1);
        }
        
        long presentDays = attendances.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()) || "LATE".equalsIgnoreCase(a.getStatus()) || "HALFDAY".equalsIgnoreCase(a.getStatus()))
                .count();
                
        double score = workingDays > 0 ? (double) presentDays / workingDays * 100.0 : 0.0;
        return Math.min(score, 100.0);
    }

    @Override
    @Transactional
    public void publishPerformance(PerformanceGenerateRequest request) {
        List<PerformanceRecord> records = performanceRecordRepository.findByPerformanceYearAndPerformanceMonth(request.getYear(), request.getMonth());
        records.forEach(r -> {
            r.setPublished(true);
            r.setLocked(true);
        });
        performanceRecordRepository.saveAll(records);
        
        List<SelfReview> selfReviews = selfReviewRepository.findByReviewYearAndReviewMonthAndDeletedFalse(request.getYear(), request.getMonth());
        selfReviews.forEach(r -> r.setStatus(com.nexushr.enums.FeedbackStatus.LOCKED));
        selfReviewRepository.saveAll(selfReviews);

        List<PeerFeedback> peerFeedbacks = peerFeedbackRepository.findByReviewYearAndReviewMonthAndDeletedFalse(request.getYear(), request.getMonth());
        peerFeedbacks.forEach(r -> r.setStatus(com.nexushr.enums.FeedbackStatus.LOCKED));
        peerFeedbackRepository.saveAll(peerFeedbacks);

        List<ManagerReview> managerReviews = managerReviewRepository.findByReviewYearAndReviewMonthAndDeletedFalse(request.getYear(), request.getMonth());
        managerReviews.forEach(r -> r.setStatus(com.nexushr.enums.FeedbackStatus.LOCKED));
        managerReviewRepository.saveAll(managerReviews);
    }

    @Override
    public PerformanceRecordDto getMyPerformance(Long employeeId, Integer year, Integer month, boolean requirePublished) {
        return performanceRecordRepository.findByEmployeeIdAndPerformanceYearAndPerformanceMonth(employeeId, year, month)
                .filter(r -> !requirePublished || r.isPublished())
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Performance record not found"));
    }

    @Override
    public List<PerformanceRecordDto> getMyPerformanceHistory(Long employeeId, boolean requirePublished) {
        return performanceRecordRepository.findByEmployeeIdOrderByPerformanceYearDescPerformanceMonthDesc(employeeId)
                .stream()
                .filter(r -> !requirePublished || r.isPublished())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PerformanceRecordDto> getTeamPerformance(Long managerId, Integer year, Integer month, boolean requirePublished) {
        // Find direct reports for this manager
        List<Employee> team = employeeRepository.findByManagerId(managerId);
        List<Long> teamIds = team.stream().map(Employee::getId).collect(Collectors.toList());
        
        return performanceRecordRepository.findByPerformanceYearAndPerformanceMonth(year, month)
                .stream()
                .filter(r -> teamIds.contains(r.getEmployee().getId()))
                .filter(r -> !requirePublished || r.isPublished())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PerformanceRecordDto> getAllPerformance(Integer year, Integer month) {
        return performanceRecordRepository.findByPerformanceYearAndPerformanceMonth(year, month)
                .stream()
                .filter(r -> r.getEmployee() != null && (r.getEmployee().getRole() == Role.EMPLOYEE || r.getEmployee().getRole() == Role.MANAGER))
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public PerformanceReportDto getPerformanceReport(Integer year, Integer month) {
        List<PerformanceRecord> records = performanceRecordRepository.findByPerformanceYearAndPerformanceMonth(year, month)
                .stream()
                .filter(r -> r.getEmployee() != null && (r.getEmployee().getRole() == Role.EMPLOYEE || r.getEmployee().getRole() == Role.MANAGER))
                .collect(Collectors.toList());
        
        int totalEmployees = employeeRepository.findAll().size(); // Or active only
        int generatedCount = records.size();
        
        int outstanding = 0, excellent = 0, veryGood = 0, good = 0, average = 0, needsImprovement = 0;
        double sumScore = 0;
        
        for (PerformanceRecord r : records) {
            sumScore += r.getFinalScore() != null ? r.getFinalScore() : 0;
            String grade = r.getGrade();
            if ("Outstanding".equals(grade)) outstanding++;
            else if ("Excellent".equals(grade)) excellent++;
            else if ("Very Good".equals(grade)) veryGood++;
            else if ("Good".equals(grade)) good++;
            else if ("Average".equals(grade)) average++;
            else needsImprovement++;
        }
        
        List<PerformanceRecord> employees = records.stream().filter(r -> r.getEmployee() != null && r.getEmployee().getRole() == Role.EMPLOYEE).collect(Collectors.toList());
        List<PerformanceRecord> managers = records.stream().filter(r -> r.getEmployee() != null && r.getEmployee().getRole() == Role.MANAGER).collect(Collectors.toList());
        
        List<PerformanceRecord> topEmp = employees.stream()
                .filter(r -> r.getFinalScore() != null && r.getFinalScore() >= 40.0)
                .sorted((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()))
                .limit(5)
                .collect(Collectors.toList());
                
        if (topEmp.isEmpty() && !employees.isEmpty()) {
            topEmp = employees.stream()
                .filter(r -> r.getFinalScore() != null)
                .sorted((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()))
                .limit(1)
                .collect(Collectors.toList());
        }
        
        List<PerformanceRecord> topMgr = managers.stream()
                .filter(r -> r.getFinalScore() != null && r.getFinalScore() >= 40.0)
                .sorted((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()))
                .limit(5)
                .collect(Collectors.toList());
                
        if (topMgr.isEmpty() && !managers.isEmpty()) {
            topMgr = managers.stream()
                .filter(r -> r.getFinalScore() != null)
                .sorted((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()))
                .limit(1)
                .collect(Collectors.toList());
        }
        
        List<PerformanceRecordDto> top = new java.util.ArrayList<>();
        topEmp.forEach(r -> top.add(this.mapToDto(r)));
        topMgr.forEach(r -> top.add(this.mapToDto(r)));
                
        List<PerformanceRecordDto> lowest = records.stream()
                .filter(r -> r.getFinalScore() != null)
                .sorted((a, b) -> Double.compare(a.getFinalScore() != null ? a.getFinalScore() : 0, b.getFinalScore() != null ? b.getFinalScore() : 0))
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PerformanceReportDto.builder()
                .totalEmployees(totalEmployees)
                .generatedCount(generatedCount)
                .outstandingCount(outstanding)
                .excellentCount(excellent)
                .veryGoodCount(veryGood)
                .goodCount(good)
                .averageCount(average)
                .needsImprovementCount(needsImprovement)
                .averageOverallScore(generatedCount > 0 ? sumScore / generatedCount : 0)
                .topPerformers(top)
                .lowestPerformers(lowest)
                .build();
    }

    private PerformanceConfiguration getOrCreateConfiguration() {
        List<PerformanceConfiguration> configs = configurationRepository.findAll();
        if (configs.isEmpty()) {
            return configurationRepository.save(new PerformanceConfiguration());
        }
        return configs.get(0);
    }
    
    private PerformanceConfigurationDto mapToDto(PerformanceConfiguration entity) {
        return PerformanceConfigurationDto.builder()
                .id(entity.getId())
                .attendanceWeight(entity.getAttendanceWeight())
                .selfWeight(entity.getSelfWeight())
                .peerWeight(entity.getPeerWeight())
                .managerWeight(entity.getManagerWeight())
                .reviewWindowStartDay(entity.getReviewWindowStartDay())
                .reviewWindowEndDay(entity.getReviewWindowEndDay())
                .minimumAttendanceRequired(entity.getMinimumAttendanceRequired())
                .performanceEnabled(entity.getPerformanceEnabled())
                .build();
    }
    
    private PerformanceRecordDto mapToDto(PerformanceRecord entity) {
        EmployeeResponse employeeResponse = new EmployeeResponse();
        if (entity.getEmployee() != null) {
            employeeResponse.setId(entity.getEmployee().getId());
            employeeResponse.setFirstName(entity.getEmployee().getFirstName());
            employeeResponse.setLastName(entity.getEmployee().getLastName());
            employeeResponse.setEmail(entity.getEmployee().getEmail());
            if (entity.getEmployee().getDepartment() != null) {
                employeeResponse.setDepartmentName(entity.getEmployee().getDepartment().getDepartmentName());
            }
            employeeResponse.setRole(entity.getEmployee().getRole());
            if (entity.getEmployee().getManager() != null) {
                employeeResponse.setManagerName(entity.getEmployee().getManager().getFirstName() + " " + entity.getEmployee().getManager().getLastName());
            }
        }

        return PerformanceRecordDto.builder()
                .id(entity.getId())
                .employee(employeeResponse)
                .performanceYear(entity.getPerformanceYear())
                .performanceMonth(entity.getPerformanceMonth())
                .attendanceScore(entity.getAttendanceScore())
                .selfReviewScore(entity.getSelfReviewScore())
                .peerReviewScore(entity.getPeerReviewScore())
                .managerReviewScore(entity.getManagerReviewScore())
                .attendanceWeight(entity.getAttendanceWeight())
                .selfWeight(entity.getSelfWeight())
                .peerWeight(entity.getPeerWeight())
                .managerWeight(entity.getManagerWeight())
                .finalScore(entity.getFinalScore())
                .grade(entity.getGrade())
                .remarks(entity.getRemarks())
                .generatedBy(entity.getGeneratedBy())
                .generatedAt(entity.getGeneratedAt())
                .published(entity.isPublished())
                .locked(entity.isLocked())
                .managerReviewSubmitted(entity.isManagerReviewSubmitted())
                .peerReviewSubmitted(entity.isPeerReviewSubmitted())
                .selfReviewSubmitted(entity.isSelfReviewSubmitted())
                .attendanceAvailable(entity.isAttendanceAvailable())
                .build();
    }
}
