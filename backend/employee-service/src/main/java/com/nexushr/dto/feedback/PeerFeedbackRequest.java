package com.nexushr.dto.feedback;

import com.nexushr.enums.FeedbackStatus;
import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class PeerFeedbackRequest {
    
    @NotNull(message = "Reviewee ID is required")
    private Long revieweeId;
    
    @NotNull(message = "Review year is required")
    private Integer reviewYear;
    
    @NotNull(message = "Review month is required")
    @Min(1) @Max(12)
    private Integer reviewMonth;
    
    @Min(1) @Max(5)
    private Integer communicationRating;
    
    @Min(1) @Max(5)
    private Integer teamworkRating;
    
    @Min(1) @Max(5)
    private Integer knowledgeSharingRating;
    
    @Min(1) @Max(5)
    private Integer overallRating;
    
    private String comments;
    
    @NotNull(message = "Status is required")
    private FeedbackStatus status;
}
