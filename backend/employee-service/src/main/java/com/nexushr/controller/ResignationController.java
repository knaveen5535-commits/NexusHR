package com.nexushr.controller;

import com.nexushr.dto.ApproveResignationRequest;
import com.nexushr.dto.ResignationRequest;
import com.nexushr.dto.ResignationResponse;
import com.nexushr.service.ResignationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resignations")
public class ResignationController {

    private final ResignationService resignationService;

    public ResignationController(ResignationService resignationService) {
        this.resignationService = resignationService;
    }

    @PostMapping
    public ResponseEntity<ResignationResponse> submitResignation(
            @Valid @RequestBody ResignationRequest request,
            HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        return ResponseEntity.ok(resignationService.submitResignation(request, authHeader));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResignationResponse>> getMyResignations(
            HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        return ResponseEntity.ok(resignationService.getMyResignations(authHeader));
    }

    @GetMapping
    public ResponseEntity<List<ResignationResponse>> getAllResignations() {
        // Typically secured for Admin/HR via Gateway
        return ResponseEntity.ok(resignationService.getAllResignations());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResignationResponse> approveResignation(
            @PathVariable Long id,
            @Valid @RequestBody ApproveResignationRequest request) {
        return ResponseEntity.ok(resignationService.approveResignation(id, request));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResignationResponse> rejectResignation(
            @PathVariable Long id) {
        return ResponseEntity.ok(resignationService.rejectResignation(id));
    }
}
