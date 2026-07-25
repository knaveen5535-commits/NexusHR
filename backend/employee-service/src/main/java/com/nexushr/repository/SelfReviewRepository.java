package com.nexushr.repository;

import com.nexushr.entity.SelfReview;
import org.springframework.stereotype.Repository;

@Repository
public interface SelfReviewRepository extends FeedbackRepository<SelfReview> {
    boolean existsByReviewerIdAndReviewYearAndReviewMonthAndDeletedFalse(Long reviewerId, Integer reviewYear, Integer reviewMonth);
    java.util.Optional<SelfReview> findByReviewerIdAndReviewYearAndReviewMonthAndDeletedFalse(Long reviewerId, Integer reviewYear, Integer reviewMonth);
    java.util.Optional<SelfReview> findByRevieweeIdAndReviewYearAndReviewMonthAndDeletedFalse(Long revieweeId, Integer year, Integer month);
}
