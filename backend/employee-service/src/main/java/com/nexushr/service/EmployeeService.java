package com.nexushr.service;

import com.nexushr.dto.AuthRegisterRequest;
import com.nexushr.dto.CreateEmployeeRequest;
import com.nexushr.dto.EmployeeBasicResponse;
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
    private final JwtService jwtService;
    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           RestTemplate restTemplate,
                           JwtService jwtService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.restTemplate = restTemplate;
        this.jwtService = jwtService;
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

        if (!designation.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException("Designation does not belong to the selected department");
        }

        if (designation.getDesignationType() != request.getRole()) {
            throw new IllegalArgumentException("Designation does not match the selected role");
        }

        Employee manager = null;
        if (request.getManagerId() != null) {

            manager = employeeRepository.findById(
                    request.getManagerId()
            ).orElseThrow(() ->
                    new EmployeeNotFoundException(
                            "Manager not found"
                    )
            );

            if (!manager.getDepartment().getId().equals(department.getId())) {
                throw new IllegalArgumentException("Manager must belong to the same department");
            }
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
        employee.setManager(manager);
        employee.setRole(request.getRole());

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
                savedEmployee.getDesignation().getDesignationName(),
                savedEmployee.getStatus(),
                savedEmployee.getRole()
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
                        employee.getDesignation().getDesignationName(),
                        employee.getStatus(),
                        employee.getRole()
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
                employee.getDesignation().getDesignationName(),
                employee.getStatus(),
                employee.getRole()
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

        if (!designation.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException("Designation does not belong to the selected department");
        }

        if (designation.getDesignationType() != request.getRole()) {
            throw new IllegalArgumentException("Designation does not match the selected role");
        }

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

        boolean roleChanged = employee.getRole() != request.getRole();
        employee.setRole(request.getRole());

        Employee updatedEmployee =
                employeeRepository.save(employee);

        if (roleChanged) {
            try {
                java.util.Map<String, Object> updateRolePayload = new java.util.HashMap<>();
                updateRolePayload.put("email", updatedEmployee.getEmail());
                updateRolePayload.put("role", updatedEmployee.getRole().name());

                restTemplate.postForObject(
                        "http://localhost:8081/api/auth/update-role",
                        updateRolePayload,
                        String.class
                );
            } catch (Exception e) {
                // Log exception if auth sync fails, though employee is updated
                System.err.println("Failed to sync role to auth service: " + e.getMessage());
            }
        }

        return new EmployeeResponse(
                updatedEmployee.getId(),
                updatedEmployee.getEmployeeCode(),
                updatedEmployee.getFirstName(),
                updatedEmployee.getLastName(),
                updatedEmployee.getEmail(),
                updatedEmployee.getDepartment().getDepartmentName(),
                updatedEmployee.getDesignation().getDesignationName(),
                updatedEmployee.getStatus(),
                updatedEmployee.getRole()
        );
    }

    public List<EmployeeResponse> getTeamMembers(
            String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        Employee manager = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Logged in manager not found"));

        List<Employee> employees =
                employeeRepository.findByManagerId(manager.getId());

        return employees.stream()
                .map(employee ->
                        new EmployeeResponse(
                                employee.getId(),
                                employee.getEmployeeCode(),
                                employee.getFirstName(),
                                employee.getLastName(),
                                employee.getEmail(),
                                employee.getDepartment().getDepartmentName(),
                                employee.getDesignation().getDesignationName(),
                                employee.getStatus(),
                                employee.getRole()
                        )
                )
                .toList();
    }

    public List<EmployeeBasicResponse> getManagers() {
        List<Employee> managers = employeeRepository.findByRole(com.nexushr.enums.Role.MANAGER);
        return managers.stream()
                .map(emp -> new EmployeeBasicResponse(emp.getId(), emp.getFirstName(), emp.getLastName()))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<EmployeeBasicResponse> getManagersByDepartment(Long departmentId) {
        List<Employee> managers = employeeRepository.findByRoleAndDepartmentId(com.nexushr.enums.Role.MANAGER, departmentId);
        return managers.stream()
                .map(emp -> new EmployeeBasicResponse(emp.getId(), emp.getFirstName(), emp.getLastName()))
                .collect(java.util.stream.Collectors.toList());
    }

    public com.nexushr.dto.DashboardStatsDTO getDashboardStats() {
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(com.nexushr.enums.EmployeeStatus.ACTIVE);
        long departmentsCount = departmentRepository.count();
        long managersCount = employeeRepository.countByRole(com.nexushr.enums.Role.MANAGER);
        long hrStaffCount = employeeRepository.countByRole(com.nexushr.enums.Role.HR);
        java.math.BigDecimal monthlyPayrollCost = employeeRepository.sumSalary();

        return new com.nexushr.dto.DashboardStatsDTO(
                totalEmployees,
                activeEmployees,
                departmentsCount,
                managersCount,
                hrStaffCount,
                monthlyPayrollCost
        );
    }

}