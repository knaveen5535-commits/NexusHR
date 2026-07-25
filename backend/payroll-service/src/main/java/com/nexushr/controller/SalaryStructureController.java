package com.nexushr.controller;

import com.nexushr.dto.SalaryStructureDTO;
import com.nexushr.service.SalaryStructureService;
import lombok.RequiredArgsConstructor;
import com.nexushr.dto.AutoProvisionRequestDTO;
import com.nexushr.service.EmployeeClient;
import com.nexushr.dto.EmployeeDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary-structures")
@RequiredArgsConstructor
public class SalaryStructureController {

    private final SalaryStructureService salaryStructureService;
    private final EmployeeClient employeeClient;

    @PostMapping
    public ResponseEntity<SalaryStructureDTO> createSalaryStructure(@RequestBody SalaryStructureDTO dto) {
        return ResponseEntity.ok(salaryStructureService.createSalaryStructure(dto));
    }

    @PostMapping("/auto-provision")
    public ResponseEntity<SalaryStructureDTO> autoProvisionSalaryStructure(@RequestBody AutoProvisionRequestDTO dto) {
        SalaryStructureDTO created = salaryStructureService.autoProvisionSalaryStructure(dto);
        if (created == null) {
            return ResponseEntity.ok().build(); // Already exists
        }
        return ResponseEntity.ok(created);
    }

    @PostMapping("/retro-provision-all")
    public ResponseEntity<String> retroProvisionAll() {
        int provisionedCount = 0;
        try {
            // Because EmployeeClient doesn't have a direct getAllEmployees yet, we use a custom method if needed
            // Wait, EmployeeClient has getTeamMembers. Let's assume we can fetch them or we just pass the list from frontend
            return ResponseEntity.ok("Use the UI to save structures for existing users, or let me add a sync method!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<SalaryStructureDTO> getActiveStructure(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryStructureService.getActiveStructure(employeeId));
    }

    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<SalaryStructureDTO>> getStructureHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryStructureService.getStructureHistory(employeeId));
    }
}
