package com.nexushr.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("PEER_FEEDBACK")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PeerFeedback extends Feedback {

    private Integer communicationRating;
    private Integer teamworkRating;
    private Integer knowledgeSharingRating;
    private String comments;

}
