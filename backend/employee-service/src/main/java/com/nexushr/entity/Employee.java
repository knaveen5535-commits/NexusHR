package com.nexushr.entity;

import com.nexushr.enums.EmployeeStatus;
import com.nexushr.enums.ProfileVerificationStatus;
import com.nexushr.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeCode;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String phone;

    private BigDecimal salary;

    private LocalDate joiningDate;

    private LocalDate leaveDate;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    private String employmentType;

    private String address;

    private String emergencyContactName;

    private String emergencyContactNumber;

    private String profilePhotoUrl;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<EmployeeDocument> documents = new java.util.ArrayList<>();

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_verification_status")
    private ProfileVerificationStatus profileVerificationStatus;

    @ManyToOne
    @JoinColumn(name = "profile_verified_by")
    private Employee profileVerifiedBy;

    private java.time.LocalDateTime profileVerifiedDate;

    private String profileRejectionReason;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "designation_id")
    private Designation designation;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Enumerated(EnumType.STRING)
    private Role role;
}