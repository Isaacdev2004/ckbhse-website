import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ReportingService } from './reporting.service.js';
import { ReportBuilderService } from './report-builder.service.js';
import { ReportExportService } from './report-export.service.js';
import { BenchmarkService } from './benchmark.service.js';
import { KpiSubscriptionService } from './kpi-subscription.service.js';

const readContext = {
  actorKind: 'user' as const,
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([PERMISSIONS.REPORT_READ]),
  roles: new Set<string>(),
  metadata: {},
};

const noPermContext = {
  actorKind: 'user' as const,
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set<string>(),
  roles: new Set<string>(),
  metadata: {},
};

describe('reporting service RBAC matrix', () => {
  it('ReportingService.listKpis requires REPORT_READ', async () => {
    const reporting = { listKpiSnapshotsForPeriod: async () => [] };
    const service = new ReportingService(reporting as never, {} as never);
    await expect(service.listKpis(noPermContext as never)).rejects.toMatchObject({
      code: 'forbidden',
    });
  });

  it('ReportingService.refreshSnapshots requires REPORT_MANAGE', async () => {
    const kpiEngine = { refreshSnapshots: async () => ({ snapshotPeriod: '2026-07', upserted: 0, readings: [] }) };
    const service = new ReportingService({} as never, kpiEngine as never);
    await expect(async () => {
      await service.refreshSnapshots(readContext as never);
    }).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('ReportBuilderService.createReport requires REPORT_MANAGE', async () => {
    const service = new ReportBuilderService({} as never, {} as never);
    await expect(
      service.createReport(readContext as never, {
        reportKey: 'demo',
        title: 'Demo',
        domain: 'compliance',
        definition: { sourceType: 'kpi' },
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('ReportExportService.createExport requires REPORT_EXPORT', async () => {
    const service = new ReportExportService({} as never, {} as never, {} as never);
    await expect(
      service.createExport(
        { ...readContext, permissions: new Set([PERMISSIONS.REPORT_READ]) } as never,
        'demo',
      ),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('BenchmarkService.compareOrganization requires REPORT_READ', async () => {
    const service = new BenchmarkService({} as never);
    await expect(service.compareOrganization(noPermContext as never)).rejects.toMatchObject({
      code: 'forbidden',
    });
  });

  it('KpiSubscriptionService.createSubscription requires REPORT_MANAGE', async () => {
    const service = new KpiSubscriptionService({} as never);
    await expect(
      service.createSubscription(readContext as never, {
        subscriptionKey: 'low-score',
        kpiKey: 'compliance.score',
        domain: 'compliance',
        thresholdOperator: 'lt',
        thresholdValue: 80,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });
});
