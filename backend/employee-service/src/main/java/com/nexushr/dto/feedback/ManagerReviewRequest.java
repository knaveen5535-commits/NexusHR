package com.nexushr.dto.feedback;

import com.nexushr.enums.FeedbackStatus;
import com.nexushr.enums.ManagerRecommendation;
import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class ManagerReviewRequest {
    
    @NotNull(message = "Reviewee ID is required")
    private Long revieweeId;
    
    @NotNull(message = "Review year is required")
    private Integer reviewYear;
    
    @NotNull(message = "Review month is required")
    @Min(1) @Max(12)
    private Integer reviewMonth;
    
    @Min(1) @Max(5)
    private Integer technicalSkillsRating;
    
    @Min(1) @Max(5)
    private Integer communicationRating;
    
    @Min(1) @Max(5)
    private Integer productivityRating;
    
    @Min(1) @Max(5)
    private Integer workQualityRating;
    
    @Min(1) @Max(5)
    private Integer teamworkRating;
    
    @Min(1) @Max(5)
    private Integer overallRating;
    
    private String comments;
    
    private ManagerRecommendation recommendation;
    
    private List<String> strengths;
    
    private List<String> needsImprovement;
    
    @NotNull(message = "Status is required")
    private FeedbackStatus status;
}
