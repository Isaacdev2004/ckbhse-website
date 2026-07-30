import { describe, expect, it } from 'vitest';
import { AppError } from '@workspace/platform/errors';
import {
  assertExportWithinLimit,
  isViewRefreshStale,
  KPI_REFRESH_SLA_MS,
  MAX_BI_EXPORT_ROWS,
  MAX_REPORT_EXPORT_ROWS,
  VIEW_REFRESH_STALE_HOURS,
} from './reporting-limits.js';

describe('reporting-limits', () => {
  it('exports platform constants', () => {
    expect(MAX_REPORT_EXPORT_ROWS).toBe(10_000);
    expect(MAX_BI_EXPORT_ROWS).toBe(50_000);
    expect(KPI_REFRESH_SLA_MS).toBe(30_000);
    expect(VIEW_REFRESH_STALE_HOURS).toBe(24);
  });

  it('rejects exports above row limit', () => {
    expect(() => assertExportWithinLimit(MAX_REPORT_EXPORT_ROWS + 1)).toThrow(AppError);
    expect(() => assertExportWithinLimit(MAX_REPORT_EXPORT_ROWS)).not.toThrow();
  });

  it('flags stale view refreshes', () => {
    const fresh = new Date();
    const stale = new Date(Date.now() - (VIEW_REFRESH_STALE_HOURS + 1) * 60 * 60 * 1000);
    expect(isViewRefreshStale(fresh)).toBe(false);
    expect(isViewRefreshStale(stale)).toBe(true);
    expect(isViewRefreshStale(null)).toBe(true);
  });
});
