import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { BenchmarkService } from './benchmark.service.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([PERMISSIONS.REPORT_READ]),
  roles: new Set<string>(),
} as const;

describe('BenchmarkService', () => {
  it('compares organization KPIs to cohort medians', async () => {
    const reporting = {
      listBenchmarkMetrics: vi.fn(async () => [
        {
          cohortKey: 'uk-hseq-mid-market',
          domain: 'compliance',
          kpiKey: 'compliance.score',
          percentile25: '72',
          percentile50: '78',
          percentile75: '85',
          sampleSize: 48,
          snapshotPeriod: '2026-07',
        },
      ]),
      listKpiSnapshotsForPeriod: vi.fn(async () => [
        {
          kpiKey: 'compliance.score',
          valueNumeric: '82',
        },
      ]),
    };

    const service = new BenchmarkService(reporting as never);
    const result = await service.compareOrganization(ctx as never, 'uk-hseq-mid-market', '2026-07');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.organizationValue).toBe(82);
    expect(result.items[0]?.performanceBand).toBe('at');
  });
});
