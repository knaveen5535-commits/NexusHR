package com.nexushr.controller;

import com.nexushr.dto.DesignationResponse;
import com.nexushr.enums.Role;
import com.nexushr.service.DesignationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(DesignationService designationService) {
        this.designationService = designationService;
    }

    @GetMapping
    public ResponseEntity<List<DesignationResponse>> getDesignations(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Role type) {
        return ResponseEntity.ok(designationService.getDesignations(departmentId, type));
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<DesignationResponse> createDesignation(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.nexushr.dto.CreateDesignationRequest request) {
        return ResponseEntity.ok(designationService.createDesignation(request));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<DesignationResponse> updateDesignation(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.nexushr.dto.UpdateDesignationRequest request) {
        return ResponseEntity.ok(designationService.updateDesignation(id, request));
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/status")
    public ResponseEntity<DesignationResponse> toggleStatus(
            @org.springframework.web.bind.annotation.PathVariable Long id) {
        return ResponseEntity.ok(designationService.toggleStatus(id));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDesignation(@org.springframework.web.bind.annotation.PathVariable Long id) {
        designationService.deleteDesignation(id);
        return ResponseEntity.noContent().build();
    }
}
