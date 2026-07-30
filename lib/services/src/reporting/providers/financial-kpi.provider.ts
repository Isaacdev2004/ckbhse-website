import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { KpiProvider } from './types.js';

/** Placeholder KPIs until the finance module lands. */
export class FinancialKpiProvider implements KpiProvider {
  readonly domain = 'financial' as const;

  collect(_context: AuthorizationContext) {
    return Promise.resolve([
      {
        key: 'financial.revenue_mtd',
        domain: this.domain,
        label: 'Revenue MTD',
        value: 0,
        unit: 'currency' as const,
        metadata: { placeholder: true },
      },
      {
        key: 'financial.outstanding_invoices',
        domain: this.domain,
        label: 'Outstanding invoices',
        value: 0,
        unit: 'count' as const,
        metadata: { placeholder: true },
      },
    ]);
  }
}
