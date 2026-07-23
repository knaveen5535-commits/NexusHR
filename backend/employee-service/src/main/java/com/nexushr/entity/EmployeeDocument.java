package com.nexushr.entity;

import com.nexushr.enums.DocumentVerificationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String documentType; // Resume, ID Proof, PAN, Aadhaar, Certificates, Other Documents, Offer Letter

    @Column(nullable = false)
    private String documentName;

    @Column(nullable = false)
    private String documentUrl;

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private DocumentVerificationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_reviewed_by")
    private Employee hrReviewedBy;

    private LocalDateTime hrReviewedAt;
    private String hrDecision;
    private String hrComments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_reviewed_by")
    private Employee adminReviewedBy;

    private LocalDateTime adminReviewedAt;
    private String adminDecision;
    private String adminComments;
}
