import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  ExecutiveSummaryData,
  KpiDefinition,
  KpiSnapshotSummary,
  ReportDefinitionSummary,
  ReportingViewStatus,
} from '@workspace/domain/reporting';
import {
  KPI_REGISTRY,
  computeTrendDirection,
  snapshotPeriodKey,
} from './kpi-registry.js';
import type { KpiEngineService } from './kpi-engine.service.js';

function mapSnapshotRow(
  row: {
    snapshotPeriod: string;
    domain: string;
    kpiKey: string;
    label: string;
    valueNumeric: string;
    unit: string;
    updatedAt: Date;
  },
  previousValue: number | null,
): KpiSnapshotSummary {
  const value = Number(row.valueNumeric);
  const trend = computeTrendDirection(value, previousValue);
  return {
    snapshotPeriod: row.snapshotPeriod,
    domain: row.domain as KpiSnapshotSummary['domain'],
    key: row.kpiKey,
    label: row.label,
    value,
    unit: row.unit as KpiSnapshotSummary['unit'],
    trendDirection: trend.direction,
    trendDelta: trend.delta,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function domainScore(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export class ReportingService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly kpiEngine: KpiEngineService,
  ) {}

  listKpiDefinitions(): readonly KpiDefinition[] {
    return KPI_REGISTRY;
  }

  async listKpis(
    context: AuthorizationContext,
    snapshotPeriod?: string,
  ): Promise<KpiSnapshotSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const period = snapshotPeriod ?? snapshotPeriodKey();
    const rows = await this.reporting.listKpiSnapshotsForPeriod(context, period);

    if (rows.length === 0) {
      const refreshed = await this.kpiEngine.refreshSnapshots(context);
      const freshRows = await this.reporting.listKpiSnapshotsForPeriod(
        context,
        refreshed.snapshotPeriod,
      );
      return this.withTrends(context, freshRows);
    }

    return this.withTrends(context, rows);
  }

  private async withTrends(
    context: AuthorizationContext,
    rows: Array<{
      snapshotPeriod: string;
      domain: string;
      kpiKey: string;
      label: string;
      valueNumeric: string;
      unit: string;
      updatedAt: Date;
    }>,
  ): Promise<KpiSnapshotSummary[]> {
    const periods = [...new Set(rows.map((row) => row.snapshotPeriod))].sort();
    const currentPeriod = periods.at(-1);
    if (!currentPeriod) return [];

    const allRows = await this.reporting.listKpiSnapshots(context, 500);
    const previousPeriod = periods.length > 1 ? periods.at(-2) : null;

    return rows
      .filter((row) => row.snapshotPeriod === currentPeriod)
      .map((row) => {
        const previous = previousPeriod
          ? allRows.find(
              (candidate) =>
                candidate.snapshotPeriod === previousPeriod &&
                candidate.domain === row.domain &&
                candidate.kpiKey === row.kpiKey,
            )
          : null;
        const previousValue = previous ? Number(previous.valueNumeric) : null;
        return mapSnapshotRow(row, previousValue);
      });
  }

  async getExecutiveSummary(context: AuthorizationContext): Promise<ExecutiveSummaryData> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const kpis = await this.listKpis(context);
    const snapshotPeriod = kpis[0]?.snapshotPeriod ?? snapshotPeriodKey();

    const byDomain = new Map<string, KpiSnapshotSummary[]>();
    for (const kpi of kpis) {
      const existing = byDomain.get(kpi.domain) ?? [];
      existing.push(kpi);
      byDomain.set(kpi.domain, existing);
    }

    const domains = [...byDomain.entries()].map(([domain, items]) => ({
      domain: domain as ExecutiveSummaryData['domains'][number]['domain'],
      score: domainScore(items.map((item) => item.value)),
      kpiCount: items.length,
    }));

    const scoreCandidates = kpis.filter((kpi) =>
      ['score', 'percent'].includes(kpi.unit),
    );
    const overallScore = domainScore(scoreCandidates.map((kpi) => kpi.value));
    const previousOverall = scoreCandidates.reduce(
      (sum, kpi) => sum + (kpi.value - kpi.trendDelta),
      0,
    );
    const previousAverage =
      scoreCandidates.length > 0 ? previousOverall / scoreCandidates.length : null;
    const trend = computeTrendDirection(overallScore, previousAverage);

    const highlights = [...kpis]
      .sort((a, b) => Math.abs(b.trendDelta) - Math.abs(a.trendDelta))
      .slice(0, 6);

    return {
      snapshotPeriod,
      overallScore,
      trendDirection: trend.direction,
      trendDelta: trend.delta,
      domains,
      highlights,
    };
  }

  async listViewRegistry(context: AuthorizationContext): Promise<ReportingViewStatus[]> {
    const rows = await this.reporting.listViewRegistry(context);
    return rows.map((row) => ({
      viewKey: row.viewKey,
      description: row.description,
      lastRefreshedAt: row.lastRefreshedAt?.toISOString() ?? null,
      refreshStatus: row.refreshStatus,
      rowCount: row.rowCount,
    }));
  }

  async listReportDefinitions(
    context: AuthorizationContext,
  ): Promise<ReportDefinitionSummary[]> {
    const rows = await this.reporting.listReportDefinitions(context);
    return rows.map((row) => ({
      id: row.id,
      reportKey: row.reportKey,
      title: row.title,
      domain: row.domain as ReportDefinitionSummary['domain'],
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  refreshSnapshots(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.kpiEngine.refreshSnapshots(context);
  }
}

export function createReportingService(deps: {
  reporting: ReportingRepository;
  kpiEngine: KpiEngineService;
}) {
  return new ReportingService(deps.reporting, deps.kpiEngine);
}
