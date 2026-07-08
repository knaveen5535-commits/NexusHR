package com.nexushr.controller;

import com.nexushr.dto.DepartmentResponse;
import com.nexushr.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<DepartmentResponse> createDepartment(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.nexushr.dto.CreateDepartmentRequest request) {
        return ResponseEntity.ok(departmentService.createDepartment(request));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.nexushr.dto.UpdateDepartmentRequest request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@org.springframework.web.bind.annotation.PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
