package com.nexushr.service;

import com.nexushr.dto.*;
import com.nexushr.entity.*;
import com.nexushr.enums.LeaveAction;
import com.nexushr.enums.LeaveStatus;
import com.nexushr.enums.Role;
import com.nexushr.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveApprovalHistoryRepository leaveApprovalHistoryRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        LeaveTypeRepository leaveTypeRepository,
                        LeaveApprovalHistoryRepository leaveApprovalHistoryRepository,
                        EmployeeRepository employeeRepository,
                        JwtService jwtService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveApprovalHistoryRepository = leaveApprovalHistoryRepository;
        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
    }

    private Employee getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public BigDecimal calculateLeaveDays(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
        
        long days = 0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                days++;
            }
            current = current.plusDays(1);
        }
        return new BigDecimal(days);
    }

    private void checkOverlappingLeave(Long employeeId, LocalDate startDate, LocalDate endDate, Long currentRequestId) {
        List<LeaveRequest> existingRequests = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        for (LeaveRequest req : existingRequests) {
            if (req.getStatus() == LeaveStatus.CANCELLED || req.getStatus() == LeaveStatus.REJECTED) {
                continue;
            }
            if (currentRequestId != null && req.getId().equals(currentRequestId)) {
                continue; // Skip the request being updated
            }
            
            if ((startDate.isBefore(req.getEndDate()) || startDate.isEqual(req.getEndDate())) &&
                (endDate.isAfter(req.getStartDate()) || endDate.isEqual(req.getStartDate()))) {
                throw new IllegalArgumentException("Leave request overlaps with an existing request from " 
                    + req.getStartDate() + " to " + req.getEndDate());
            }
        }
    }

    @Transactional
    public LeaveRequestDto submitLeaveRequest(LeaveRequestSubmitDto requestDto, String authHeader) {
        Employee employee = getCurrentUser(authHeader);
        
        if (requestDto.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        BigDecimal requestedDays = calculateLeaveDays(requestDto.getStartDate(), requestDto.getEndDate());
        if (requestedDays.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Requested leave dates do not contain any working days");
        }

        checkOverlappingLeave(employee.getId(), requestDto.getStartDate(), requestDto.getEndDate(), null);

        LeaveType leaveType = leaveTypeRepository.findById(requestDto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        int currentYear = requestDto.getStartDate().getYear();
        
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveType.getId(), currentYear)
                .orElseGet(() -> initializeLeaveBalance(employee, leaveType, currentYear));

        if (balance.getRemainingDays().compareTo(requestedDays) < 0) {
            throw new IllegalArgumentException("Insufficient leave balance. Requested: " + requestedDays + ", Remaining: " + balance.getRemainingDays());
        }

        // Create Request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(requestDto.getStartDate());
        leaveRequest.setEndDate(requestDto.getEndDate());
        leaveRequest.setNumberOfDays(requestedDays);
        leaveRequest.setReason(requestDto.getReason());
        leaveRequest.setAttachmentUrl(requestDto.getAttachmentUrl());
        leaveRequest.setEmergencyContact(requestDto.getEmergencyContact());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update Balance
        balance.setPendingDays(balance.getPendingDays().add(requestedDays));
        leaveBalanceRepository.save(balance);

        // Add History
        addApprovalHistory(leaveRequest, employee, LeaveAction.SUBMITTED, "Leave request submitted");

        return mapToDto(leaveRequest);
    }

    @Transactional
    public LeaveBalance initializeLeaveBalance(Employee employee, LeaveType leaveType, int year) {
        LeaveBalance balance = new LeaveBalance();
        balance.setEmployee(employee);
        balance.setLeaveType(leaveType);
        balance.setYear(year);
        balance.setTotalDays(leaveType.getDefaultDays());
        balance.setRemainingDays(leaveType.getDefaultDays());
        return leaveBalanceRepository.save(balance);
    }

    @Transactional
    public LeaveRequestDto editLeaveRequest(Long id, LeaveRequestSubmitDto requestDto, String authHeader) {
        Employee employee = getCurrentUser(authHeader);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException("Not authorized to edit this request");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be edited");
        }

        if (requestDto.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        BigDecimal newRequestedDays = calculateLeaveDays(requestDto.getStartDate(), requestDto.getEndDate());
        if (newRequestedDays.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Requested leave dates do not contain any working days");
        }

        checkOverlappingLeave(employee.getId(), requestDto.getStartDate(), requestDto.getEndDate(), id);

        LeaveType newLeaveType = leaveTypeRepository.findById(requestDto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        int currentYear = requestDto.getStartDate().getYear();

        // Revert old balance
        LeaveBalance oldBalance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employee.getId(), leaveRequest.getLeaveType().getId(), leaveRequest.getStartDate().getYear())
                .orElseThrow(() -> new RuntimeException("Old balance not found"));
        
        oldBalance.setPendingDays(oldBalance.getPendingDays().subtract(leaveRequest.getNumberOfDays()));
        leaveBalanceRepository.save(oldBalance);

        // Apply new balance
        LeaveBalance newBalance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employee.getId(), newLeaveType.getId(), currentYear)
                .orElseGet(() -> initializeLeaveBalance(employee, newLeaveType, currentYear));
                
        if (newBalance.getRemainingDays().compareTo(newRequestedDays) < 0) {
            throw new IllegalArgumentException("Insufficient leave balance");
        }
        
        newBalance.setPendingDays(newBalance.getPendingDays().add(newRequestedDays));
        leaveBalanceRepository.save(newBalance);

        leaveRequest.setLeaveType(newLeaveType);
        leaveRequest.setStartDate(requestDto.getStartDate());
        leaveRequest.setEndDate(requestDto.getEndDate());
        leaveRequest.setNumberOfDays(newRequestedDays);
        leaveRequest.setReason(requestDto.getReason());
        leaveRequest.setAttachmentUrl(requestDto.getAttachmentUrl());
        leaveRequest.setEmergencyContact(requestDto.getEmergencyContact());

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        
        addApprovalHistory(leaveRequest, employee, LeaveAction.SUBMITTED, "Leave request edited");

        return mapToDto(leaveRequest);
    }

    @Transactional
    public LeaveRequestDto cancelLeaveRequest(Long id, String authHeader) {
        Employee employee = getCurrentUser(authHeader);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException("Not authorized to cancel this request");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be cancelled");
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Restore pending balance
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employee.getId(), leaveRequest.getLeaveType().getId(), leaveRequest.getStartDate().getYear())
                .orElseThrow(() -> new RuntimeException("Balance not found"));
        
        balance.setPendingDays(balance.getPendingDays().subtract(leaveRequest.getNumberOfDays()));
        leaveBalanceRepository.save(balance);

        addApprovalHistory(leaveRequest, employee, LeaveAction.CANCELLED, "Leave request cancelled by employee");

        return mapToDto(leaveRequest);
    }

    @Transactional
    public LeaveRequestDto approveLeaveRequest(Long id, LeaveApprovalDto approvalDto, String authHeader) {
        Employee actionUser = getCurrentUser(authHeader);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled request cannot be approved");
        }

        boolean isManager = leaveRequest.getEmployee().getManager() != null && 
                            leaveRequest.getEmployee().getManager().getId().equals(actionUser.getId());
        boolean isHrOrAdmin = actionUser.getRole() == Role.HR || actionUser.getRole() == Role.ADMIN;

        if (!isManager && !isHrOrAdmin) {
            throw new RuntimeException("Not authorized to approve this request");
        }

        LeaveAction actionTaken = LeaveAction.APPROVED;
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED || leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            if (isHrOrAdmin) {
                actionTaken = LeaveAction.OVERRIDDEN;
            } else {
                throw new IllegalArgumentException("Request already processed. Only HR/Admin can override.");
            }
        }

        LeaveStatus oldStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update Balances
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId(), leaveRequest.getStartDate().getYear())
                .orElseThrow(() -> new RuntimeException("Balance not found"));

        if (oldStatus == LeaveStatus.PENDING) {
            balance.setPendingDays(balance.getPendingDays().subtract(leaveRequest.getNumberOfDays()));
            balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getNumberOfDays()));
            balance.setRemainingDays(balance.getTotalDays().subtract(balance.getUsedDays()));
        } else if (oldStatus == LeaveStatus.REJECTED) {
            balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getNumberOfDays()));
            balance.setRemainingDays(balance.getTotalDays().subtract(balance.getUsedDays()));
        }
        
        leaveBalanceRepository.save(balance);

        addApprovalHistory(leaveRequest, actionUser, actionTaken, approvalDto.getComments());
        
        // TODO: Notification logic

        return mapToDto(leaveRequest);
    }

    @Transactional
    public LeaveRequestDto rejectLeaveRequest(Long id, LeaveApprovalDto approvalDto, String authHeader) {
        Employee actionUser = getCurrentUser(authHeader);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled request cannot be rejected");
        }

        boolean isManager = leaveRequest.getEmployee().getManager() != null && 
                            leaveRequest.getEmployee().getManager().getId().equals(actionUser.getId());
        boolean isHrOrAdmin = actionUser.getRole() == Role.HR || actionUser.getRole() == Role.ADMIN;

        if (!isManager && !isHrOrAdmin) {
            throw new RuntimeException("Not authorized to reject this request");
        }

        LeaveAction actionTaken = LeaveAction.REJECTED;
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED || leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            if (isHrOrAdmin) {
                actionTaken = LeaveAction.OVERRIDDEN;
            } else {
                throw new IllegalArgumentException("Request already processed. Only HR/Admin can override.");
            }
        }

        LeaveStatus oldStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update Balances
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId(), leaveRequest.getStartDate().getYear())
                .orElseThrow(() -> new RuntimeException("Balance not found"));

        if (oldStatus == LeaveStatus.PENDING) {
            balance.setPendingDays(balance.getPendingDays().subtract(leaveRequest.getNumberOfDays()));
        } else if (oldStatus == LeaveStatus.APPROVED) {
            balance.setUsedDays(balance.getUsedDays().subtract(leaveRequest.getNumberOfDays()));
            balance.setRemainingDays(balance.getTotalDays().subtract(balance.getUsedDays()));
        }
        
        leaveBalanceRepository.save(balance);

        addApprovalHistory(leaveRequest, actionUser, actionTaken, approvalDto.getComments());

        // TODO: Notification logic
        
        return mapToDto(leaveRequest);
    }

    public List<LeaveRequestDto> getMyRequests(String authHeader) {
        Employee employee = getCurrentUser(authHeader);
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveBalanceDto> getMyBalances(String authHeader, int year) {
        Employee employee = getCurrentUser(authHeader);
        
        // Ensure default types exist in balance
        List<LeaveType> allTypes = leaveTypeRepository.findAll();
        for(LeaveType type : allTypes) {
            leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), type.getId(), year)
                .orElseGet(() -> initializeLeaveBalance(employee, type, year));
        }
        
        return leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), year)
                .stream().map(this::mapBalanceToDto).collect(Collectors.toList());
    }

    public List<LeaveBalanceDto> getEmployeeBalances(Long employeeId, String authHeader, int year) {
        Employee actionUser = getCurrentUser(authHeader);
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        
        boolean isManager = employee.getManager() != null && employee.getManager().getId().equals(actionUser.getId());
        boolean isHrOrAdmin = actionUser.getRole() == Role.HR || actionUser.getRole() == Role.ADMIN;
        boolean isSelf = employee.getId().equals(actionUser.getId());
        
        if (!isSelf && !isManager && !isHrOrAdmin) {
            throw new RuntimeException("Not authorized to view balances for this employee");
        }
        
        // Ensure default types exist in balance
        List<LeaveType> allTypes = leaveTypeRepository.findAll();
        for(LeaveType type : allTypes) {
            leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), type.getId(), year)
                .orElseGet(() -> initializeLeaveBalance(employee, type, year));
        }
        
        return leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), year)
                .stream().map(this::mapBalanceToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getTeamRequests(String authHeader) {
        Employee manager = getCurrentUser(authHeader);
        return leaveRequestRepository.findByManagerIdOrderByCreatedAtDesc(manager.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getAllRequests(String authHeader) {
        Employee adminHr = getCurrentUser(authHeader);
        if (adminHr.getRole() != Role.HR && adminHr.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not authorized to view all requests");
        }
        return leaveRequestRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto).collect(Collectors.toList());
    }

    private void addApprovalHistory(LeaveRequest leaveRequest, Employee user, LeaveAction action, String comments) {
        LeaveApprovalHistory history = new LeaveApprovalHistory();
        history.setLeaveRequest(leaveRequest);
        history.setActionByUserId(user.getId());
        history.setActionByUserName(user.getFirstName() + " " + user.getLastName());
        history.setActionByRole(user.getRole().name());
        history.setAction(action);
        history.setComments(comments);
        history.setActionDate(LocalDateTime.now());
        leaveApprovalHistoryRepository.save(history);
    }

    private LeaveRequestDto mapToDto(LeaveRequest entity) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployee().getId());
        dto.setEmployeeName(entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName());
        dto.setDepartmentName(entity.getEmployee().getDepartment() != null ? entity.getEmployee().getDepartment().getDepartmentName() : "");
        dto.setDesignationName(entity.getEmployee().getDesignation() != null ? entity.getEmployee().getDesignation().getDesignationName() : "");
        
        if (entity.getEmployee().getManager() != null) {
            dto.setManagerId(entity.getEmployee().getManager().getId());
            dto.setManagerName(entity.getEmployee().getManager().getFirstName() + " " + entity.getEmployee().getManager().getLastName());
        }
        
        dto.setLeaveType(mapLeaveTypeToDto(entity.getLeaveType()));
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setNumberOfDays(entity.getNumberOfDays());
        dto.setReason(entity.getReason());
        dto.setAttachmentUrl(entity.getAttachmentUrl());
        dto.setEmergencyContact(entity.getEmergencyContact());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        List<LeaveApprovalHistory> histories = leaveApprovalHistoryRepository.findByLeaveRequestIdOrderByActionDateAsc(entity.getId());
        dto.setApprovalHistories(histories.stream().map(h -> {
            LeaveApprovalHistoryDto hdto = new LeaveApprovalHistoryDto();
            hdto.setId(h.getId());
            hdto.setActionByUserId(h.getActionByUserId());
            hdto.setActionByUserName(h.getActionByUserName());
            hdto.setActionByRole(h.getActionByRole());
            hdto.setAction(h.getAction());
            hdto.setComments(h.getComments());
            hdto.setActionDate(h.getActionDate());
            return hdto;
        }).collect(Collectors.toList()));
        
        return dto;
    }

    private LeaveTypeDto mapLeaveTypeToDto(LeaveType entity) {
        LeaveTypeDto dto = new LeaveTypeDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDefaultDays(entity.getDefaultDays());
        return dto;
    }

    private LeaveBalanceDto mapBalanceToDto(LeaveBalance entity) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setId(entity.getId());
        dto.setLeaveType(mapLeaveTypeToDto(entity.getLeaveType()));
        dto.setTotalDays(entity.getTotalDays());
        dto.setUsedDays(entity.getUsedDays());
        dto.setPendingDays(entity.getPendingDays());
        dto.setRemainingDays(entity.getRemainingDays());
        dto.setYear(entity.getYear());
        return dto;
    }
}
