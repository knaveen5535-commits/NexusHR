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
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;
    private final JwtService jwtService;
    private final com.nexushr.repository.ProfileUpdateRequestRepository profileUpdateRequestRepository;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE employee_documents DROP CONSTRAINT IF EXISTS employee_documents_verification_status_check");
            jdbcTemplate.execute("UPDATE employee_documents SET verification_status = 'PENDING_HR_APPROVAL' WHERE verification_status = 'PENDING_HR_ADMIN_APPROVAL'");
        } catch (Exception e) {
            // Ignore if constraint does not exist
        }
    }

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           EmployeeDocumentRepository employeeDocumentRepository,
                           NotificationService notificationService,
                           org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
                           RestTemplate restTemplate,
                           JwtService jwtService,
                           com.nexushr.repository.ProfileUpdateRequestRepository profileUpdateRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.employeeDocumentRepository = employeeDocumentRepository;
        this.notificationService = notificationService;
        this.jdbcTemplate = jdbcTemplate;
        this.restTemplate = restTemplate;
        this.jwtService = jwtService;
        this.profileUpdateRequestRepository = profileUpdateRequestRepository;
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
        

        java.util.List<com.nexushr.dto.EmployeeDocumentDto> docs = new java.util.ArrayList<>();
        if (employee.getDocuments() != null) {
            for (com.nexushr.entity.EmployeeDocument doc : employee.getDocuments()) {
                com.nexushr.dto.EmployeeDocumentDto dto = new com.nexushr.dto.EmployeeDocumentDto(
                    doc.getId(), doc.getDocumentType(), doc.getDocumentName(), doc.getDocumentUrl(), doc.getUploadDate(),
                    doc.getStatus() != null ? doc.getStatus().name() : null,
                    doc.getHrReviewedBy() != null ? doc.getHrReviewedBy().getId() : null,
                    doc.getHrReviewedAt(),
                    doc.getHrDecision(),
                    doc.getHrComments(),
                    doc.getAdminReviewedBy() != null ? doc.getAdminReviewedBy().getId() : null,
                    doc.getAdminReviewedAt(),
                    doc.getAdminDecision(),
                    doc.getAdminComments(),
                    null // employee info is not needed here
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
        
        if (request.getJoiningDate() != null) {
            employee.setJoiningDate(request.getJoiningDate());
        } else {
            employee.setJoiningDate(java.time.LocalDate.now());
        }

        if (request.getEmploymentType() != null && !request.getEmploymentType().trim().isEmpty()) {
            employee.setEmploymentType(request.getEmploymentType());
        } else {
            employee.setEmploymentType("Full-Time");
        }

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
            
            // Auto-provision salary structure
            try {
                java.util.Map<String, Object> autoProvisionPayload = new java.util.HashMap<>();
                autoProvisionPayload.put("employeeId", savedEmployee.getId());
                autoProvisionPayload.put("designationId", designation.getId());
                autoProvisionPayload.put("designationName", designation.getDesignationName());
                autoProvisionPayload.put("baseSalary", savedEmployee.getSalary());

                HttpHeaders payrollHeaders = new HttpHeaders();
                payrollHeaders.set("Authorization", authHeader);
                HttpEntity<java.util.Map<String, Object>> payrollEntity = new HttpEntity<>(autoProvisionPayload, payrollHeaders);

                restTemplate.postForObject(
                        "http://localhost:8083/api/salary-structures/auto-provision",
                        payrollEntity,
                        String.class
                );
            } catch (Exception ex) {
                // Log and ignore to prevent employee creation failure if payroll service is down
                System.err.println("Failed to auto-provision salary structure: " + ex.getMessage());
            }
            
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

    @org.springframework.transaction.annotation.Transactional
    public com.nexushr.dto.ProfileUpdateRequestDTO updateProfile(String authHeader, com.nexushr.dto.UpdateProfileRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        java.util.List<ProfileVerificationStatus> pendingStatuses = java.util.Arrays.asList(
            ProfileVerificationStatus.PENDING_MANAGER_APPROVAL, 
            ProfileVerificationStatus.PENDING_ADMIN_APPROVAL
        );
        java.util.Optional<com.nexushr.entity.ProfileUpdateRequest> existingPending = profileUpdateRequestRepository
            .findTopByEmployeeIdAndStatusInOrderByCreatedAtDesc(employee.getId(), pendingStatuses);
            
        if (existingPending.isPresent()) {
            throw new IllegalStateException("You already have a pending profile update request.");
        }

        com.nexushr.entity.ProfileUpdateRequest updateRequest = new com.nexushr.entity.ProfileUpdateRequest();
        updateRequest.setEmployee(employee);
        updateRequest.setRequestedPhone(request.getPhone());
        updateRequest.setRequestedAddress(request.getAddress());
        updateRequest.setRequestedEmergencyContactName(request.getEmergencyContactName());
        updateRequest.setRequestedEmergencyContactNumber(request.getEmergencyContactNumber());
        updateRequest.setRequestedDateOfBirth(request.getDateOfBirth());
        updateRequest.setRequestedGender(request.getGender());
        updateRequest.setRequestedBloodGroup(request.getBloodGroup());

        if (employee.getRole() == com.nexushr.enums.Role.MANAGER || employee.getRole() == com.nexushr.enums.Role.HR) {
            updateRequest.setStatus(ProfileVerificationStatus.PENDING_ADMIN_APPROVAL);
        } else {
            updateRequest.setStatus(ProfileVerificationStatus.PENDING_MANAGER_APPROVAL);
        }
        
        com.nexushr.entity.ProfileUpdateRequest savedRequest = profileUpdateRequestRepository.save(updateRequest);
        
        if (employee.getRole() == com.nexushr.enums.Role.MANAGER || employee.getRole() == com.nexushr.enums.Role.HR) {
            java.util.List<Employee> admins = employeeRepository.findByRole(com.nexushr.enums.Role.ADMIN);
            for (Employee admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "info",
                    "Profile Update Approval Required",
                    employee.getFirstName() + " " + employee.getLastName() + " has submitted a profile update request."
                );
            }
        } else if (employee.getManager() != null) {
            notificationService.createNotification(
                employee.getManager().getId(),
                "info",
                "Profile Update Approval Required",
                employee.getFirstName() + " " + employee.getLastName() + " has submitted a profile update request."
            );
        }

        return mapToProfileUpdateRequestDTO(savedRequest);
    }

    @org.springframework.transaction.annotation.Transactional
    public com.nexushr.dto.ProfileUpdateRequestDTO verifyProfile(Long requestId, VerificationRequest request, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String role = jwtService.extractClaims(token).get("role", String.class);
        Employee reviewer = null;

        com.nexushr.entity.ProfileUpdateRequest updateRequest = profileUpdateRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Profile update request not found"));

        Employee employee = updateRequest.getEmployee();

        if (!"ADMIN".equals(role)) {
            String reviewerEmail = jwtService.extractClaims(token).getSubject();
            reviewer = employeeRepository.findByEmail(reviewerEmail)
                    .orElseThrow(() -> new EmployeeNotFoundException("Reviewer not found"));

            if (employee.getManager() == null || !employee.getManager().getId().equals(reviewer.getId())) {
                throw new IllegalArgumentException("Only the assigned manager can verify this profile request.");
            }
        } else {
            String adminEmail = jwtService.extractClaims(token).getSubject();
            reviewer = employeeRepository.findByEmail(adminEmail).orElse(null);
        }

        ProfileVerificationStatus status;
        try {
            status = ProfileVerificationStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Expected PROFILE_VERIFIED or PROFILE_REJECTED.");
        }

        updateRequest.setStatus(status);
        updateRequest.setReviewedBy(reviewer);
        updateRequest.setReviewedAt(LocalDateTime.now());
        updateRequest.setRejectionReason(request.getRejectionReason());
        updateRequest.setReviewerComment(request.getRejectionReason()); // Using rejectionReason for general comment for now

        if (status == ProfileVerificationStatus.PROFILE_VERIFIED) {
            if (updateRequest.getRequestedPhone() != null) employee.setPhone(updateRequest.getRequestedPhone());
            if (updateRequest.getRequestedAddress() != null) employee.setAddress(updateRequest.getRequestedAddress());
            if (updateRequest.getRequestedEmergencyContactName() != null) employee.setEmergencyContactName(updateRequest.getRequestedEmergencyContactName());
            if (updateRequest.getRequestedEmergencyContactNumber() != null) employee.setEmergencyContactNumber(updateRequest.getRequestedEmergencyContactNumber());
            if (updateRequest.getRequestedDateOfBirth() != null) employee.setDateOfBirth(updateRequest.getRequestedDateOfBirth());
            if (updateRequest.getRequestedGender() != null) employee.setGender(updateRequest.getRequestedGender());
            if (updateRequest.getRequestedBloodGroup() != null) employee.setBloodGroup(updateRequest.getRequestedBloodGroup());
            
            employeeRepository.save(employee);
        }

        profileUpdateRequestRepository.save(updateRequest);

        notificationService.createNotification(
            employee.getId(),
            status == ProfileVerificationStatus.PROFILE_VERIFIED ? "success" : "warning",
            "Profile Request " + (status == ProfileVerificationStatus.PROFILE_VERIFIED ? "Approved" : "Rejected"),
            "Your profile update request has been " + (status == ProfileVerificationStatus.PROFILE_VERIFIED ? "approved." : "rejected. Reason: " + request.getRejectionReason())
        );

        return mapToProfileUpdateRequestDTO(updateRequest);
    }
    
    public java.util.List<com.nexushr.dto.ProfileUpdateRequestDTO> getPendingProfileRequests(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();
        String role = jwtService.extractClaims(token).get("role", String.class);

        List<com.nexushr.entity.ProfileUpdateRequest> requests;

        if ("ADMIN".equals(role)) {
            requests = profileUpdateRequestRepository.findByStatus(ProfileVerificationStatus.PENDING_ADMIN_APPROVAL);
        } else {
            Employee manager = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new EmployeeNotFoundException("Manager not found"));
            requests = profileUpdateRequestRepository.findByEmployeeManagerIdAndStatus(manager.getId(), ProfileVerificationStatus.PENDING_MANAGER_APPROVAL);
        }

        return requests.stream().map(this::mapToProfileUpdateRequestDTO).toList();
    }

    public com.nexushr.dto.ProfileUpdateRequestDTO getMyLatestProfileRequest(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractClaims(token).getSubject();

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        return profileUpdateRequestRepository.findTopByEmployeeIdOrderByCreatedAtDesc(employee.getId())
                .map(this::mapToProfileUpdateRequestDTO)
                .orElse(null);
    }

    private com.nexushr.dto.ProfileUpdateRequestDTO mapToProfileUpdateRequestDTO(com.nexushr.entity.ProfileUpdateRequest request) {
        com.nexushr.dto.ProfileUpdateRequestDTO dto = new com.nexushr.dto.ProfileUpdateRequestDTO();
        dto.setId(request.getId());
        
        EmployeeBasicResponse empBasic = new EmployeeBasicResponse(
            request.getEmployee().getId(), 
            request.getEmployee().getFirstName(), 
            request.getEmployee().getLastName()
        );
        dto.setEmployee(empBasic);
        
        dto.setRequestedPhone(request.getRequestedPhone());
        dto.setRequestedAddress(request.getRequestedAddress());
        dto.setRequestedDateOfBirth(request.getRequestedDateOfBirth());
        dto.setRequestedGender(request.getRequestedGender());
        dto.setRequestedBloodGroup(request.getRequestedBloodGroup());
        dto.setRequestedEmergencyContactName(request.getRequestedEmergencyContactName());
        dto.setRequestedEmergencyContactNumber(request.getRequestedEmergencyContactNumber());
        dto.setRequestedProfilePhotoUrl(request.getRequestedProfilePhotoUrl());
        
        dto.setStatus(request.getStatus().name());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setReviewerComment(request.getReviewerComment());
        
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setReviewedAt(request.getReviewedAt());
        
        if (request.getReviewedBy() != null) {
            EmployeeBasicResponse revBasic = new EmployeeBasicResponse(
                request.getReviewedBy().getId(), 
                request.getReviewedBy().getFirstName(), 
                request.getReviewedBy().getLastName()
            );
            dto.setReviewedBy(revBasic);
        }
        return dto;
    }

    public java.util.List<com.nexushr.dto.EmployeeDocumentDto> getPendingDocuments(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String role = jwtService.extractClaims(token).get("role", String.class);
        
        if (!"ADMIN".equals(role) && !"HR".equals(role)) {
            throw new IllegalArgumentException("Only Admin or HR can view pending documents");
        }

        java.util.List<DocumentVerificationStatus> statuses;
        if ("ADMIN".equals(role)) {
            statuses = java.util.Arrays.asList(
                DocumentVerificationStatus.PENDING_ADMIN_APPROVAL,
                DocumentVerificationStatus.PENDING_HR_APPROVAL
            );
        } else {
            statuses = java.util.Arrays.asList(
                DocumentVerificationStatus.PENDING_HR_APPROVAL
            );
        }

        java.util.List<EmployeeDocument> docs = employeeDocumentRepository.findByStatusIn(statuses);
        return docs.stream().map(doc -> {
            return new com.nexushr.dto.EmployeeDocumentDto(
                doc.getId(), doc.getDocumentType(), doc.getDocumentName(), doc.getDocumentUrl(), doc.getUploadDate(),
                doc.getStatus() != null ? doc.getStatus().name() : null,
                doc.getHrReviewedBy() != null ? doc.getHrReviewedBy().getId() : null,
                doc.getHrReviewedAt(),
                doc.getHrDecision(),
                doc.getHrComments(),
                doc.getAdminReviewedBy() != null ? doc.getAdminReviewedBy().getId() : null,
                doc.getAdminReviewedAt(),
                doc.getAdminDecision(),
                doc.getAdminComments(),
                new EmployeeBasicResponse(doc.getEmployee().getId(), doc.getEmployee().getFirstName(), doc.getEmployee().getLastName())
            );
        }).collect(java.util.stream.Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
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
        if (caller.getRole() != null && (caller.getRole() == com.nexushr.enums.Role.MANAGER || caller.getRole() == com.nexushr.enums.Role.HR)) {
            doc.setStatus(DocumentVerificationStatus.PENDING_ADMIN_APPROVAL);
        } else {
            doc.setStatus(DocumentVerificationStatus.PENDING_HR_APPROVAL);
        }
        
        employeeDocumentRepository.save(doc);

        if (caller.getRole() == null || (caller.getRole() != com.nexushr.enums.Role.MANAGER && caller.getRole() != com.nexushr.enums.Role.HR)) {
            List<Employee> hrs = employeeRepository.findByRole(com.nexushr.enums.Role.HR);
            for (Employee hr : hrs) {
                notificationService.createNotification(
                    hr.getId(),
                    "info",
                    "New Document Pending Verification",
                    caller.getFirstName() + " " + caller.getLastName() + " uploaded a new document (" + request.getDocumentType() + ")."
                );
            }
        }

        return mapToResponse(caller);
    }

    public EmployeeResponse verifyDocument(Long documentId, VerificationRequest request, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String role = jwtService.extractClaims(token).get("role", String.class);
        String reviewerEmail = jwtService.extractClaims(token).getSubject();
        
        Employee reviewer = employeeRepository.findByEmail(reviewerEmail).orElse(null);

        if (!"HR".equals(role) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("Only HR or Admin can verify documents.");
        }

        EmployeeDocument doc = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if ("HR".equals(role) && doc.getStatus() != DocumentVerificationStatus.PENDING_HR_APPROVAL) {
            throw new IllegalArgumentException("Document is not pending HR approval or has already been reviewed.");
        }

        String inputStatus = request.getStatus();
        if (!"DOCUMENT_VERIFIED".equals(inputStatus) && !"DOCUMENT_REJECTED".equals(inputStatus)) {
            throw new IllegalArgumentException("Invalid status. Expected DOCUMENT_VERIFIED or DOCUMENT_REJECTED.");
        }

        String comments = request.getComments() != null ? request.getComments() : request.getRejectionReason();

        if ("HR".equals(role)) {
            doc.setHrDecision(inputStatus);
            doc.setHrComments(comments);
            doc.setHrReviewedBy(reviewer);
            doc.setHrReviewedAt(LocalDateTime.now());
            
            // Move to admin approval step regardless of HR's verify/reject decision
            doc.setStatus(DocumentVerificationStatus.PENDING_ADMIN_APPROVAL);
            
            employeeDocumentRepository.save(doc);

            // Notify Admins
            List<Employee> admins = employeeRepository.findByRole(com.nexushr.enums.Role.ADMIN);
            for (Employee admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "info",
                    "Document Pending Final Verification",
                    "HR has " + (inputStatus.equals("DOCUMENT_VERIFIED") ? "approved" : "rejected") + " a document for " + doc.getEmployee().getFirstName() + ". Pending your final review."
                );
            }
        } else if ("ADMIN".equals(role)) {
            doc.setAdminDecision(inputStatus);
            doc.setAdminComments(comments);
            doc.setAdminReviewedBy(reviewer);
            doc.setAdminReviewedAt(LocalDateTime.now());
            
            // Admin decision is final
            doc.setStatus(DocumentVerificationStatus.valueOf(inputStatus));
            
            employeeDocumentRepository.save(doc);

            notificationService.createNotification(
                doc.getEmployee().getId(),
                inputStatus.equals("DOCUMENT_VERIFIED") ? "success" : "error",
                "Document " + (inputStatus.equals("DOCUMENT_VERIFIED") ? "Verified" : "Rejected"),
                "Your document '" + doc.getDocumentName() + "' has been " + (inputStatus.equals("DOCUMENT_VERIFIED") ? "verified" : "rejected") + " by Admin." + (comments != null && !comments.isBlank() ? " Reason: " + comments : "")
            );
        }

        return mapToResponse(doc.getEmployee());
    }

    @org.springframework.transaction.annotation.Transactional
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

        caller.getDocuments().remove(doc);
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
        employee.setEmploymentType(request.getEmploymentType());
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