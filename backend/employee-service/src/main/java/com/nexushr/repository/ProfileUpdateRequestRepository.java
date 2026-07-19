package com.nexushr.repository;

import com.nexushr.entity.ProfileUpdateRequest;
import com.nexushr.enums.ProfileVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileUpdateRequestRepository extends JpaRepository<ProfileUpdateRequest, Long> {

    Optional<ProfileUpdateRequest> findTopByEmployeeIdAndStatusInOrderByCreatedAtDesc(Long employeeId, List<ProfileVerificationStatus> statuses);

    Optional<ProfileUpdateRequest> findTopByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<ProfileUpdateRequest> findByStatus(ProfileVerificationStatus status);

    List<ProfileUpdateRequest> findByEmployeeManagerIdAndStatus(Long managerId, ProfileVerificationStatus status);
}
