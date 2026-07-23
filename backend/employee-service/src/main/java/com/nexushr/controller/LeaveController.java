package com.nexushr.controller;

import com.nexushr.dto.LeaveApprovalDto;
import com.nexushr.dto.LeaveBalanceDto;
import com.nexushr.dto.LeaveRequestDto;
import com.nexushr.dto.LeaveRequestSubmitDto;
import com.nexushr.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employees/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDto> submitLeaveRequest(
            @Valid @RequestBody LeaveRequestSubmitDto requestDto,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.submitLeaveRequest(requestDto, authHeader));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequestDto> editLeaveRequest(
            @PathVariable Long id,
            @Valid @RequestBody LeaveRequestSubmitDto requestDto,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.editLeaveRequest(id, requestDto, authHeader));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<LeaveRequestDto> cancelLeaveRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.cancelLeaveRequest(id, authHeader));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestDto> approveLeaveRequest(
            @PathVariable Long id,
            @RequestBody LeaveApprovalDto approvalDto,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id, approvalDto, authHeader));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<LeaveRequestDto> rejectLeaveRequest(
            @PathVariable Long id,
            @RequestBody LeaveApprovalDto approvalDto,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.rejectLeaveRequest(id, approvalDto, authHeader));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<LeaveRequestDto>> getMyRequests(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.getMyRequests(authHeader));
    }

    @GetMapping("/my-balances")
    public ResponseEntity<List<LeaveBalanceDto>> getMyBalances(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer year) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(leaveService.getMyBalances(authHeader, year));
    }

    @GetMapping("/employee/{employeeId}/balances")
    public ResponseEntity<List<LeaveBalanceDto>> getEmployeeBalances(
            @PathVariable Long employeeId,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer year) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(leaveService.getEmployeeBalances(employeeId, authHeader, year));
    }

    @GetMapping("/team")
    public ResponseEntity<List<LeaveRequestDto>> getTeamRequests(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.getTeamRequests(authHeader));
    }

    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequestDto>> getAllRequests(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(leaveService.getAllRequests(authHeader));
    }
}
