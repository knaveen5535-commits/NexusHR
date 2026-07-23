package com.nexushr.repository;

import com.nexushr.entity.ManagerReview;
import org.springframework.stereotype.Repository;

@Repository
public interface ManagerReviewRepository extends FeedbackRepository<ManagerReview> {
    java.util.Optional<ManagerReview> findByRevieweeIdAndReviewYearAndReviewMonthAndDeletedFalse(Long revieweeId, Integer year, Integer month);
}
