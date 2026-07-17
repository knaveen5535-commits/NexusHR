package com.nexushr.service;

import com.nexushr.dto.feedback.FeedbackResponse;
import com.nexushr.dto.feedback.ManagerReviewRequest;
import com.nexushr.dto.feedback.PeerFeedbackRequest;
import com.nexushr.dto.feedback.SelfReviewRequest;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse submitSelfReview(Long reviewerId, SelfReviewRequest request);
    FeedbackResponse submitPeerFeedback(Long reviewerId, PeerFeedbackRequest request);
    FeedbackResponse submitManagerReview(Long reviewerId, ManagerReviewRequest request);
    
    List<FeedbackResponse> getMyFeedbacks(Long employeeId);
    List<FeedbackResponse> getSubmittedFeedbacks(Long employeeId);
    List<FeedbackResponse> getTeamFeedbacks(Long managerId);
    List<FeedbackResponse> getAllFeedbacks(); // For HR/Admin
}
