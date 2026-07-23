package com.nexushr.entity;

import com.nexushr.enums.ProfileVerificationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "profile_update_requests")
@Getter
@Setter
public class ProfileUpdateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "requested_phone")
    private String requestedPhone;

    @Column(name = "requested_address")
    private String requestedAddress;

    @Column(name = "requested_date_of_birth")
    private LocalDate requestedDateOfBirth;

    @Column(name = "requested_gender")
    private String requestedGender;

    @Column(name = "requested_blood_group")
    private String requestedBloodGroup;

    @Column(name = "requested_emergency_contact_name")
    private String requestedEmergencyContactName;

    @Column(name = "requested_emergency_contact_number")
    private String requestedEmergencyContactNumber;

    @Column(name = "requested_profile_photo_url")
    private String requestedProfilePhotoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProfileVerificationStatus status;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewer_comment")
    private String reviewerComment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Employee reviewedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
