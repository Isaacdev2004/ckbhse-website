import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { ForecastSummary } from '@workspace/domain/reporting';
import { KPI_REGISTRY, findKpiDefinition, snapshotPeriodKey } from './kpi-registry.js';
import {
  computeRiskOfBreach,
  forecastConfidenceFromPoints,
  linearForecast,
  nextSnapshotPeriod,
} from './trend-analysis.js';

const FORECAST_KPIS = KPI_REGISTRY.filter((definition) =>
  ['compliance.score', 'learning.completion_rate', 'crm.conversion_rate'].includes(
    definition.key,
  ),
);

const TARGETS: Record<string, number> = {
  'compliance.score': 80,
  'learning.completion_rate': 90,
  'crm.conversion_rate': 25,
};

function mapForecast(row: {
  kpiKey: string;
  domain: string;
  snapshotPeriod: string;
  forecastPeriod: string;
  projectedValue: string;
  confidence: string;
  method: string;
  riskOfBreach: boolean;
  updatedAt: Date;
}): ForecastSummary {
  const definition = findKpiDefinition(row.kpiKey);
  return {
    kpiKey: row.kpiKey,
    domain: row.domain as ForecastSummary['domain'],
    label: definition?.label ?? row.kpiKey,
    snapshotPeriod: row.snapshotPeriod,
    forecastPeriod: row.forecastPeriod,
    projectedValue: Number(row.projectedValue),
    confidence: row.confidence as ForecastSummary['confidence'],
    method: row.method,
    riskOfBreach: row.riskOfBreach,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PredictiveAnalyticsService {
  constructor(private readonly reporting: ReportingRepository) {}

  async listForecasts(context: AuthorizationContext): Promise<ForecastSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listForecasts(context);
    return rows.map(mapForecast);
  }

  async getForecast(
    context: AuthorizationContext,
    kpiKey: string,
  ): Promise<ForecastSummary> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getForecast(context, kpiKey);
    if (!row) {
      throw AppError.notFound('Forecast was not found');
    }
    return mapForecast(row);
  }

  async refreshForecasts(context: AuthorizationContext): Promise<ForecastSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const currentPeriod = snapshotPeriodKey();
    const forecastPeriod = nextSnapshotPeriod(currentPeriod);
    const refreshed: ForecastSummary[] = [];

    for (const definition of FORECAST_KPIS) {
      const history = await this.reporting.listKpiSnapshotHistory(
        context,
        definition.key,
        8,
      );
      const values = [...history].reverse().map((row) => Number(row.valueNumeric));
      const projected = linearForecast(values, 1);
      const target = TARGETS[definition.key] ?? projected;
      const row = await this.reporting.upsertForecast(context, {
        kpiKey: definition.key,
        domain: definition.domain,
        snapshotPeriod: currentPeriod,
        forecastPeriod,
        projectedValue: String(projected),
        confidence: forecastConfidenceFromPoints(values.length),
        method: 'linear_regression_stub',
        riskOfBreach: computeRiskOfBreach(projected, target),
        metadata: { target, historyPoints: values.length },
      });
      if (row) {
        refreshed.push(mapForecast(row));
      }
    }

    await this.reporting.touchViewRegistry(context, 'forecasts', {
      refreshStatus: 'idle',
      rowCount: refreshed.length,
    });

    return refreshed;
  }
}

export function createPredictiveAnalyticsService(deps: {
  reporting: ReportingRepository;
}) {
  return new PredictiveAnalyticsService(deps.reporting);
}
