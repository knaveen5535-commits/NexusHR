package com.nexushr.util;

public class PerformanceUtil {

    /**
     * Normalizes a 1-5 rating scale to a percentage (0-100)
     * 1 = 20%
     * 2 = 40%
     * 3 = 60%
     * 4 = 80%
     * 5 = 100%
     */
    public static double normalizeRatingToPercentage(Integer rating) {
        if (rating == null) {
            return 0.0;
        }
        int validRating = Math.max(1, Math.min(5, rating)); // Clamp between 1 and 5
        return validRating * 20.0;
    }

    /**
     * Reusable grade calculation
     */
    public static String calculateGrade(double finalScore) {
        if (finalScore >= 90) return "Outstanding";
        if (finalScore >= 80) return "Excellent";
        if (finalScore >= 70) return "Very Good";
        if (finalScore >= 60) return "Good";
        if (finalScore >= 50) return "Average";
        return "Needs Improvement";
    }
}
