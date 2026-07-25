package com.nexushr.repository;

import com.nexushr.entity.LeaveRequest;
import com.nexushr.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.manager.id = :managerId ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByManagerIdOrderByCreatedAtDesc(@Param("managerId") Long managerId);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.manager.id = :managerId AND lr.status = :status ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByManagerIdAndStatusOrderByCreatedAtDesc(@Param("managerId") Long managerId, @Param("status") LeaveStatus status);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.status = :status AND ((lr.startDate BETWEEN :startDate AND :endDate) OR (lr.endDate BETWEEN :startDate AND :endDate) OR (lr.startDate <= :startDate AND lr.endDate >= :endDate))")
    List<LeaveRequest> findOverlappingLeaves(
            @Param("employeeId") Long employeeId, 
            @Param("status") LeaveStatus status, 
            @Param("startDate") java.time.LocalDate startDate, 
            @Param("endDate") java.time.LocalDate endDate);
}
