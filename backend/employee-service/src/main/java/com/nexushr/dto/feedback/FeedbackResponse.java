package com.nexushr.dto.feedback;

import com.nexushr.dto.EmployeeBasicResponse;
import com.nexushr.enums.FeedbackStatus;
import com.nexushr.enums.FeedbackType;
import com.nexushr.enums.ManagerRecommendation;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FeedbackResponse {
    private Long id;
    private EmployeeBasicResponse reviewer;
    private EmployeeBasicResponse reviewee;
    private Integer reviewYear;
    private Integer reviewMonth;
    private Integer overallRating;
    private FeedbackType type;
    private FeedbackStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Self Review specific
    private String achievements;
    private String challenges;
    private String skillsLearned;
    private String additionalComments;

    // Peer & Manager Review shared
    private Integer communicationRating;
    private Integer teamworkRating;
    private String comments;

    // Peer Review specific
    private Integer knowledgeSharingRating;

    // Manager Review specific
    private Integer technicalSkillsRating;
    private Integer productivityRating;
    private Integer workQualityRating;
    private ManagerRecommendation recommendation;
    private List<String> strengths;
    private List<String> needsImprovement;
}
