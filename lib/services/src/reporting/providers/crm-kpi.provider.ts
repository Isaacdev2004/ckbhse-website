import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { DashboardService } from '../../crm/dashboard.service.js';
import type { KpiProvider } from './types.js';

export class CrmKpiProvider implements KpiProvider {
  readonly domain = 'crm' as const;

  constructor(private readonly dashboard: DashboardService) {}

  async collect(context: AuthorizationContext) {
    const metrics = await this.dashboard.getMetrics(context);
    const closed = metrics.won + metrics.lost;
    const conversionRate =
      closed > 0 ? Math.round((metrics.won / closed) * 100) : 0;
    const avgResponseHours =
      metrics.averageResponseMinutes !== null
        ? Math.round((metrics.averageResponseMinutes / 60) * 100) / 100
        : 0;

    return [
      {
        key: 'crm.open_leads',
        domain: this.domain,
        label: 'Open leads',
        value: metrics.openLeads,
        unit: 'count' as const,
      },
      {
        key: 'crm.conversion_rate',
        domain: this.domain,
        label: 'Lead conversion rate',
        value: conversionRate,
        unit: 'percent' as const,
      },
      {
        key: 'crm.avg_response_minutes',
        domain: this.domain,
        label: 'Average response time',
        value: avgResponseHours,
        unit: 'hours' as const,
        metadata: {
          averageResponseMinutes: metrics.averageResponseMinutes,
        },
      },
    ];
  }
}
