package com.nexushr.repository;

import com.nexushr.entity.SelfReview;
import org.springframework.stereotype.Repository;

@Repository
public interface SelfReviewRepository extends FeedbackRepository<SelfReview> {
    boolean existsByReviewerIdAndReviewYearAndReviewMonthAndDeletedFalse(Long reviewerId, Integer reviewYear, Integer reviewMonth);
}
