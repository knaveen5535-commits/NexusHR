package com.nexushr.dto.feedback;

import com.nexushr.enums.FeedbackStatus;
import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class SelfReviewRequest {
    
    @NotNull(message = "Review year is required")
    private Integer reviewYear;
    
    @NotNull(message = "Review month is required")
    @Min(1) @Max(12)
    private Integer reviewMonth;

    @Min(1) @Max(5)
    private Integer overallRating;
    
    private String achievements;
    private String challenges;
    private String skillsLearned;
    private String additionalComments;
    
    @NotNull(message = "Status is required")
    private FeedbackStatus status; // DRAFT or SUBMITTED
}
