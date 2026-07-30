import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  BenchmarkComparisonResult,
  BenchmarkCohortSummary,
} from '@workspace/domain/reporting';
import { findKpiDefinition, snapshotPeriodKey } from './kpi-registry.js';
import { percentileRank } from './trend-analysis.js';

export class BenchmarkService {
  constructor(private readonly reporting: ReportingRepository) {}

  async listCohorts(context: AuthorizationContext): Promise<BenchmarkCohortSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listBenchmarkCohorts(context);
    return rows.map((row) => ({
      cohortKey: row.cohortKey,
      label: row.label,
      industry: row.industry,
      description: row.description,
    }));
  }

  async compareOrganization(
    context: AuthorizationContext,
    cohortKey = 'uk-hseq-mid-market',
    snapshotPeriod?: string,
  ): Promise<BenchmarkComparisonResult> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const period = snapshotPeriod ?? snapshotPeriodKey();
    const [orgSnapshots, benchmarkMetrics] = await Promise.all([
      this.reporting.listKpiSnapshotsForPeriod(context, period),
      this.reporting.listBenchmarkMetrics(context, cohortKey, period),
    ]);

    if (benchmarkMetrics.length === 0) {
      throw AppError.notFound('Benchmark cohort metrics were not found');
    }

    const items = benchmarkMetrics.map((metric) => {
      const orgRow = orgSnapshots.find((row) => row.kpiKey === metric.kpiKey);
      const organizationValue = orgRow ? Number(orgRow.valueNumeric) : 0;
      const cohortMedian = Number(metric.percentile50);
      const p25 = Number(metric.percentile25);
      const p75 = Number(metric.percentile75);
      const rank = percentileRank(organizationValue, p25, cohortMedian, p75);
      const gapToMedian = Math.round((organizationValue - cohortMedian) * 100) / 100;
      const definition = findKpiDefinition(metric.kpiKey);

      let performanceBand: 'below' | 'at' | 'above' = 'at';
      if (organizationValue < p25) performanceBand = 'below';
      else if (organizationValue > p75) performanceBand = 'above';

      return {
        kpiKey: metric.kpiKey,
        domain: metric.domain,
        label: definition?.label ?? metric.kpiKey,
        organizationValue,
        cohortMedian,
        percentileRank: rank,
        gapToMedian,
        performanceBand,
      };
    });

    return { cohortKey, snapshotPeriod: period, items };
  }
}

export function createBenchmarkService(deps: { reporting: ReportingRepository }) {
  return new BenchmarkService(deps.reporting);
}
