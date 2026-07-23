package com.nexushr.entity;

import com.nexushr.enums.ManagerRecommendation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@DiscriminatorValue("MANAGER_REVIEW")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ManagerReview extends Feedback {

    private Integer technicalSkillsRating;
    private Integer communicationRating;
    private Integer productivityRating;
    private Integer workQualityRating;
    private Integer teamworkRating;
    private String comments;

    @Enumerated(EnumType.STRING)
    private ManagerRecommendation recommendation;

    @ElementCollection
    @CollectionTable(name = "manager_review_strengths", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "strength")
    private List<String> strengths;

    @ElementCollection
    @CollectionTable(name = "manager_review_improvements", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "improvement")
    private List<String> needsImprovement;

}
