import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { TrendAnalysisResult } from '@workspace/domain/reporting';
import { findKpiDefinition } from './kpi-registry.js';
import {
  computeMovingAverage,
  detectSeasonalityFlag,
  trendDirectionFromSeries,
} from './trend-analysis.js';

export class TrendAnalysisService {
  constructor(private readonly reporting: ReportingRepository) {}

  async analyzeKpi(
    context: AuthorizationContext,
    kpiKey: string,
    limit = 12,
  ): Promise<TrendAnalysisResult> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const definition = findKpiDefinition(kpiKey);
    if (!definition) {
      throw AppError.notFound('KPI definition was not found');
    }

    const rows = await this.reporting.listKpiSnapshotHistory(context, kpiKey, limit);
    const chronological = [...rows].reverse();
    const values = chronological.map((row) => Number(row.valueNumeric));
    const movingAverages = computeMovingAverage(values, 3);

    const points = chronological.map((row, index) => ({
      snapshotPeriod: row.snapshotPeriod,
      value: Number(row.valueNumeric),
      movingAverage: movingAverages[index] ?? null,
    }));

    return {
      kpiKey,
      domain: definition.domain,
      label: definition.label,
      seasonalityFlag: detectSeasonalityFlag(values),
      trendDirection: trendDirectionFromSeries(values),
      points,
    };
  }
}

export function createTrendAnalysisService(deps: { reporting: ReportingRepository }) {
  return new TrendAnalysisService(deps.reporting);
}
