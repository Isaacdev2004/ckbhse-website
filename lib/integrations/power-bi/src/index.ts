/** Power BI adapter — vendor logic isolated from domain/services (Document 06 §14). */

export interface PowerBiKpiRow {
  readonly snapshotPeriod: string;
  readonly domain: string;
  readonly kpiKey: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly updatedAt: string;
}

export interface PowerBiExecutiveRow {
  readonly snapshotPeriod: string;
  readonly overallScore: number;
  readonly trendDirection: string;
  readonly trendDelta: number;
  readonly updatedAt: string;
}

export interface PowerBiDatasetPayload {
  readonly schemaVersion: '1.0';
  readonly datasetKey: string;
  readonly exportType: 'full' | 'incremental';
  readonly generatedAt: string;
  readonly watermark: Record<string, unknown>;
  readonly tables: {
    readonly kpi_snapshots: readonly PowerBiKpiRow[];
    readonly executive_summary: readonly PowerBiExecutiveRow[];
  };
}

export interface BuildDatasetInput {
  readonly datasetKey: string;
  readonly exportType: 'full' | 'incremental';
  readonly kpiRows: readonly PowerBiKpiRow[];
  readonly executiveRows: readonly PowerBiExecutiveRow[];
  readonly watermark?: Record<string, unknown>;
}

export function buildPowerBiDataset(input: BuildDatasetInput): PowerBiDatasetPayload {
  const watermark =
    input.watermark ??
    ({
      lastSnapshotPeriod:
        input.kpiRows[input.kpiRows.length - 1]?.snapshotPeriod ??
        input.executiveRows[0]?.snapshotPeriod ??
        null,
      rowCount: input.kpiRows.length + input.executiveRows.length,
    } satisfies Record<string, unknown>);

  return {
    schemaVersion: '1.0',
    datasetKey: input.datasetKey,
    exportType: input.exportType,
    generatedAt: new Date().toISOString(),
    watermark,
    tables: {
      kpi_snapshots: [...input.kpiRows],
      executive_summary: [...input.executiveRows],
    },
  };
}

export function serializePowerBiDataset(payload: PowerBiDatasetPayload): Buffer {
  return Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
}

export function buildIncrementalManifest(
  connectionKey: string,
  datasetKey: string,
  watermark: Record<string, unknown>,
  lastExportAt: string | null,
) {
  return {
    connectionKey,
    datasetKey,
    refreshMode: 'incremental' as const,
    watermark,
    tables: [
      {
        name: 'kpi_snapshots',
        primaryKey: ['snapshotPeriod', 'domain', 'kpiKey'],
        incrementalColumn: 'updatedAt',
      },
      {
        name: 'executive_summary',
        primaryKey: ['snapshotPeriod'],
        incrementalColumn: 'updatedAt',
      },
    ],
    lastExportAt,
  };
}
