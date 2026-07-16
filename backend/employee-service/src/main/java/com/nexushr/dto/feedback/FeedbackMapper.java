package com.nexushr.dto.feedback;

import com.nexushr.dto.EmployeeBasicResponse;
import com.nexushr.entity.*;
import org.springframework.stereotype.Component;

@Component
public class FeedbackMapper {

    public FeedbackResponse toDto(Feedback feedback) {
        if (feedback == null) return null;
        
        FeedbackResponse dto = new FeedbackResponse();
        dto.setId(feedback.getId());
        dto.setReviewer(toEmployeeBasic(feedback.getReviewer()));
        dto.setReviewee(toEmployeeBasic(feedback.getReviewee()));
        dto.setReviewYear(feedback.getReviewYear());
        dto.setReviewMonth(feedback.getReviewMonth());
        dto.setOverallRating(feedback.getOverallRating());
        dto.setType(feedback.getType());
        dto.setStatus(feedback.getStatus());
        dto.setCreatedAt(feedback.getCreatedAt());
        dto.setUpdatedAt(feedback.getUpdatedAt());

        if (feedback instanceof SelfReview sr) {
            dto.setAchievements(sr.getAchievements());
            dto.setChallenges(sr.getChallenges());
            dto.setSkillsLearned(sr.getSkillsLearned());
            dto.setAdditionalComments(sr.getAdditionalComments());
        } else if (feedback instanceof PeerFeedback pf) {
            dto.setCommunicationRating(pf.getCommunicationRating());
            dto.setTeamworkRating(pf.getTeamworkRating());
            dto.setKnowledgeSharingRating(pf.getKnowledgeSharingRating());
            dto.setComments(pf.getComments());
        } else if (feedback instanceof ManagerReview mr) {
            dto.setTechnicalSkillsRating(mr.getTechnicalSkillsRating());
            dto.setCommunicationRating(mr.getCommunicationRating());
            dto.setProductivityRating(mr.getProductivityRating());
            dto.setWorkQualityRating(mr.getWorkQualityRating());
            dto.setTeamworkRating(mr.getTeamworkRating());
            dto.setComments(mr.getComments());
            dto.setRecommendation(mr.getRecommendation());
            dto.setStrengths(mr.getStrengths());
            dto.setNeedsImprovement(mr.getNeedsImprovement());
        }

        return dto;
    }

    private EmployeeBasicResponse toEmployeeBasic(Employee employee) {
        if (employee == null) return null;
        EmployeeBasicResponse dto = new EmployeeBasicResponse();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        if (employee.getDepartment() != null) {
            dto.setDepartmentName(employee.getDepartment().getDepartmentName());
        }
        if (employee.getDesignation() != null) {
            dto.setDesignationTitle(employee.getDesignation().getDesignationName());
        }
        return dto;
    }
}
