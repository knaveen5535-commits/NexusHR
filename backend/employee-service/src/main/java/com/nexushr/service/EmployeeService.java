package com.nexushr.service;

import com.nexushr.dto.CreateEmployeeRequest;
import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.UpdateEmployeeRequest;
import com.nexushr.entity.Department;
import com.nexushr.entity.Designation;
import com.nexushr.entity.Employee;
import com.nexushr.enums.EmployeeStatus;
import com.nexushr.exception.DepartmentNotFoundException;
import com.nexushr.exception.EmailAlreadyExistsException;
import com.nexushr.exception.DesignationNotFoundException;
import com.nexushr.exception.EmployeeNotFoundException;
import com.nexushr.repository.DepartmentRepository;
import com.nexushr.repository.DesignationRepository;
import com.nexushr.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {

        Department department =
                departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() ->
                                new DepartmentNotFoundException("Department not found"));

        Designation designation =
                designationRepository.findById(request.getDesignationId())
                        .orElseThrow(() ->
                                new DesignationNotFoundException("Designation not found"));

        Employee manager = null;
        if (request.getManagerId() != null) {

            manager = employeeRepository.findById(
                    request.getManagerId()
            ).orElseThrow(() ->
                    new EmployeeNotFoundException(
                            "Manager not found"
                    )
            );
        }

        if (employeeRepository.existsByEmail(
                request.getEmail())) {

            throw new EmailAlreadyExistsException(
                    "Email already exists"
            );
        }

        Employee employee = new Employee();

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setSalary(request.getSalary());

        long employeeCount = employeeRepository.count() + 1;

        String employeeCode =
                String.format("EMP%03d", employeeCount);

        employee.setEmployeeCode(employeeCode);

        //employee.setEmployeeCode("EMP" + System.currentTimeMillis());

        employee.setStatus(EmployeeStatus.ACTIVE);

        employee.setDepartment(department);
        employee.setDesignation(designation);
        employee.setManager(manager);   // added

        Employee savedEmployee = employeeRepository.save(employee);

        return new EmployeeResponse(
                savedEmployee.getId(),
                savedEmployee.getEmployeeCode(),
                savedEmployee.getFirstName(),
                savedEmployee.getLastName(),
                savedEmployee.getEmail(),
                savedEmployee.getDepartment().getDepartmentName(),
                savedEmployee.getDesignation().getTitle(),
                savedEmployee.getStatus()
        );
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(employee -> new EmployeeResponse(
                        employee.getId(),
                        employee.getEmployeeCode(),
                        employee.getFirstName(),
                        employee.getLastName(),
                        employee.getEmail(),
                        employee.getDepartment().getDepartmentName(),
                        employee.getDesignation().getTitle(),
                        employee.getStatus()
                ))
                .toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found"));

        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment().getDepartmentName(),
                employee.getDesignation().getTitle(),
                employee.getStatus()
        );
    }

    public String deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found"));

        employeeRepository.delete(employee);

        return "Employee deleted successfully";
    }

    public EmployeeResponse updateEmployee(
            Long id,
            UpdateEmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found"));

        Department department =
                departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() ->
                                new DepartmentNotFoundException("Department not found"));

        Designation designation =
                designationRepository.findById(request.getDesignationId())
                        .orElseThrow(() ->
                                new DesignationNotFoundException("Designation not found"));

        if(employeeRepository.existsByEmail(request.getEmail())
                &&
                !employee.getEmail().equals(request.getEmail())) {

            throw new EmailAlreadyExistsException(
                    "Email already exists"
            );
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setSalary(request.getSalary());

        employee.setDepartment(department);
        employee.setDesignation(designation);

        Employee updatedEmployee =
                employeeRepository.save(employee);

        return new EmployeeResponse(
                updatedEmployee.getId(),
                updatedEmployee.getEmployeeCode(),
                updatedEmployee.getFirstName(),
                updatedEmployee.getLastName(),
                updatedEmployee.getEmail(),
                updatedEmployee.getDepartment().getDepartmentName(),
                updatedEmployee.getDesignation().getTitle(),
                updatedEmployee.getStatus()
        );
    }
}