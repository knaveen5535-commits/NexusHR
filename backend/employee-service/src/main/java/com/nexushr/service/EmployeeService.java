package com.nexushr.service;

import com.nexushr.dto.AssignManagerRequest;
import com.nexushr.dto.AuthRegisterRequest;
import com.nexushr.dto.CreateEmployeeRequest;
import com.nexushr.dto.EmployeeBasicResponse;
import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.TransferEmployeeRequest;
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

    private EmployeeResponse mapToResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getSalary(),
                employee.getDepartment().getDepartmentName(),
                employee.getDesignation().getDesignationName(),
                employee.getManager() != null ? employee.getManager().getId() : null,
                employee.getManager() != null ? employee.getManager().getFirstName() + " " + employee.getManager().getLastName() : null,
                employee.getStatus(),
                employee.getRole(),
                employee.getJoiningDate(),
                employee.getLeaveDate()
        );
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request, String authHeader) {

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new DepartmentNotFoundException("Department not found"));

        Designation designation = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new DesignationNotFoundException("Designation not found"));

        if (!designation.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException("Designation does not belong to the selected department");
        }

        if (designation.getDesignationType() != request.getRole()) {
            throw new IllegalArgumentException("Designation does not match the selected role");
        }

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EmployeeNotFoundException("Manager not found"));

            if (!manager.getDepartment().getId().equals(department.getId())) {
                throw new IllegalArgumentException("Manager must belong to the same department");
            }
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(java.time.LocalDate.now());

        long employeeCount = employeeRepository.count() + 1;
        String employeeCode = String.format("EMP%03d", employeeCount);
        employee.setEmployeeCode(employeeCode);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setDepartment(department);
        employee.setDesignation(designation);
        employee.setManager(manager);
        employee.setRole(request.getRole());

        String tempPassword = "Temp@123";

        AuthRegisterRequest authRequest = new AuthRegisterRequest();
        authRequest.setEmail(request.getEmail());
        authRequest.setPassword(tempPassword);
        authRequest.setRole(request.getRole());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<AuthRegisterRequest> entity = new HttpEntity<>(authRequest, headers);

        Employee savedEmployee = null;
        try {
            String response = restTemplate.postForObject(
                    "http://localhost:8081/api/auth/create-user",
                    entity,
                    String.class
            );

            if (response == null) {
                throw new RuntimeException("Auth service failed");
            }
            savedEmployee = employeeRepository.save(employee);
        } catch (Exception e) {
            throw new RuntimeException("Employee creation failed");
        }

        return mapToResponse(savedEmployee);
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));
        return mapToResponse(employee);
    }

    public EmployeeResponse getCurrentEmployee(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        java.util.Optional<Employee> empOpt = employeeRepository.findByEmail(email);
        if (empOpt.isEmpty()) {
            String role = jwtService.extractClaims(token).get("role", String.class);
            if ("ADMIN".equals(role)) {
                return new EmployeeResponse(
                        0L, "ADMIN001", "System", "Admin", email, "0000000000",
                        null, null, null, null, null, EmployeeStatus.ACTIVE, com.nexushr.enums.Role.ADMIN,
                        java.time.LocalDate.now(), null
                );
            }
            throw new EmployeeNotFoundException("Employee not found for email: " + email);
        }
        return mapToResponse(empOpt.get());
    }

    public String deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));
        employeeRepository.delete(employee);
        return "Employee deleted successfully";
    }

    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new DepartmentNotFoundException("Department not found"));

        Designation designation = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new DesignationNotFoundException("Designation not found"));

        if (!designation.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException("Designation does not belong to the selected department");
        }

        if (designation.getDesignationType() != request.getRole()) {
            throw new IllegalArgumentException("Designation does not match the selected role");
        }

        if(employeeRepository.existsByEmail(request.getEmail()) && !employee.getEmail().equals(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
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

        Employee updatedEmployee = employeeRepository.save(employee);

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
                System.err.println("Failed to sync role to auth service: " + e.getMessage());
            }
        }

        return mapToResponse(updatedEmployee);
    }

    public EmployeeResponse transferEmployee(Long id, TransferEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new DepartmentNotFoundException("Department not found"));

        Designation designation = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new DesignationNotFoundException("Designation not found"));

        if (!designation.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException("Designation does not belong to the selected department");
        }

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EmployeeNotFoundException("Manager not found"));

            if (!manager.getDepartment().getId().equals(department.getId())) {
                throw new IllegalArgumentException("Manager must belong to the same department");
            }
            if (manager.getId().equals(employee.getId())) {
                throw new IllegalArgumentException("An employee cannot be their own manager");
            }
        }

        employee.setDepartment(department);
        employee.setDesignation(designation);
        employee.setManager(manager);

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    public EmployeeResponse assignManager(Long id, AssignManagerRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EmployeeNotFoundException("Manager not found"));

            if (!manager.getDepartment().getId().equals(employee.getDepartment().getId())) {
                throw new IllegalArgumentException("Manager must belong to the same department");
            }
            if (manager.getId().equals(employee.getId())) {
                throw new IllegalArgumentException("An employee cannot be their own manager");
            }
        }

        employee.setManager(manager);
        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    public EmployeeResponse updateRole(Long id, com.nexushr.dto.UpdateRoleRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        boolean roleChanged = employee.getRole() != request.getRole();
        employee.setRole(request.getRole());
        Employee updatedEmployee = employeeRepository.save(employee);

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
                System.err.println("Failed to sync role to auth service: " + e.getMessage());
            }
        }

        return mapToResponse(updatedEmployee);
    }

    public List<EmployeeResponse> getTeamMembers(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        Employee manager = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Logged in manager not found"));

        List<Employee> employees = employeeRepository.findByManagerId(manager.getId());

        return employees.stream()
                .map(this::mapToResponse)
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