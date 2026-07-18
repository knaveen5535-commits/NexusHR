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
import com.nexushr.repository.EmployeeDocumentRepository;
import com.nexushr.dto.VerificationRequest;
import com.nexushr.dto.DocumentUploadRequest;
import com.nexushr.entity.EmployeeDocument;
import com.nexushr.enums.ProfileVerificationStatus;
import com.nexushr.enums.DocumentVerificationStatus;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;
    private final JwtService jwtService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           EmployeeDocumentRepository employeeDocumentRepository,
                           NotificationService notificationService,
                           RestTemplate restTemplate,
                           JwtService jwtService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.employeeDocumentRepository = employeeDocumentRepository;
        this.notificationService = notificationService;
        this.restTemplate = restTemplate;
        this.jwtService = jwtService;
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setFirstName(employee.getFirstName());
        response.setLastName(employee.getLastName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setSalary(employee.getSalary());
        response.setDepartmentName(employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : null);
        response.setDesignation(employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null);
        response.setManagerId(employee.getManager() != null ? employee.getManager().getId() : null);
        response.setManagerName(employee.getManager() != null ? employee.getManager().getFirstName() + " " + employee.getManager().getLastName() : null);
        response.setStatus(employee.getStatus());
        response.setRole(employee.getRole());
        response.setJoiningDate(employee.getJoiningDate());
        response.setLeaveDate(employee.getLeaveDate());
        response.setDateOfBirth(employee.getDateOfBirth());
        response.setGender(employee.getGender());
        response.setBloodGroup(employee.getBloodGroup());
        response.setEmploymentType(employee.getEmploymentType());
        response.setAddress(employee.getAddress());
        response.setEmergencyContactName(employee.getEmergencyContactName());
        response.setEmergencyContactNumber(employee.getEmergencyContactNumber());
        response.setProfilePhotoUrl(employee.getProfilePhotoUrl());
        response.setProfileVerificationStatus(employee.getProfileVerificationStatus() != null ? employee.getProfileVerificationStatus().name() : null);
        response.setProfileVerifiedBy(employee.getProfileVerifiedBy() != null ? employee.getProfileVerifiedBy().getId() : null);
        response.setProfileVerifiedDate(employee.getProfileVerifiedDate());
        response.setProfileRejectionReason(employee.getProfileRejectionReason());
        
        java.util.List<com.nexushr.dto.EmployeeDocumentDto> docs = new java.util.ArrayList<>();
        if (employee.getDocuments() != null) {
            for (com.nexushr.entity.EmployeeDocument doc : employee.getDocuments()) {
                com.nexushr.dto.EmployeeDocumentDto dto = new com.nexushr.dto.EmployeeDocumentDto(
                    doc.getId(), doc.getDocumentType(), doc.getDocumentName(), doc.getDocumentUrl(), doc.getUploadDate(),
                    doc.getStatus() != null ? doc.getStatus().name() : null,
                    doc.getVerifiedBy() != null ? doc.getVerifiedBy().getId() : null,
                    doc.getVerifiedDate(),
                    doc.getRejectionReason()
                );
                docs.add(dto);
            }
        }
        response.setDocuments(docs);
        return response;
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

        employee.setEmployeeCode("TEMP_" + java.util.UUID.randomUUID().toString().substring(0, 8));
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
            
            // First save to get the generated ID
            savedEmployee = employeeRepository.save(employee);
            
            // Update the employeeCode with the actual ID
            String employeeCode = String.format("EMP%05d", savedEmployee.getId());
            savedEmployee.setEmployeeCode(employeeCode);
            savedEmployee = employeeRepository.save(savedEmployee);
            
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
                EmployeeResponse adminResponse = new EmployeeResponse();
                adminResponse.setId(0L);
                adminResponse.setEmployeeCode("ADMIN001");
                adminResponse.setFirstName("System");
                adminResponse.setLastName("Admin");
                adminResponse.setEmail(email);
                adminResponse.setPhone("0000000000");
                adminResponse.setStatus(EmployeeStatus.ACTIVE);
                adminResponse.setRole(com.nexushr.enums.Role.ADMIN);
                adminResponse.setJoiningDate(java.time.LocalDate.now());
                adminResponse.setDocuments(new java.util.ArrayList<>());
                return adminResponse;
            }
            throw new EmployeeNotFoundException("Employee not found for email: " + email);
        }
        return mapToResponse(empOpt.get());
    }

    public EmployeeResponse updateProfile(String authHeader, com.nexushr.dto.UpdateProfileRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getEmergencyContactName() != null) employee.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactNumber() != null) employee.setEmergencyContactNumber(request.getEmergencyContactNumber());
        if (request.getProfilePhotoUrl() != null) employee.setProfilePhotoUrl(request.getProfilePhotoUrl());
        if (request.getDateOfBirth() != null) employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) employee.setGender(request.getGender());
        if (request.getBloodGroup() != null) employee.setBloodGroup(request.getBloodGroup());

        employee.setProfileVerificationStatus(ProfileVerificationStatus.PENDING_MANAGER_APPROVAL);
        employee.setProfileVerifiedBy(null);
        employee.setProfileVerifiedDate(null);
        employee.setProfileRejectionReason(null);

        Employee updatedEmployee = employeeRepository.save(employee);
        
        if (employee.getManager() != null) {
            notificationService.createNotification(
                employee.getManager().getId(),
                "info",
                "Profile Update Approval Required",
                employee.getFirstName() + " " + employee.getLastName() + " has updated their profile and requires approval."
            );
        }

        return mapToResponse(updatedEmployee);
    }

    public EmployeeResponse verifyProfile(Long employeeId, VerificationRequest request, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String managerEmail = jwtService.extractClaims(token).getSubject();
        Employee manager = employeeRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new EmployeeNotFoundException("Manager not found"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        if (employee.getManager() == null || !employee.getManager().getId().equals(manager.getId())) {
            throw new IllegalArgumentException("Only the assigned manager can verify this profile.");
        }

        ProfileVerificationStatus status;
        try {
            status = ProfileVerificationStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Expected PROFILE_VERIFIED or PROFILE_REJECTED.");
        }

        employee.setProfileVerificationStatus(status);
        employee.setProfileVerifiedBy(manager);
        employee.setProfileVerifiedDate(LocalDateTime.now());
        employee.setProfileRejectionReason(request.getRejectionReason());

        Employee updatedEmployee = employeeRepository.save(employee);

        notificationService.createNotification(
            employee.getId(),
            status == ProfileVerificationStatus.PROFILE_VERIFIED ? "success" : "warning",
            "Profile " + (status == ProfileVerificationStatus.PROFILE_VERIFIED ? "Approved" : "Rejected"),
            "Your profile update has been " + (status == ProfileVerificationStatus.PROFILE_VERIFIED ? "approved." : "rejected. Reason: " + request.getRejectionReason())
        );

        return mapToResponse(updatedEmployee);
    }

    public EmployeeResponse uploadDocument(Long employeeId, DocumentUploadRequest request, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();
        Employee caller = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        if (!caller.getId().equals(employeeId)) {
            throw new IllegalArgumentException("You can only upload documents for yourself.");
        }

        EmployeeDocument doc = new EmployeeDocument();
        doc.setEmployee(caller);
        doc.setDocumentType(request.getDocumentType());
        doc.setDocumentName(request.getDocumentName());
        doc.setDocumentUrl(request.getDocumentUrl());
        doc.setUploadDate(LocalDateTime.now());
        doc.setStatus(DocumentVerificationStatus.PENDING_HR_ADMIN_APPROVAL);
        
        employeeDocumentRepository.save(doc);

        List<Employee> hrs = employeeRepository.findByRole(com.nexushr.enums.Role.HR);
        for (Employee hr : hrs) {
            notificationService.createNotification(
                hr.getId(),
                "info",
                "New Document Pending Verification",
                caller.getFirstName() + " " + caller.getLastName() + " uploaded a new document (" + request.getDocumentType() + ")."
            );
        }

        return mapToResponse(caller);
    }

    public EmployeeResponse verifyDocument(Long documentId, VerificationRequest request, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String hrEmail = jwtService.extractClaims(token).getSubject();
        Employee hr = employeeRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new EmployeeNotFoundException("HR not found"));
        
        String role = jwtService.extractClaims(token).get("role", String.class);
        if (!"HR".equals(role) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("Only HR or Admin can verify documents.");
        }

        EmployeeDocument doc = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        DocumentVerificationStatus status;
        try {
            status = DocumentVerificationStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Expected DOCUMENT_VERIFIED or DOCUMENT_REJECTED.");
        }

        doc.setStatus(status);
        doc.setVerifiedBy("ADMIN".equals(role) ? null : hr);
        doc.setVerifiedDate(LocalDateTime.now());
        doc.setRejectionReason(request.getRejectionReason());
        
        employeeDocumentRepository.save(doc);

        notificationService.createNotification(
            doc.getEmployee().getId(),
            status == DocumentVerificationStatus.DOCUMENT_VERIFIED ? "success" : "error",
            "Document " + (status == DocumentVerificationStatus.DOCUMENT_VERIFIED ? "Verified" : "Rejected"),
            "Your document '" + doc.getDocumentName() + "' has been " + (status == DocumentVerificationStatus.DOCUMENT_VERIFIED ? "verified." : "rejected. Reason: " + request.getRejectionReason())
        );

        return mapToResponse(doc.getEmployee());
    }

    public EmployeeResponse deleteDocument(Long documentId, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();
        Employee caller = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        EmployeeDocument doc = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!doc.getEmployee().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("You can only delete your own documents.");
        }
        if (doc.getStatus() == DocumentVerificationStatus.DOCUMENT_VERIFIED) {
            throw new IllegalArgumentException("Verified documents cannot be deleted.");
        }

        employeeDocumentRepository.delete(doc);
        return mapToResponse(caller);
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
        java.math.BigDecimal sumSalary = employeeRepository.sumSalary();
        java.math.BigDecimal monthlyPayrollCost = sumSalary != null ? 
            sumSalary.divide(new java.math.BigDecimal("12"), java.math.RoundingMode.HALF_UP) : 
            java.math.BigDecimal.ZERO;

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