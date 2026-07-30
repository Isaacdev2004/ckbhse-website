import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ReportingRepository } from './reporting.repository.js';

const ORG_A = '00000000-0000-4000-8000-000000000002';
const ORG_B = '00000000-0000-4000-8000-000000000003';

function contextFor(orgId: string) {
  return {
    organizationId: orgId,
    userId: 'user-1',
    permissions: new Set([PERMISSIONS.REPORT_READ]),
    roles: new Set<string>(),
  } as const;
}

describe('reporting tenant isolation', () => {
  it('scopes KPI snapshot reads to caller organization', async () => {
    const store = {
      listKpiSnapshotsForPeriod: vi.fn(async (organizationId: string) => [
        { organizationId, kpiKey: 'compliance.score' },
      ]),
    };
    const repository = new ReportingRepository(store as never);

    await repository.listKpiSnapshotsForPeriod(contextFor(ORG_A) as never, '2026-07');
    await repository.listKpiSnapshotsForPeriod(contextFor(ORG_B) as never, '2026-07');

    expect(store.listKpiSnapshotsForPeriod).toHaveBeenNthCalledWith(1, ORG_A, '2026-07');
    expect(store.listKpiSnapshotsForPeriod).toHaveBeenNthCalledWith(2, ORG_B, '2026-07');
  });

  it('requires organization context for export job listing', () => {
    const store = { listExportJobs: vi.fn(async () => []) };
    const repository = new ReportingRepository(store as never);

    expect(() =>
      repository.listExportJobs({
        userId: 'user-1',
        permissions: new Set([PERMISSIONS.REPORT_READ]),
        roles: new Set<string>(),
      } as never),
    ).toThrow(/Organization context is required/);
  });

  it('does not expose benchmark cohorts through org-scoped store methods', async () => {
    const store = {
      listBenchmarkCohorts: vi.fn(async () => [{ cohortKey: 'uk-hseq-mid-market' }]),
    };
    const repository = new ReportingRepository(store as never);

    const cohorts = await repository.listBenchmarkCohorts(contextFor(ORG_A) as never);
    expect(cohorts).toHaveLength(1);
    expect(store.listBenchmarkCohorts).toHaveBeenCalledWith();
  });
});
