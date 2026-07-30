import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { ComplianceAnalyticsService } from '../../compliance/analytics.js';
import type { KpiProvider } from './types.js';

export class ComplianceKpiProvider implements KpiProvider {
  readonly domain = 'compliance' as const;

  constructor(private readonly analytics: ComplianceAnalyticsService) {}

  async collect(context: AuthorizationContext) {
    const executive = await this.analytics.getExecutiveDashboard(context);
    return [
      {
        key: 'compliance.score',
        domain: this.domain,
        label: 'Compliance score',
        value: executive.complianceScore,
        unit: 'score' as const,
      },
      {
        key: 'compliance.audit_completion',
        domain: this.domain,
        label: 'Audit completion',
        value: executive.widgets.auditCompletion,
        unit: 'percent' as const,
      },
      {
        key: 'compliance.inspection_completion',
        domain: this.domain,
        label: 'Inspection completion',
        value: executive.widgets.inspectionCompletion,
        unit: 'percent' as const,
      },
      {
        key: 'compliance.capa_completion',
        domain: this.domain,
        label: 'CAPA completion',
        value: executive.widgets.capaCompletion,
        unit: 'percent' as const,
      },
      {
        key: 'compliance.open_findings',
        domain: this.domain,
        label: 'Open findings',
        value: executive.widgets.openFindings,
        unit: 'count' as const,
      },
    ];
  }
}
