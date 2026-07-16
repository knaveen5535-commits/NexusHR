package com.nexushr.entity;

import com.nexushr.enums.LeaveAction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_approval_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_request_id", nullable = false)
    private LeaveRequest leaveRequest;

    @Column(name = "action_by_user_id", nullable = false)
    private Long actionByUserId;

    @Column(name = "action_by_user_name", nullable = false, length = 100)
    private String actionByUserName;

    @Column(name = "action_by_role", nullable = false, length = 50)
    private String actionByRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveAction action;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @CreationTimestamp
    @Column(name = "action_date", updatable = false)
    private LocalDateTime actionDate;
}
