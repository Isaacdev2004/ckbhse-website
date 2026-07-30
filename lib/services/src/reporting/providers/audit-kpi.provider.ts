import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { AuditRepository } from '@workspace/data/repositories/audit';
import type { KpiProvider } from './types.js';

export class AuditKpiProvider implements KpiProvider {
  readonly domain = 'audit' as const;

  constructor(private readonly audit: AuditRepository) {}

  async collect(context: AuthorizationContext) {
    const counts = await this.audit.dashboardCounts(context);
    const completionRate =
      counts.total > 0 ? Math.round((counts.closed / counts.total) * 100) : 0;

    return [
      {
        key: 'audit.completion_rate',
        domain: this.domain,
        label: 'Audit completion rate',
        value: completionRate,
        unit: 'percent' as const,
      },
      {
        key: 'audit.open_findings',
        domain: this.domain,
        label: 'Open audit findings',
        value: counts.openFindings,
        unit: 'count' as const,
      },
      {
        key: 'audit.overdue',
        domain: this.domain,
        label: 'Overdue audits',
        value: counts.scheduled,
        unit: 'count' as const,
        metadata: { scheduled: counts.scheduled, inProgress: counts.inProgress },
      },
    ];
  }
}
