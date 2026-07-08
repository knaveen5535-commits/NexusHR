package com.nexushr.service;

import com.nexushr.dto.DepartmentResponse;
import com.nexushr.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final com.nexushr.repository.EmployeeRepository employeeRepository;

    public DepartmentService(DepartmentRepository departmentRepository, com.nexushr.repository.EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DepartmentResponse mapToResponse(com.nexushr.entity.Department dept) {
        Long count = employeeRepository.countByDepartmentId(dept.getId());
        String headName = null;
        if (dept.getDepartmentHeadId() != null) {
            com.nexushr.entity.Employee head = employeeRepository.findById(dept.getDepartmentHeadId()).orElse(null);
            if (head != null) {
                headName = head.getFirstName() + " " + head.getLastName();
            }
        }
        return new DepartmentResponse(dept.getId(), dept.getDepartmentName(), dept.getBudget(), dept.getDepartmentHeadId(), headName, count);
    }

    public DepartmentResponse createDepartment(com.nexushr.dto.CreateDepartmentRequest request) {
        com.nexushr.entity.Department dept = new com.nexushr.entity.Department();
        dept.setDepartmentName(request.getDepartmentName());
        dept.setBudget(request.getBudget());
        
        // At creation time, department doesn't have an ID yet, so we cannot validate if the head belongs to it.
        // As per workflow, department head is typically assigned during update.
        // If a head ID is provided somehow, we'd need to save the department first to get an ID.
        
        dept = departmentRepository.save(dept);
        
        if (request.getDepartmentHeadId() != null) {
            validateAndSetDepartmentHead(dept, request.getDepartmentHeadId());
            dept = departmentRepository.save(dept);
        }
        
        return mapToResponse(dept);
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
        
        if (request.getDepartmentHeadId() != null) {
            if (request.getDepartmentHeadId() == -1L) {
                dept.setDepartmentHeadId(null);
            } else {
                validateAndSetDepartmentHead(dept, request.getDepartmentHeadId());
            }
        }
        
        dept = departmentRepository.save(dept);
        return mapToResponse(dept);
    }

    private void validateAndSetDepartmentHead(com.nexushr.entity.Department dept, Long headId) {
        com.nexushr.entity.Employee employee = employeeRepository.findById(headId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!employee.getDepartment().getId().equals(dept.getId())) {
            throw new IllegalArgumentException("Selected manager does not belong to this department");
        }

        if (employee.getRole() != com.nexushr.enums.Role.MANAGER && employee.getRole() != com.nexushr.enums.Role.HR) {
            throw new IllegalArgumentException("Selected employee does not have a manager-level role");
        }

        dept.setDepartmentHeadId(headId);
    }

    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new com.nexushr.exception.DepartmentNotFoundException("Department not found");
        }
        departmentRepository.deleteById(id);
    }
}
// trigger recompile
