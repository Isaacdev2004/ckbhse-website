import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { DrizzleLearningStore } from '@workspace/data/stores/learning';

export interface LearningAnalyticsData {
  readonly totalEnrollments: number;
  readonly completedCourses: number;
  readonly completionRate: number;
  readonly passedAssessments: number;
  readonly averageScore: number;
  readonly cpdTotalHours: number;
}

export class LearningAnalyticsService {
  constructor(
    private readonly store: DrizzleLearningStore,
    private readonly cpdSum: (context: AuthorizationContext) => Promise<number>,
  ) {}

  async getAnalytics(context: AuthorizationContext): Promise<LearningAnalyticsData> {
    const orgId = context.organizationId!;
    const [counts, cpdTotal] = await Promise.all([
      this.store.analyticsCounts(orgId),
      this.cpdSum(context),
    ]);

    const completionRate =
      counts.totalEnrollments > 0
        ? Math.round((counts.completedCourses / counts.totalEnrollments) * 100)
        : 0;

    return {
      totalEnrollments: counts.totalEnrollments,
      completedCourses: counts.completedCourses,
      completionRate,
      passedAssessments: counts.passedAssessments,
      averageScore: counts.averageScore,
      cpdTotalHours: cpdTotal,
    };
  }
}
