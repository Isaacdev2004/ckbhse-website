import { describe, expect, it } from 'vitest';
import { buildPowerBiDataset, serializePowerBiDataset } from '@workspace/integrations-power-bi';

describe('power-bi adapter', () => {
  it('builds dataset payload with watermark', () => {
    const payload = buildPowerBiDataset({
      datasetKey: 'acme-executive-kpis',
      exportType: 'full',
      kpiRows: [
        {
          snapshotPeriod: '2026-07',
          domain: 'compliance',
          kpiKey: 'compliance.score',
          label: 'Compliance score',
          value: 82,
          unit: 'score',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      ],
      executiveRows: [
        {
          snapshotPeriod: '2026-07',
          overallScore: 82,
          trendDirection: 'up',
          trendDelta: 2,
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      ],
    });

    expect(payload.schemaVersion).toBe('1.0');
    expect(payload.tables.kpi_snapshots).toHaveLength(1);
    expect(payload.watermark.lastSnapshotPeriod).toBe('2026-07');
    expect(serializePowerBiDataset(payload).length).toBeGreaterThan(0);
  });
});
