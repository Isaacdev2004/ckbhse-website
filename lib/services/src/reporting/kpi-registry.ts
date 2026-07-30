import type {
  KpiDefinition,
  KpiReading,
  ReportingDomain,
} from '@workspace/domain/reporting';

/** Code-first KPI catalogue — database stores snapshots, not definitions. */
export const KPI_REGISTRY: readonly KpiDefinition[] = Object.freeze([
  {
    key: 'compliance.score',
    domain: 'compliance',
    label: 'Compliance score',
    unit: 'score',
    description: 'Organisation-wide compliance score',
  },
  {
    key: 'compliance.audit_completion',
    domain: 'compliance',
    label: 'Audit completion',
    unit: 'percent',
  },
  {
    key: 'compliance.inspection_completion',
    domain: 'compliance',
    label: 'Inspection completion',
    unit: 'percent',
  },
  {
    key: 'compliance.capa_completion',
    domain: 'compliance',
    label: 'CAPA completion',
    unit: 'percent',
  },
  {
    key: 'compliance.open_findings',
    domain: 'compliance',
    label: 'Open findings',
    unit: 'count',
  },
  {
    key: 'audit.completion_rate',
    domain: 'audit',
    label: 'Audit completion rate',
    unit: 'percent',
  },
  {
    key: 'audit.open_findings',
    domain: 'audit',
    label: 'Open audit findings',
    unit: 'count',
  },
  {
    key: 'audit.overdue',
    domain: 'audit',
    label: 'Overdue audits',
    unit: 'count',
  },
  {
    key: 'crm.open_leads',
    domain: 'crm',
    label: 'Open leads',
    unit: 'count',
  },
  {
    key: 'crm.conversion_rate',
    domain: 'crm',
    label: 'Lead conversion rate',
    unit: 'percent',
  },
  {
    key: 'crm.avg_response_minutes',
    domain: 'crm',
    label: 'Average response time',
    unit: 'hours',
  },
  {
    key: 'learning.completion_rate',
    domain: 'learning',
    label: 'Training completion rate',
    unit: 'percent',
  },
  {
    key: 'learning.enrolments',
    domain: 'learning',
    label: 'Total enrolments',
    unit: 'count',
  },
  {
    key: 'learning.cpd_hours',
    domain: 'learning',
    label: 'CPD hours',
    unit: 'hours',
  },
  {
    key: 'financial.revenue_mtd',
    domain: 'financial',
    label: 'Revenue MTD',
    unit: 'currency',
    description: 'Placeholder until finance module',
  },
  {
    key: 'financial.outstanding_invoices',
    domain: 'financial',
    label: 'Outstanding invoices',
    unit: 'count',
    description: 'Placeholder until finance module',
  },
]);

export function definitionsForDomain(domain: ReportingDomain): readonly KpiDefinition[] {
  return KPI_REGISTRY.filter((definition) => definition.domain === domain);
}

export function findKpiDefinition(key: string): KpiDefinition | undefined {
  return KPI_REGISTRY.find((definition) => definition.key === key);
}

export function snapshotPeriodKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function computeTrendDirection(
  current: number,
  previous: number | null,
): { direction: 'up' | 'down' | 'stable'; delta: number } {
  if (previous === null) {
    return { direction: 'stable', delta: 0 };
  }
  const delta = Math.round((current - previous) * 100) / 100;
  if (delta > 0) return { direction: 'up', delta };
  if (delta < 0) return { direction: 'down', delta };
  return { direction: 'stable', delta: 0 };
}

export type { KpiReading };
