package com.nexushr.service;

import com.nexushr.dto.ApproveResignationRequest;
import com.nexushr.dto.ResignationRequest;
import com.nexushr.dto.ResignationResponse;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Resignation;
import com.nexushr.enums.EmployeeStatus;
import com.nexushr.enums.ResignationStatus;
import com.nexushr.exception.EmployeeNotFoundException;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.ResignationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResignationService {

    private final ResignationRepository resignationRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    public ResignationService(ResignationRepository resignationRepository,
                              EmployeeRepository employeeRepository,
                              JwtService jwtService) {
        this.resignationRepository = resignationRepository;
        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
    }

    private Employee getEmployeeFromAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Logged in user not found"));
    }

    private ResignationResponse mapToResponse(Resignation resignation) {
        return new ResignationResponse(
                resignation.getId(),
                resignation.getEmployee().getId(),
                resignation.getEmployee().getFirstName() + " " + resignation.getEmployee().getLastName(),
                resignation.getEmployee().getEmployeeCode(),
                resignation.getEmployee().getDepartment().getDepartmentName(),
                resignation.getReason(),
                resignation.getExpectedLeaveDate(),
                resignation.getApprovedLeaveDate(),
                resignation.getStatus(),
                resignation.getCreatedAt()
        );
    }

    public ResignationResponse submitResignation(ResignationRequest request, String authHeader) {
        Employee employee = getEmployeeFromAuth(authHeader);

        if (resignationRepository.existsByEmployeeIdAndStatus(employee.getId(), ResignationStatus.PENDING)) {
            throw new IllegalArgumentException("You already have a pending resignation request.");
        }

        Resignation resignation = new Resignation();
        resignation.setEmployee(employee);
        resignation.setReason(request.getReason());
        resignation.setExpectedLeaveDate(request.getExpectedLeaveDate());
        resignation.setStatus(ResignationStatus.PENDING);

        Resignation saved = resignationRepository.save(resignation);
        return mapToResponse(saved);
    }

    public List<ResignationResponse> getMyResignations(String authHeader) {
        Employee employee = getEmployeeFromAuth(authHeader);
        return resignationRepository.findByEmployeeId(employee.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResignationResponse> getAllResignations() {
        return resignationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResignationResponse approveResignation(Long id, ApproveResignationRequest request) {
        Resignation resignation = resignationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resignation not found"));

        if (resignation.getStatus() != ResignationStatus.PENDING) {
            throw new IllegalArgumentException("Resignation is not in PENDING state");
        }

        resignation.setStatus(ResignationStatus.APPROVED);
        resignation.setApprovedLeaveDate(request.getApprovedLeaveDate());
        Resignation saved = resignationRepository.save(resignation);

        Employee employee = resignation.getEmployee();
        employee.setLeaveDate(request.getApprovedLeaveDate());
        // Status stays ACTIVE until the leave date arrives (handled by a scheduled task)
        employeeRepository.save(employee);

        return mapToResponse(saved);
    }

    public ResignationResponse rejectResignation(Long id) {
        Resignation resignation = resignationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resignation not found"));

        if (resignation.getStatus() != ResignationStatus.PENDING) {
            throw new IllegalArgumentException("Resignation is not in PENDING state");
        }

        resignation.setStatus(ResignationStatus.REJECTED);
        Resignation saved = resignationRepository.save(resignation);

        return mapToResponse(saved);
    }
}
