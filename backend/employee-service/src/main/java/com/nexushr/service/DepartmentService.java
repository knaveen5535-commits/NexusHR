package com.nexushr.service;

import com.nexushr.dto.DepartmentResponse;
import com.nexushr.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dept -> new DepartmentResponse(dept.getId(), dept.getDepartmentName(), dept.getBudget()))
                .collect(Collectors.toList());
    }

    public DepartmentResponse createDepartment(com.nexushr.dto.CreateDepartmentRequest request) {
        com.nexushr.entity.Department dept = new com.nexushr.entity.Department();
        dept.setDepartmentName(request.getDepartmentName());
        dept.setBudget(request.getBudget());
        dept = departmentRepository.save(dept);
        return new DepartmentResponse(dept.getId(), dept.getDepartmentName(), dept.getBudget());
    }

    public DepartmentResponse updateDepartment(Long id, com.nexushr.dto.UpdateDepartmentRequest request) {
        com.nexushr.entity.Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new com.nexushr.exception.DepartmentNotFoundException("Department not found"));
        if (request.getDepartmentName() != null) {
            dept.setDepartmentName(request.getDepartmentName());
        }
        if (request.getBudget() != null) {
            dept.setBudget(request.getBudget());
        }
        dept = departmentRepository.save(dept);
        return new DepartmentResponse(dept.getId(), dept.getDepartmentName(), dept.getBudget());
    }

    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new com.nexushr.exception.DepartmentNotFoundException("Department not found");
        }
        departmentRepository.deleteById(id);
    }
}
