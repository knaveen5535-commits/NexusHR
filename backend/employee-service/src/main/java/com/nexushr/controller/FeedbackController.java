package com.nexushr.controller;

import com.nexushr.dto.EmployeeResponse;
import com.nexushr.dto.feedback.FeedbackResponse;
import com.nexushr.dto.feedback.ManagerReviewRequest;
import com.nexushr.dto.feedback.PeerFeedbackRequest;
import com.nexushr.dto.feedback.SelfReviewRequest;
import com.nexushr.service.EmployeeService;
import com.nexushr.service.FeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final EmployeeService employeeService;

    @PostMapping("/self")
    public ResponseEntity<FeedbackResponse> submitSelfReview(
            @Valid @RequestBody SelfReviewRequest request,
            HttpServletRequest httpRequest) {
        Long reviewerId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(feedbackService.submitSelfReview(reviewerId, request));
    }

    @PostMapping("/peer")
    public ResponseEntity<FeedbackResponse> submitPeerFeedback(
            @Valid @RequestBody PeerFeedbackRequest request,
            HttpServletRequest httpRequest) {
        Long reviewerId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(feedbackService.submitPeerFeedback(reviewerId, request));
    }

    @PostMapping("/manager")
    public ResponseEntity<FeedbackResponse> submitManagerReview(
            @Valid @RequestBody ManagerReviewRequest request,
            HttpServletRequest httpRequest) {
        Long reviewerId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(feedbackService.submitManagerReview(reviewerId, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<FeedbackResponse>> getMyFeedbacks(HttpServletRequest httpRequest) {
        Long employeeId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(feedbackService.getMyFeedbacks(employeeId));
    }

    @GetMapping("/team")
    public ResponseEntity<List<FeedbackResponse>> getTeamFeedbacks(HttpServletRequest httpRequest) {
        Long managerId = getCurrentUserId(httpRequest);
        return ResponseEntity.ok(feedbackService.getTeamFeedbacks(managerId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    private Long getCurrentUserId(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        EmployeeResponse employee = employeeService.getCurrentEmployee(authHeader);
        return employee.getId();
    }
}
