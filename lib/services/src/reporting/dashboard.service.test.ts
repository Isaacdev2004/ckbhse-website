import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { DashboardService } from './dashboard.service.js';
import { ReportingService } from './reporting.service.js';
import { KpiEngineService } from './kpi-engine.service.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: '00000000-0000-4000-8000-000000000010',
  permissions: new Set([
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.DASHBOARD_PERSONALIZE,
  ]),
  roles: new Set<string>(),
} as const;

describe('DashboardService', () => {
  it('lists widget catalog entries', () => {
    const service = new DashboardService({} as never, {} as never, null);
    expect(service.listWidgetCatalog()).toHaveLength(6);
  });

  it('resolves executive dashboard widgets', async () => {
    const reporting = {
      getDashboardDefinition: vi.fn(async () => ({
        id: '00000000-0000-4000-8000-000000000901',
        dashboardKey: 'executive',
        title: 'Executive Overview',
        description: 'Cross-platform KPI rollup',
        domain: 'platform',
        isDefault: true,
      })),
      listDashboardWidgets: vi.fn(async () => [
        {
          widgetKey: 'overall_score',
          widgetType: 'metric',
          title: 'Overall Score',
          config: { dataBinding: 'executive:overallScore' },
          defaultOrder: 0,
          colSpan: 1,
        },
        {
          widgetKey: 'domain_scores',
          widgetType: 'chart',
          title: 'Domain Performance',
          config: { dataBinding: 'executive:domains', chartType: 'bar' },
          defaultOrder: 1,
          colSpan: 2,
        },
      ]),
      getUserDashboardLayout: vi.fn(async () => null),
      listKpiSnapshots: vi.fn(async () => []),
      listDashboardDefinitions: vi.fn(async () => []),
      saveUserDashboardLayout: vi.fn(async () => null),
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
      ]),
      listKpiSnapshots: vi.fn(async () => []),
      listViewRegistry: vi.fn(async () => []),
      listReportDefinitions: vi.fn(async () => []),
      touchViewRegistry: vi.fn(async () => null),
      upsertKpiSnapshot: vi.fn(async () => null),
    };

    const kpiEngine = new KpiEngineService(reportingRepo as never, []);
    const reportingService = new ReportingService(reportingRepo as never, kpiEngine);
    const service = new DashboardService(
      reporting as never,
      reportingService,
      null,
    );

    const dashboard = await service.getDashboard(ctx as never, 'executive');
    expect(dashboard.dashboardKey).toBe('executive');
    expect(dashboard.widgets).toHaveLength(2);
    expect(dashboard.widgets[0]?.data).toMatchObject({ value: 82 });
    expect(dashboard.widgets[1]?.data).toMatchObject({
      points: [{ label: 'compliance', value: 82 }],
    });
  });

  it('saves personalized layout', async () => {
    const layout = [
      { widgetKey: 'overall_score', order: 1, visible: true, colSpan: 1 },
    ];
    const reporting = {
      getDashboardDefinition: vi.fn(async () => ({
        id: 'dash-1',
        dashboardKey: 'executive',
        title: 'Executive Overview',
        description: null,
        domain: 'platform',
        isDefault: true,
      })),
      saveUserDashboardLayout: vi.fn(async () => ({
        updatedAt: new Date('2026-07-30T00:00:00Z'),
      })),
    };

    const service = new DashboardService(
      reporting as never,
      {} as never,
      null,
    );

    const saved = await service.saveUserLayout(ctx as never, 'executive', layout);
    expect(saved.layout).toEqual(layout);
    expect(reporting.saveUserDashboardLayout).toHaveBeenCalled();
  });
});
