import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ReportingService } from './reporting.service.js';
import { KpiEngineService } from './kpi-engine.service.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([PERMISSIONS.REPORT_READ, PERMISSIONS.REPORT_MANAGE]),
  roles: new Set<string>(),
} as const;

describe('ReportingService', () => {
  it('returns executive summary from KPI snapshots', async () => {
    const reporting = {
      listKpiSnapshotsForPeriod: vi.fn(async () => [
        {
          snapshotPeriod: '2026-07',
          domain: 'compliance',
          kpiKey: 'compliance.score',
          label: 'Compliance score',
          valueNumeric: '82',
          unit: 'score',
          updatedAt: new Date('2026-07-01T00:00:00Z'),
        },
      ]),
      listKpiSnapshots: vi.fn(async () => []),
      listViewRegistry: vi.fn(async () => []),
      listReportDefinitions: vi.fn(async () => []),
      touchViewRegistry: vi.fn(async () => null),
      upsertKpiSnapshot: vi.fn(async () => null),
    };

    const kpiEngine = new KpiEngineService(reporting as never, []);
    const service = new ReportingService(reporting as never, kpiEngine);

    const summary = await service.getExecutiveSummary(ctx as never);
    expect(summary.overallScore).toBe(82);
    expect(summary.domains).toHaveLength(1);
    expect(summary.highlights).toHaveLength(1);
  });

  it('lists KPI definitions from registry', () => {
    const service = new ReportingService({} as never, {} as never);
    expect(service.listKpiDefinitions().length).toBeGreaterThan(10);
  });
});
