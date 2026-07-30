import { describe, expect, it } from 'vitest';
import { computeTrendDirection, KPI_REGISTRY, snapshotPeriodKey } from './kpi-registry.js';

describe('kpi-registry', () => {
  it('includes cross-domain KPI definitions', () => {
    const domains = new Set(KPI_REGISTRY.map((item) => item.domain));
    expect(domains).toEqual(
      new Set(['compliance', 'audit', 'crm', 'learning', 'financial']),
    );
  });

  it('computes trend direction', () => {
    expect(computeTrendDirection(82, 78)).toEqual({ direction: 'up', delta: 4 });
    expect(computeTrendDirection(70, 80)).toEqual({ direction: 'down', delta: -10 });
    expect(computeTrendDirection(80, null)).toEqual({ direction: 'stable', delta: 0 });
  });

  it('formats snapshot period keys', () => {
    expect(snapshotPeriodKey(new Date('2026-07-15T12:00:00Z'))).toBe('2026-07');
  });
});
