import {
  calculateEngagementScore,
  getEngagementCategory,
  getEngagementTrend,
  normalizeEngagementWeights,
  DEFAULT_ENGAGEMENT_WEIGHTS,
} from "@/lib/engagementScore";

describe("Engagement score engine", () => {
  it("calculates an overall score from weighted components", () => {
    const result = calculateEngagementScore({
      attendanceScore: 80,
      activityScore: 90,
      assignmentScore: 70,
      academicScore: 85,
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.weights).toEqual(DEFAULT_ENGAGEMENT_WEIGHTS);
  });

  it("applies dynamic weights correctly", () => {
    const result = calculateEngagementScore(
      {
        attendanceScore: 90,
        activityScore: 60,
        assignmentScore: 80,
        academicScore: 70,
      },
      { attendance: 0.4, activity: 0.1, assignment: 0.3, academic: 0.2 }
    );

    expect(result.overallScore).toBe(82);
  });

  it("normalizes weights when values do not sum to 1", () => {
    const normalized = normalizeEngagementWeights({
      attendance: 2,
      activity: 2,
      assignment: 1,
      academic: 1,
    });

    expect(normalized.attendance + normalized.activity + normalized.assignment + normalized.academic).toBeCloseTo(1);
  });

  it.each([
    [95, "Excellent"],
    [82, "Good"],
    [65, "Moderate"],
    [59, "Needs Attention"],
  ])("assigns category %s for score %i", (score, expected) => {
    expect(getEngagementCategory(score)).toBe(expected);
  });

  it("generates a trend summary from history", () => {
    const history = [
      { calculatedAt: "2026-05-01T00:00:00.000Z", overallScore: 70 },
      { calculatedAt: "2026-05-08T00:00:00.000Z", overallScore: 78 },
      { calculatedAt: "2026-05-15T00:00:00.000Z", overallScore: 84 },
    ];

    const trend = getEngagementTrend(history);

    expect(trend.trend).toBe("improving");
    expect(trend.change).toBe(6);
    expect(trend.history).toHaveLength(3);
    expect(trend.latest.score).toBe(84);
  });
});
