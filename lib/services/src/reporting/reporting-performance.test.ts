import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ReportingService } from './reporting.service.js';
import { KpiEngineService } from './kpi-engine.service.js';
import { KPI_REFRESH_SLA_MS } from './reporting-limits.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([PERMISSIONS.REPORT_READ, PERMISSIONS.REPORT_MANAGE]),
  roles: new Set<string>(),
} as const;

describe('reporting aggregate performance', () => {
  it('builds executive summary within SLA from snapshot reads', async () => {
    const snapshots = Array.from({ length: 16 }, (_, index) => ({
      snapshotPeriod: '2026-07',
      domain: 'compliance',
      kpiKey: `kpi.${index}`,
      label: `KPI ${index}`,
      valueNumeric: String(70 + index),
      unit: 'score',
      updatedAt: new Date('2026-07-01T00:00:00Z'),
    }));

    const reporting = {
      listKpiSnapshotsForPeriod: vi.fn(async () => snapshots),
      listKpiSnapshots: vi.fn(async () => []),
    };
    const kpiEngine = new KpiEngineService(reporting as never, []);
    const service = new ReportingService(reporting as never, kpiEngine);

    const started = performance.now();
    const summary = await service.getExecutiveSummary(ctx as never);
    const elapsed = performance.now() - started;

    expect(summary.domains.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(KPI_REFRESH_SLA_MS);
  });

  it('refreshes KPI snapshots within SLA with mocked providers', async () => {
    const reporting = {
      touchViewRegistry: async () => null,
      upsertKpiSnapshot: async () => null,
    };
    const providers = [
      {
        collect: async () =>
          Array.from({ length: 16 }, (_, index) => ({
            key: `kpi.${index}`,
            domain: 'compliance' as const,
            label: `KPI ${index}`,
            value: index,
            unit: 'count' as const,
          })),
      },
    ];
    const engine = new KpiEngineService(reporting as never, providers as never);

    const started = performance.now();
    const result = await engine.refreshSnapshots(ctx as never);
    const elapsed = performance.now() - started;

    expect(result.upserted).toBe(16);
    expect(elapsed).toBeLessThan(KPI_REFRESH_SLA_MS);
  });

  it('lists KPI definitions without database access', () => {
    const service = new ReportingService({} as never, {} as never);
    const started = performance.now();
    const definitions = service.listKpiDefinitions();
    const elapsed = performance.now() - started;

    expect(definitions.length).toBeGreaterThan(10);
    expect(elapsed).toBeLessThan(50);
  });
});
