import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ReportBuilderService } from './report-builder.service.js';
import { ReportingService } from './reporting.service.js';
import { KpiEngineService } from './kpi-engine.service.js';
import { MAX_REPORT_EXPORT_ROWS } from './reporting-limits.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: '00000000-0000-4000-8000-000000000010',
  permissions: new Set([PERMISSIONS.REPORT_READ, PERMISSIONS.REPORT_MANAGE]),
  roles: new Set<string>(),
} as const;

describe('ReportBuilderService', () => {
  it('runs a KPI report with domain filters', async () => {
    const reporting = {
      getReportDefinition: vi.fn(async () => ({
        id: 'report-1',
        reportKey: 'compliance-kpi-summary',
        title: 'Compliance KPI Summary',
        domain: 'compliance',
        definition: {
          sourceType: 'kpi',
          filters: { domain: 'compliance' },
          columns: ['label', 'value', 'unit'],
        },
        createdBy: null,
        createdAt: new Date('2026-07-01T00:00:00Z'),
        updatedAt: new Date('2026-07-01T00:00:00Z'),
      })),
      listReportDefinitions: vi.fn(async () => []),
      createReportDefinition: vi.fn(async () => null),
      updateReportDefinition: vi.fn(async () => null),
      deleteReportDefinition: vi.fn(async () => null),
    };

    const reportingRepo = {
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
        {
          snapshotPeriod: '2026-07',
          domain: 'audit',
          kpiKey: 'audit.overdue',
          label: 'Overdue audits',
          valueNumeric: '2',
          unit: 'count',
          updatedAt: new Date('2026-07-01T00:00:00Z'),
        },
      ]),
      listKpiSnapshots: vi.fn(async () => []),
      listViewRegistry: vi.fn(async () => []),
      listReportDefinitions: vi.fn(async () => []),
      touchViewRegistry: vi.fn(async () => null),
      upsertKpiSnapshot: vi.fn(async () => null),
    };

    const kpiEngine = new KpiEngineService(reportingRepo as never, []);
    const reportingService = new ReportingService(reportingRepo as never, kpiEngine);
    const service = new ReportBuilderService(reporting as never, reportingService);

    const result = await service.runReport(ctx as never, 'compliance-kpi-summary');
    expect(result.sourceType).toBe('kpi');
    expect(result.rowCount).toBe(1);
    expect(result.rows[0]).toMatchObject({ label: 'Compliance score', value: 82 });
  });

  it('creates a report definition', async () => {
    const reporting = {
      getReportDefinition: vi.fn(async () => null),
      createReportDefinition: vi.fn(async () => ({
        id: 'report-2',
        reportKey: 'audit-summary',
        title: 'Audit Summary',
        domain: 'audit',
        definition: { sourceType: 'kpi', filters: { domain: 'audit' } },
        createdBy: ctx.userId,
        createdAt: new Date('2026-07-30T00:00:00Z'),
        updatedAt: new Date('2026-07-30T00:00:00Z'),
      })),
    };

    const service = new ReportBuilderService(reporting as never, {} as never);
    const created = await service.createReport(ctx as never, {
      reportKey: 'audit-summary',
      title: 'Audit Summary',
      domain: 'audit',
      definition: { sourceType: 'kpi', filters: { domain: 'audit' } },
    });

    expect(created.reportKey).toBe('audit-summary');
    expect(reporting.createReportDefinition).toHaveBeenCalled();
  });

  it('rejects invalid report keys', async () => {
    const service = new ReportBuilderService({} as never, {} as never);
    await expect(
      service.createReport(ctx as never, {
        reportKey: 'Invalid Key!',
        title: 'Bad',
        domain: 'audit',
        definition: { sourceType: 'kpi' },
      }),
    ).rejects.toThrow(/Report key must be lowercase/);
  });

  it('rejects reports exceeding export row limit', async () => {
    const reporting = {
      getReportDefinition: vi.fn(async () => ({
        id: 'report-1',
        reportKey: 'large-report',
        title: 'Large Report',
        domain: 'compliance',
        definition: { sourceType: 'kpi' },
        createdBy: null,
        createdAt: new Date('2026-07-01T00:00:00Z'),
        updatedAt: new Date('2026-07-01T00:00:00Z'),
      })),
    };

    const rows = Array.from({ length: MAX_REPORT_EXPORT_ROWS + 1 }, (_, index) => ({
      snapshotPeriod: '2026-07',
      domain: 'compliance',
      kpiKey: `kpi.${index}`,
      label: `KPI ${index}`,
      valueNumeric: '1',
      unit: 'count',
      updatedAt: new Date('2026-07-01T00:00:00Z'),
    }));

    const reportingRepo = {
      listKpiSnapshotsForPeriod: vi.fn(async () => rows),
      listKpiSnapshots: vi.fn(async () => []),
    };

    const kpiEngine = new KpiEngineService(reportingRepo as never, []);
    const reportingService = new ReportingService(reportingRepo as never, kpiEngine);
    const service = new ReportBuilderService(reporting as never, reportingService);

    await expect(service.runReport(ctx as never, 'large-report')).rejects.toMatchObject({
      code: 'payload_too_large',
    });
  });
});
