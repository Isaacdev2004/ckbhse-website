/** Reporting platform guardrails (M2.8 Part 5). */

import { AppError } from '@workspace/platform/errors';

/** Maximum rows allowed in a single report execution/export. */
export const MAX_REPORT_EXPORT_ROWS = 10_000;

/** Maximum rows in a Power BI dataset export payload. */
export const MAX_BI_EXPORT_ROWS = 50_000;

/** Target SLA for in-process KPI snapshot refresh (milliseconds). */
export const KPI_REFRESH_SLA_MS = 30_000;

/** Recommended maximum age before a materialized view is considered stale. */
export const VIEW_REFRESH_STALE_HOURS = 24;

export function assertExportWithinLimit(rowCount: number, limit = MAX_REPORT_EXPORT_ROWS): void {
  if (rowCount > limit) {
    throw AppError.payloadTooLarge(
      `Export exceeds the maximum of ${limit.toLocaleString()} rows (${rowCount.toLocaleString()} requested)`,
    );
  }
}

export function isViewRefreshStale(lastRefreshedAt: Date | null, now = new Date()): boolean {
  if (lastRefreshedAt === null) return true;
  const ageMs = now.getTime() - lastRefreshedAt.getTime();
  return ageMs > VIEW_REFRESH_STALE_HOURS * 60 * 60 * 1000;
}
