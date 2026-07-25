package com.nexushr.service.impl;

import com.nexushr.dto.feedback.*;
import com.nexushr.entity.*;
import com.nexushr.enums.EmployeeStatus;
import com.nexushr.enums.FeedbackStatus;
import com.nexushr.enums.FeedbackType;
import com.nexushr.enums.Role;
import com.nexushr.exception.EmployeeNotFoundException;
import com.nexushr.repository.*;
import com.nexushr.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository<Feedback> feedbackRepository;
    private final SelfReviewRepository selfReviewRepository;
    private final PeerFeedbackRepository peerFeedbackRepository;
    private final ManagerReviewRepository managerReviewRepository;
    private final EmployeeRepository employeeRepository;
    private final FeedbackMapper feedbackMapper;

    @Override
    @Transactional
    public FeedbackResponse submitSelfReview(Long reviewerId, SelfReviewRequest request) {
        validateCurrentMonth(request.getReviewYear(), request.getReviewMonth());
        
        Employee reviewer = getValidEmployee(reviewerId);

        Optional<SelfReview> existingOpt = selfReviewRepository.findByReviewerIdAndReviewYearAndReviewMonthAndDeletedFalse(reviewerId, request.getReviewYear(), request.getReviewMonth());
        SelfReview review;
        
        if (existingOpt.isPresent()) {
            review = existingOpt.get();
            if (review.getStatus() == FeedbackStatus.LOCKED) {
                throw new IllegalArgumentException("Cannot edit a locked review.");
            }
        } else {
            review = new SelfReview();
            review.setReviewer(reviewer);
            review.setReviewee(reviewer);
            review.setReviewYear(request.getReviewYear());
            review.setReviewMonth(request.getReviewMonth());
        }
        review.setOverallRating(request.getOverallRating());
        review.setAchievements(request.getAchievements());
        review.setChallenges(request.getChallenges());
        review.setSkillsLearned(request.getSkillsLearned());
        review.setAdditionalComments(request.getAdditionalComments());
        review.setStatus(request.getStatus());

        review = selfReviewRepository.save(review);
        
        if (request.getStatus() == FeedbackStatus.SUBMITTED) {
            notifyManager(reviewer, "Self Review Submitted");
        }

        return feedbackMapper.toDto(review);
    }

    @Override
    @Transactional
    public FeedbackResponse submitPeerFeedback(Long reviewerId, PeerFeedbackRequest request) {
        validateCurrentMonth(request.getReviewYear(), request.getReviewMonth());

        Employee reviewer = getValidEmployee(reviewerId);
        Employee reviewee = getValidEmployee(request.getRevieweeId());

        if (reviewer.getId().equals(reviewee.getId())) {
            throw new IllegalArgumentException("Cannot submit peer feedback for yourself.");
        }
        
        if (reviewer.getRole() == Role.HR || reviewer.getRole() == Role.ADMIN || reviewee.getRole() == Role.HR || reviewee.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("HR and Admin cannot participate in peer feedback.");
        }

        if (reviewer.getRole() == Role.MANAGER && reviewee.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Managers can only submit peer feedback for other Managers.");
        }
        
        if (reviewer.getRole() == Role.EMPLOYEE && reviewee.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Employees can only submit peer feedback for other Employees.");
        }

        if (reviewer.getRole() == Role.EMPLOYEE) {
            boolean sameManager = reviewer.getManager() != null && reviewee.getManager() != null && 
                                  reviewer.getManager().getId().equals(reviewee.getManager().getId());
            boolean sameDepartment = reviewer.getDepartment() != null && reviewee.getDepartment() != null &&
                                     reviewer.getDepartment().getId().equals(reviewee.getDepartment().getId());

            if (!sameManager && !sameDepartment) {
                throw new IllegalArgumentException("Peer feedback can only be submitted for teammates with the same manager or in the same department.");
            }
        }

        Optional<PeerFeedback> existingOpt = peerFeedbackRepository.findByReviewerIdAndRevieweeIdAndReviewYearAndReviewMonthAndTypeAndDeletedFalse(
                reviewerId, reviewee.getId(), request.getReviewYear(), request.getReviewMonth(), FeedbackType.PEER_FEEDBACK);
        
        PeerFeedback pf;
        if (existingOpt.isPresent()) {
            pf = existingOpt.get();
            if (pf.getStatus() == FeedbackStatus.LOCKED) {
                throw new IllegalArgumentException("Cannot edit a locked review.");
            }
        } else {
            pf = new PeerFeedback();
            pf.setReviewer(reviewer);
            pf.setReviewee(reviewee);
            pf.setReviewYear(request.getReviewYear());
            pf.setReviewMonth(request.getReviewMonth());
        }
        pf.setOverallRating(request.getOverallRating());
        pf.setCommunicationRating(request.getCommunicationRating());
        pf.setTeamworkRating(request.getTeamworkRating());
        pf.setKnowledgeSharingRating(request.getKnowledgeSharingRating());
        pf.setComments(request.getComments());
        pf.setStatus(request.getStatus());

        pf = peerFeedbackRepository.save(pf);
        
        if (request.getStatus() == FeedbackStatus.SUBMITTED) {
            notifyEmployee(reviewee, "New Peer Feedback Received");
        }

        return feedbackMapper.toDto(pf);
    }

    @Override
    @Transactional
    public FeedbackResponse submitManagerReview(Long reviewerId, ManagerReviewRequest request) {
        validateCurrentMonth(request.getReviewYear(), request.getReviewMonth());

        Employee reviewer = getValidEmployee(reviewerId);
        Employee reviewee = getValidEmployee(request.getRevieweeId());

        if (reviewee.getRole() == Role.MANAGER) {
            if (reviewer.getRole() != Role.HR) {
                throw new IllegalArgumentException("Only HR can submit Manager Reviews for Managers.");
            }
        } else {
            if (reviewee.getManager() == null || !reviewee.getManager().getId().equals(reviewerId)) {
                throw new IllegalArgumentException("You can only review employees assigned to you.");
            }
        }

        Optional<ManagerReview> existingOpt = managerReviewRepository.findByReviewerIdAndRevieweeIdAndReviewYearAndReviewMonthAndTypeAndDeletedFalse(
                reviewerId, reviewee.getId(), request.getReviewYear(), request.getReviewMonth(), FeedbackType.MANAGER_REVIEW);
        
        ManagerReview mr;
        if (existingOpt.isPresent()) {
            mr = existingOpt.get();
            if (mr.getStatus() == FeedbackStatus.LOCKED) {
                throw new IllegalArgumentException("Cannot edit a locked review.");
            }
        } else {
            mr = new ManagerReview();
            mr.setReviewer(reviewer);
            mr.setReviewee(reviewee);
            mr.setReviewYear(request.getReviewYear());
            mr.setReviewMonth(request.getReviewMonth());
        }
        mr.setOverallRating(request.getOverallRating());
        mr.setTechnicalSkillsRating(request.getTechnicalSkillsRating());
        mr.setCommunicationRating(request.getCommunicationRating());
        mr.setProductivityRating(request.getProductivityRating());
        mr.setWorkQualityRating(request.getWorkQualityRating());
        mr.setTeamworkRating(request.getTeamworkRating());
        mr.setComments(request.getComments());
        mr.setRecommendation(request.getRecommendation());
        mr.setStrengths(request.getStrengths());
        mr.setNeedsImprovement(request.getNeedsImprovement());
        mr.setStatus(request.getStatus());

        mr = managerReviewRepository.save(mr);
        
        if (request.getStatus() == FeedbackStatus.SUBMITTED) {
            notifyEmployee(reviewee, "Manager Review Submitted for you");
        }

        return feedbackMapper.toDto(mr);
    }

    @Override
    public List<FeedbackResponse> getMyFeedbacks(Long employeeId) {
        return feedbackRepository.findByRevieweeIdAndDeletedFalse(employeeId).stream()
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getSubmittedFeedbacks(Long employeeId) {
        return feedbackRepository.findByReviewerIdAndDeletedFalse(employeeId).stream()
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getTeamFeedbacks(Long managerId) {
        // Find all employees under this manager, then find their feedbacks
        List<Employee> team = employeeRepository.findByManagerId(managerId);
        List<Long> teamIds = team.stream().map(Employee::getId).collect(Collectors.toList());
        return feedbackRepository.findAll().stream()
                .filter(f -> teamIds.contains(f.getReviewee().getId()) && !f.isDeleted())
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .filter(f -> !f.isDeleted())
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }

    private void validateCurrentMonth(Integer reviewYear, Integer reviewMonth) {
        LocalDate now = LocalDate.now();
        if (reviewYear != now.getYear() || reviewMonth != now.getMonthValue()) {
            throw new IllegalArgumentException("Feedback can only be submitted for the current calendar month.");
        }
        
        if (now.getDayOfMonth() < 25) {
            throw new IllegalArgumentException("The review submission window opens on the 25th of the month.");
        }
    }

    private Employee getValidEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id " + id));
        if (employee.getStatus() == EmployeeStatus.INACTIVE || employee.getLeaveDate() != null) {
            throw new IllegalArgumentException("Feedback cannot be submitted for/by inactive or resigned employees.");
        }
        return employee;
    }
    
    private void notifyManager(Employee employee, String message) {
        if (employee.getManager() != null) {
            log.info("NOTIFICATION to Manager {}: {} from {}", employee.getManager().getEmail(), message, employee.getEmail());
        }
    }
    
    private void notifyEmployee(Employee employee, String message) {
        log.info("NOTIFICATION to Employee {}: {}", employee.getEmail(), message);
    }
}
