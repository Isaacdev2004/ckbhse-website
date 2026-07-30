import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  DashboardLayoutItem,
  DashboardSummary,
  DashboardView,
  DashboardWidgetDefinition,
  DashboardWidgetType,
  KpiSnapshotSummary,
  ReportingDomain,
  ResolvedDashboardWidget,
  UserDashboardLayout,
  WidgetCatalogEntry,
} from '@workspace/domain/reporting';
import { WIDGET_CATALOG } from './widget-catalog.js';
import type { ReportingService } from './reporting.service.js';
import type { RiskService } from '../risk/index.js';

type WidgetRow = {
  widgetKey: string;
  widgetType: string;
  title: string;
  config: unknown;
  defaultOrder: number;
  colSpan: number;
};

function parseDataBinding(config: Record<string, unknown> | unknown): string {
  if (typeof config !== 'object' || config === null) return '';
  const binding = (config as Record<string, unknown>).dataBinding;
  return typeof binding === 'string' ? binding : '';
}

function defaultLayout(widgets: WidgetRow[]): DashboardLayoutItem[] {
  return widgets.map((widget) => ({
    widgetKey: widget.widgetKey,
    order: widget.defaultOrder,
    visible: true,
    colSpan: widget.colSpan,
  }));
}

function mergeLayout(
  widgets: WidgetRow[],
  saved: DashboardLayoutItem[] | null,
): DashboardLayoutItem[] {
  if (!saved || saved.length === 0) {
    return defaultLayout(widgets);
  }

  const byKey = new Map(saved.map((item) => [item.widgetKey, item]));
  const merged = widgets.map((widget) => {
    const existing = byKey.get(widget.widgetKey);
    return {
      widgetKey: widget.widgetKey,
      order: existing?.order ?? widget.defaultOrder,
      visible: existing?.visible ?? true,
      colSpan: existing?.colSpan ?? widget.colSpan,
    };
  });

  return merged.sort((a, b) => a.order - b.order);
}

