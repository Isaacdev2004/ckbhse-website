import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { LearningAnalyticsService } from '../../learning/learning-analytics.service.js';
import type { KpiProvider } from './types.js';

export class LearningKpiProvider implements KpiProvider {
  readonly domain = 'learning' as const;

  constructor(private readonly analytics: LearningAnalyticsService) {}

  async collect(context: AuthorizationContext) {
    const data = await this.analytics.getAnalytics(context);
    return [
      {
        key: 'learning.completion_rate',
        domain: this.domain,
        label: 'Training completion rate',
        value: data.completionRate,
        unit: 'percent' as const,
      },
      {
        key: 'learning.enrolments',
        domain: this.domain,
        label: 'Total enrolments',
        value: data.totalEnrollments,
        unit: 'count' as const,
      },
      {
        key: 'learning.cpd_hours',
        domain: this.domain,
        label: 'CPD hours',
        value: data.cpdTotalHours,
        unit: 'hours' as const,
      },
    ];
  }
}
