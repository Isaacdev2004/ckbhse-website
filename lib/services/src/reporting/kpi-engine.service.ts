import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { KpiReading } from '@workspace/domain/reporting';
import { snapshotPeriodKey } from './kpi-registry.js';
import type { KpiProvider } from './providers/types.js';

export interface KpiRefreshResult {
  readonly snapshotPeriod: string;
  readonly upserted: number;
  readonly readings: readonly KpiReading[];
}

export class KpiEngineService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly providers: readonly KpiProvider[],
  ) {}

  async collectCurrent(context: AuthorizationContext): Promise<readonly KpiReading[]> {
    const batches = await Promise.all(
      this.providers.map((provider) => provider.collect(context)),
    );
    return batches.flat();
  }

  async refreshSnapshots(context: AuthorizationContext): Promise<KpiRefreshResult> {
    const snapshotPeriod = snapshotPeriodKey();
    await this.reporting.touchViewRegistry(context, 'kpi_snapshots', {
      refreshStatus: 'running',
    });

    try {
      const readings = await this.collectCurrent(context);
      for (const reading of readings) {
        await this.reporting.upsertKpiSnapshot(context, {
          snapshotPeriod,
          domain: reading.domain,
          kpiKey: reading.key,
          label: reading.label,
          valueNumeric: String(reading.value),
          unit: reading.unit,
          metadata: reading.metadata ?? {},
        });
      }

      await this.reporting.touchViewRegistry(context, 'kpi_snapshots', {
        refreshStatus: 'idle',
        rowCount: readings.length,
      });
      await this.reporting.touchViewRegistry(context, 'executive_summary', {
        refreshStatus: 'idle',
        rowCount: readings.length,
      });

      return { snapshotPeriod, upserted: readings.length, readings };
    } catch (error) {
      await this.reporting.touchViewRegistry(context, 'kpi_snapshots', {
        refreshStatus: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : 'Refresh failed',
        },
      });
      throw error;
    }
  }
}

export function createKpiEngineService(deps: {
  reporting: ReportingRepository;
  providers: readonly KpiProvider[];
}) {
  return new KpiEngineService(deps.reporting, deps.providers);
}

export const REPORTING_KPI_REFRESH_JOB = 'reporting.kpi.refresh';