export class DashboardService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly reportingService: ReportingService,
    private readonly riskService: RiskService | null,
  ) {}

  listWidgetCatalog(): readonly WidgetCatalogEntry[] {
    return WIDGET_CATALOG;
  }

  async listDashboards(context: AuthorizationContext): Promise<DashboardSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listDashboardDefinitions(context);
    return rows.map((row) => ({
      dashboardKey: row.dashboardKey,
      title: row.title,
      description: row.description,
      domain: (row.domain as ReportingDomain | null) ?? null,
      isDefault: row.isDefault,
    }));
  }

  async getDashboard(
    context: AuthorizationContext,
    dashboardKey: string,
  ): Promise<DashboardView> {
    requirePermission(context, PERMISSIONS.REPORT_READ);

    const definition = await this.reporting.getDashboardDefinition(
      context,
      dashboardKey,
    );
    if (!definition) {
      throw AppError.notFound(`Dashboard "${dashboardKey}" was not found`);
    }

    const widgetRows = await this.reporting.listDashboardWidgets(
      context,
      definition.id,
    );
    const savedLayout = await this.reporting.getUserDashboardLayout(
      context,
      dashboardKey,
    );
    const layout = mergeLayout(
      widgetRows,
      (savedLayout?.layout as DashboardLayoutItem[] | undefined) ?? null,
    );

    const [executiveSummary, kpis, kpiHistory] = await Promise.all([
      this.reportingService.getExecutiveSummary(context),
      this.reportingService.listKpis(context),
      this.reporting.listKpiSnapshots(context, 500),
    ]);

    const heatmap =
      widgetRows.some(
        (widget) => parseDataBinding(widget.config) === 'risk:heatmap',
      ) && this.riskService
        ? await this.riskService.getHeatMap(context).catch(() => null)
        : null;

    const widgets: ResolvedDashboardWidget[] = layout
      .filter((item) => item.visible)
      .map((item) => {
        const row = widgetRows.find((widget) => widget.widgetKey === item.widgetKey);
        if (!row) {
          throw AppError.internal(`Missing widget definition for ${item.widgetKey}`);
        }

        const definition: DashboardWidgetDefinition = {
          widgetKey: row.widgetKey,
          widgetType: row.widgetType as DashboardWidgetType,
          title: row.title,
          config: (row.config as Record<string, unknown>) ?? {},
          defaultOrder: row.defaultOrder,
          colSpan: row.colSpan,
        };

        return {
          ...definition,
          order: item.order,
          visible: item.visible,
          colSpan: item.colSpan,
          data: this.resolveWidgetData(
            definition,
            executiveSummary,
            kpis,
            kpiHistory,
            heatmap,
          ),
        };
      });

    return {
      dashboardKey: definition.dashboardKey,
      title: definition.title,
      description: definition.description,
      domain: (definition.domain as ReportingDomain | null) ?? null,
      snapshotPeriod: executiveSummary.snapshotPeriod,
      widgets,
      layout,
    };
  }

  async getUserLayout(
    context: AuthorizationContext,
    dashboardKey: string,
  ): Promise<UserDashboardLayout | null> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const definition = await this.reporting.getDashboardDefinition(
      context,
      dashboardKey,
    );
    if (!definition) {
      throw AppError.notFound(`Dashboard "${dashboardKey}" was not found`);
    }

    const saved = await this.reporting.getUserDashboardLayout(context, dashboardKey);
    if (!saved) {
      const widgets = await this.reporting.listDashboardWidgets(context, definition.id);
      return {
        dashboardKey,
        layout: defaultLayout(widgets),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      dashboardKey,
      layout: (saved.layout as DashboardLayoutItem[]) ?? [],
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  async saveUserLayout(
    context: AuthorizationContext,
    dashboardKey: string,
    layout: DashboardLayoutItem[],
  ): Promise<UserDashboardLayout> {
    requirePermission(context, PERMISSIONS.DASHBOARD_PERSONALIZE);
    const definition = await this.reporting.getDashboardDefinition(
      context,
      dashboardKey,
    );
    if (!definition) {
      throw AppError.notFound(`Dashboard "${dashboardKey}" was not found`);
    }

    const row = await this.reporting.saveUserDashboardLayout(
      context,
      dashboardKey,
      layout,
    );
    if (!row) {
      throw AppError.internal('Failed to save dashboard layout');
    }

    return {
      dashboardKey,
      layout,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private resolveWidgetData(
    widget: DashboardWidgetDefinition,
    executiveSummary: Awaited<ReturnType<ReportingService['getExecutiveSummary']>>,
    kpis: KpiSnapshotSummary[],
    kpiHistory: Array<{
      snapshotPeriod: string;
      domain: string;
      kpiKey: string;
      label: string;
      valueNumeric: string;
      unit: string;
    }>,
    heatmap: { cells: { likelihood: number; severity: number; count: number; rating: string }[] } | null,
  ): unknown {
    const binding = parseDataBinding(widget.config);

    if (binding === 'executive:overallScore') {
      return {
        value: executiveSummary.overallScore,
        trendDirection: executiveSummary.trendDirection,
        trendDelta: executiveSummary.trendDelta,
        unit: 'score',
      };
    }

    if (binding === 'executive:domains') {
      return {
        chartType: widget.config.chartType ?? 'bar',
        points: executiveSummary.domains.map((domain) => ({
          label: domain.domain,
          value: domain.score,
        })),
      };
    }

    if (binding === 'executive:highlights') {
      return {
        rows: executiveSummary.highlights.map((kpi) => ({
          key: kpi.key,
          label: kpi.label,
          value: kpi.value,
          unit: kpi.unit,
          trendDirection: kpi.trendDirection,
          trendDelta: kpi.trendDelta,
        })),
      };
    }

    if (binding.startsWith('kpi:')) {
      const kpiKey = binding.slice('kpi:'.length);
      const kpi = kpis.find((item) => item.key === kpiKey);
      if (!kpi) {
        return { value: null, unit: 'count' };
      }
      if (widget.widgetType === 'benchmark') {
        const target = Number(widget.config.target ?? 0);
        return {
          value: kpi.value,
          unit: kpi.unit,
          target,
          progress: target > 0 ? Math.round((kpi.value / target) * 100) : 0,
          trendDirection: kpi.trendDirection,
          trendDelta: kpi.trendDelta,
        };
      }
      return {
        value: kpi.value,
        unit: kpi.unit,
        trendDirection: kpi.trendDirection,
        trendDelta: kpi.trendDelta,
      };
    }

    if (binding.startsWith('kpi-trend:')) {
      const kpiKey = binding.slice('kpi-trend:'.length);
      const points = [...new Set(kpiHistory.map((row) => row.snapshotPeriod))]
        .sort()
        .map((period) => {
          const row = kpiHistory.find(
            (item) => item.snapshotPeriod === period && item.kpiKey === kpiKey,
          );
          return {
            period,
            value: row ? Number(row.valueNumeric) : null,
          };
        })
        .filter((point) => point.value !== null);

      return { kpiKey, points };
    }

    if (binding.startsWith('kpis:')) {
      const domain = binding.slice('kpis:'.length);
      return {
        rows: kpis
          .filter((kpi) => kpi.domain === domain)
          .map((kpi) => ({
            key: kpi.key,
            label: kpi.label,
            value: kpi.value,
            unit: kpi.unit,
            trendDirection: kpi.trendDirection,
            trendDelta: kpi.trendDelta,
          })),
      };
    }

    if (binding === 'risk:heatmap') {
      return {
        cells: heatmap?.cells ?? [],
      };
    }

    return null;
  }
}

export function createDashboardService(deps: {
  reporting: ReportingRepository;
  reportingService: ReportingService;
  riskService: RiskService | null;
}) {
  return new DashboardService(deps.reporting, deps.reportingService, deps.riskService);
}
