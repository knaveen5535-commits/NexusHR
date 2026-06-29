package com.nexushr.service;

import com.nexushr.dto.AuthRegisterRequest;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final RestTemplate restTemplate;
    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           RestTemplate restTemplate) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.restTemplate=restTemplate;
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request,String authHeader) {

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


        /*
        String tempPassword =
                UUID.randomUUID()
                        .toString()
                        .substring(0,8);
         */

        String tempPassword = "Temp@123";

        AuthRegisterRequest authRequest =
                new AuthRegisterRequest();

        authRequest.setEmail(
                request.getEmail()
        );

        authRequest.setPassword(
                tempPassword
        );

        authRequest.setRole(
                request.getRole()
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "Authorization",
                authHeader
        );

        HttpEntity<AuthRegisterRequest> entity =
                new HttpEntity<>(
                        authRequest,
                        headers
                );


        Employee savedEmployee = null;
        try {

            String response =
                    restTemplate.postForObject(
                            "http://localhost:8081/api/auth/create-user",
                            entity,
                            String.class
                    );

            if (response == null) {
                throw new RuntimeException(
                        "Auth service failed"
                );
            }

            savedEmployee =
                    employeeRepository.save(employee);

        }
        catch (Exception e) {
            throw new RuntimeException(
                    "Employee creation failed"
            );
        }

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