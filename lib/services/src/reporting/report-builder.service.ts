import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  CreateReportDefinitionInput,
  ReportDefinitionDetail,
  ReportDefinitionSpec,
  ReportDefinitionSummary,
  ReportExecutionColumn,
  ReportExecutionResult,
  ReportingDomain,
  UpdateReportDefinitionInput,
} from '@workspace/domain/reporting';
import type { ReportingService } from './reporting.service.js';
import { assertExportWithinLimit } from './reporting-limits.js';

const REPORT_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const KPI_COLUMN_LABELS: Record<string, string> = {
  key: 'KPI Key',
  label: 'Label',
  domain: 'Domain',
  value: 'Value',
  unit: 'Unit',
  trendDirection: 'Trend',
  trendDelta: 'Trend Delta',
  snapshotPeriod: 'Period',
  updatedAt: 'Updated',
};

const EXECUTIVE_COLUMN_LABELS: Record<string, string> = {
  domain: 'Domain',
  score: 'Score',
  kpiCount: 'KPI Count',
  key: 'KPI Key',
  label: 'Label',
  value: 'Value',
  unit: 'Unit',
  trendDirection: 'Trend',
  trendDelta: 'Trend Delta',
};

function mapSummary(row: {
  id: string;
  reportKey: string;
  title: string;
  domain: string;
  updatedAt: Date;
}): ReportDefinitionSummary {
  return {
    id: row.id,
    reportKey: row.reportKey,
    title: row.title,
    domain: row.domain as ReportingDomain,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parseSpec(raw: unknown): ReportDefinitionSpec {
  if (typeof raw !== 'object' || raw === null) {
    return { sourceType: 'kpi' };
  }
  const value = raw as Record<string, unknown>;
  const sourceType = value.sourceType === 'executive' ? 'executive' : 'kpi';
  const columns = Array.isArray(value.columns)
    ? value.columns.filter((item): item is string => typeof item === 'string')
    : undefined;
  const filtersRaw =
    typeof value.filters === 'object' && value.filters !== null
      ? (value.filters as Record<string, unknown>)
      : undefined;

  return {
    sourceType,
    ...(columns ? { columns } : {}),
    ...(filtersRaw
      ? {
          filters: {
            ...(typeof filtersRaw.domain === 'string'
              ? { domain: filtersRaw.domain as ReportingDomain }
              : {}),
            ...(Array.isArray(filtersRaw.kpiKeys)
              ? {
                  kpiKeys: filtersRaw.kpiKeys.filter(
                    (item): item is string => typeof item === 'string',
                  ),
                }
              : {}),
            ...(typeof filtersRaw.snapshotPeriod === 'string'
              ? { snapshotPeriod: filtersRaw.snapshotPeriod }
              : {}),
          },
        }
      : {}),
  };
}

function mapDetail(row: {
  id: string;
  reportKey: string;
  title: string;
  domain: string;
  definition: unknown;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ReportDefinitionDetail {
  return {
    ...mapSummary(row),
    definition: parseSpec(row.definition),
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

function buildColumns(
  sourceType: ReportDefinitionSpec['sourceType'],
  keys: readonly string[],
): ReportExecutionColumn[] {
  const labels = sourceType === 'executive' ? EXECUTIVE_COLUMN_LABELS : KPI_COLUMN_LABELS;
  return keys.map((key) => ({
    key,
    label: labels[key] ?? key,
  }));
}

function pickColumns<T extends Record<string, unknown>>(
  row: T,
  columns: readonly string[],
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of columns) {
    picked[key] = row[key];
  }
  return picked;
}

export class ReportBuilderService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly reportingService: ReportingService,
  ) {}

  async listReports(context: AuthorizationContext): Promise<ReportDefinitionSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listReportDefinitions(context);
    return rows.map(mapSummary);
  }

  async getReport(
    context: AuthorizationContext,
    reportKey: string,
  ): Promise<ReportDefinitionDetail> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getReportDefinition(context, reportKey);
    if (!row) {
      throw AppError.notFound(`Report "${reportKey}" was not found`);
    }
    return mapDetail(row);
  }

  async createReport(
    context: AuthorizationContext,
    input: CreateReportDefinitionInput,
  ): Promise<ReportDefinitionDetail> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    if (!REPORT_KEY_PATTERN.test(input.reportKey)) {
      throw AppError.badRequest(
        'Report key must be lowercase alphanumeric segments separated by hyphens',
      );
    }

    const existing = await this.reporting.getReportDefinition(context, input.reportKey);
    if (existing) {
      throw AppError.conflict(`Report "${input.reportKey}" already exists`);
    }

    const row = await this.reporting.createReportDefinition(context, {
      reportKey: input.reportKey,
      title: input.title,
      domain: input.domain,
      definition: input.definition as unknown as Record<string, unknown>,
    });
    if (!row) {
      throw AppError.internal('Failed to create report definition');
    }
    return mapDetail(row);
  }

  async updateReport(
    context: AuthorizationContext,
    reportKey: string,
    input: UpdateReportDefinitionInput,
  ): Promise<ReportDefinitionDetail> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.updateReportDefinition(context, reportKey, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.domain !== undefined ? { domain: input.domain } : {}),
      ...(input.definition !== undefined
        ? { definition: input.definition as unknown as Record<string, unknown> }
        : {}),
    });
    if (!row) {
      throw AppError.notFound(`Report "${reportKey}" was not found`);
    }
    return mapDetail(row);
  }

  async deleteReport(context: AuthorizationContext, reportKey: string): Promise<void> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.deleteReportDefinition(context, reportKey);
    if (!row) {
      throw AppError.notFound(`Report "${reportKey}" was not found`);
    }
  }

  async runReport(
    context: AuthorizationContext,
    reportKey: string,
  ): Promise<ReportExecutionResult> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const report = await this.getReport(context, reportKey);
    const spec = report.definition;

    if (spec.sourceType === 'executive') {
      return this.runExecutiveReport(context, report, spec);
    }

    return this.runKpiReport(context, report, spec);
  }

  private async runKpiReport(
    context: AuthorizationContext,
    report: ReportDefinitionDetail,
    spec: ReportDefinitionSpec,
  ): Promise<ReportExecutionResult> {
    const kpis = await this.reportingService.listKpis(
      context,
      spec.filters?.snapshotPeriod,
    );

    let rows = kpis.map((kpi) => ({
      key: kpi.key,
      label: kpi.label,
      domain: kpi.domain,
      value: kpi.value,
      unit: kpi.unit,
      trendDirection: kpi.trendDirection,
      trendDelta: kpi.trendDelta,
      snapshotPeriod: kpi.snapshotPeriod,
      updatedAt: kpi.updatedAt,
    }));

    if (spec.filters?.domain) {
      rows = rows.filter((row) => row.domain === spec.filters?.domain);
    }
    if (spec.filters?.kpiKeys?.length) {
      const keys = new Set(spec.filters.kpiKeys);
      rows = rows.filter((row) => keys.has(row.key));
    }

    const defaultColumns = ['key', 'label', 'value', 'unit', 'trendDirection', 'trendDelta'];
    const columns = spec.columns?.length ? spec.columns : defaultColumns;

    assertExportWithinLimit(rows.length);

    return {
      reportKey: report.reportKey,
      title: report.title,
      sourceType: 'kpi',
      snapshotPeriod: rows[0]?.snapshotPeriod ?? null,
      columns: buildColumns('kpi', columns),
      rows: rows.map((row) => pickColumns(row, columns)),
      rowCount: rows.length,
      executedAt: new Date().toISOString(),
    };
  }

  private async runExecutiveReport(
    context: AuthorizationContext,
    report: ReportDefinitionDetail,
    spec: ReportDefinitionSpec,
  ): Promise<ReportExecutionResult> {
    const summary = await this.reportingService.getExecutiveSummary(context);
    const defaultColumns = ['domain', 'score', 'kpiCount'];
    const columns = spec.columns?.length ? spec.columns : defaultColumns;

    const domainRows = summary.domains.map((domain) => ({
      domain: domain.domain,
      score: domain.score,
      kpiCount: domain.kpiCount,
    }));

    const rows =
      columns.some((column) =>
        ['key', 'label', 'value', 'unit', 'trendDirection', 'trendDelta'].includes(column),
      )
        ? summary.highlights.map((kpi) => ({
            key: kpi.key,
            label: kpi.label,
            domain: kpi.domain,
            value: kpi.value,
            unit: kpi.unit,
            trendDirection: kpi.trendDirection,
            trendDelta: kpi.trendDelta,
          }))
        : domainRows;

    assertExportWithinLimit(rows.length);

    return {
      reportKey: report.reportKey,
      title: report.title,
      sourceType: 'executive',
      snapshotPeriod: summary.snapshotPeriod,
      columns: buildColumns('executive', columns),
      rows: rows.map((row) => pickColumns(row, columns)),
      rowCount: rows.length,
      executedAt: new Date().toISOString(),
    };
  }
}

export function createReportBuilderService(deps: {
  reporting: ReportingRepository;
  reportingService: ReportingService;
}) {
  return new ReportBuilderService(deps.reporting, deps.reportingService);
}
