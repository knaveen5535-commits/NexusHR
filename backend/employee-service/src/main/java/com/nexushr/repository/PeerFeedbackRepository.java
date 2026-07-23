package com.nexushr.repository;

import com.nexushr.entity.PeerFeedback;
import org.springframework.stereotype.Repository;

@Repository
public interface PeerFeedbackRepository extends FeedbackRepository<PeerFeedback> {
    java.util.List<PeerFeedback> findByRevieweeIdAndReviewYearAndReviewMonthAndDeletedFalse(Long revieweeId, Integer year, Integer month);
}
