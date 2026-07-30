import { describe, expect, it } from 'vitest';
import { LearningService } from './learning.service.js';
import { LearningAnalyticsService } from './learning-analytics.service.js';
import { CourseRecommendationService } from './course-recommendation.service.js';

describe('LearningService', () => {
  it('returns catalogue from M1 content', () => {
    const service = new LearningService({} as never);
    const items = service.getCatalogue();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.title).toBeTruthy();
  });

  it('maps dashboard from repositories', async () => {
    const service = new LearningService({
      enrollment: {
        list: async () => [
          { id: 'e-1', status: 'active', isMandatory: true, pathwayId: 'p-1' },
        ],
      },
      learning: {
        listProgress: async () => [
          { enrollmentId: 'e-1', status: 'in_progress' },
        ],
        listPathways: async () => [{ id: 'p-1', title: 'Pathway' }],
        listPathwayCourses: async () => [{ id: 'c-1' }],
      },
      session: { list: async () => [] },
      certificate: { countExpiring: async () => 2, list: async () => [] },
      cpd: { sumHours: async () => 12 },
      assessment: {},
      trainer: {},
      transcript: {},
    } as never);

    const dashboard = await service.getDashboard({
      userId: 'user-1',
      organizationId: 'org-1',
      permissions: [],
      roles: [],
      sessionId: 's-1',
      metadata: { requestId: 'r-1' },
    } as never);

    expect(dashboard.currentEnrollments).toBe(1);
    expect(dashboard.cpdHoursEarned).toBe(12);
    expect(dashboard.expiringCertificates).toBe(2);
  });
});

describe('LearningAnalyticsService', () => {
  it('computes completion rate', async () => {
    const service = new LearningAnalyticsService(
      {
        analyticsCounts: async () => ({
          totalEnrollments: 10,
          completedCourses: 7,
          passedAssessments: 5,
          averageScore: 82,
        }),
      } as never,
      async () => 24,
    );
    const analytics = await service.getAnalytics({ organizationId: 'org-1' } as never);
    expect(analytics.completionRate).toBe(70);
    expect(analytics.cpdTotalHours).toBe(24);
  });
});

describe('CourseRecommendationService', () => {
  it('recommends courses not yet enrolled', async () => {
    const service = new CourseRecommendationService({
      list: async () => [
        {
          courseCategory: 'health-safety',
          courseSlug: 'iosh-managing-safely',
        },
      ],
    } as never);
    const items = await service.recommend({
      userId: 'user-1',
      organizationId: 'org-1',
    } as never);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.title.length > 0)).toBe(true);
  });
});
