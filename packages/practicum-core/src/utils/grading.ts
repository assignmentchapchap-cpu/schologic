
/**
 * Calculates the final weighted score for a rubric submission.
 * 
 * @param rawPoints The total points scored by the student (e.g. 45)
 * @param totalPossiblePoints The maximum possible points in the rubric (e.g. 50)
 * @param targetWeight The percentage weight this assessment contributes to the final grade (e.g. 50%)
 * @returns The weighted score (e.g. 45/50 * 50 = 45)
 */
export function calculateRubricScale(rawPoints: number, totalPossiblePoints: number, targetWeight: number): number {
    if (totalPossiblePoints === 0) return 0;

    // Logic: (Score / Total) * Weight
    const percentage = rawPoints / totalPossiblePoints;
    const weightedScore = percentage * targetWeight;

    // Round to 2 decimal places for neatness
    return Math.round(weightedScore * 100) / 100;
}
