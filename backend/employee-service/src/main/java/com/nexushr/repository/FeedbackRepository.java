package com.nexushr.repository;

import com.nexushr.entity.Feedback;
import com.nexushr.enums.FeedbackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository<T extends Feedback> extends JpaRepository<T, Long> {
    List<T> findByRevieweeIdAndDeletedFalse(Long revieweeId);
    List<T> findByReviewerIdAndDeletedFalse(Long reviewerId);
    boolean existsByReviewerIdAndRevieweeIdAndReviewYearAndReviewMonthAndTypeAndDeletedFalse(Long reviewerId, Long revieweeId, Integer reviewYear, Integer reviewMonth, FeedbackType type);
}
