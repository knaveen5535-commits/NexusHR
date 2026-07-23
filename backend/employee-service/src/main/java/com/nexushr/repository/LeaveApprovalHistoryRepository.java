package com.nexushr.repository;

import com.nexushr.entity.LeaveApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApprovalHistoryRepository extends JpaRepository<LeaveApprovalHistory, Long> {
    List<LeaveApprovalHistory> findByLeaveRequestIdOrderByActionDateAsc(Long leaveRequestId);
}
