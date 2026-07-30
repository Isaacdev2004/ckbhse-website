import type { RiskRatingThreshold } from '@workspace/domain/risk';

export const DEFAULT_RATING_THRESHOLDS: readonly RiskRatingThreshold[] = [
  { min: 1, max: 4, rating: 'low', color: 'green' },
  { min: 5, max: 9, rating: 'medium', color: 'yellow' },
  { min: 10, max: 15, rating: 'high', color: 'orange' },
  { min: 16, max: 25, rating: 'critical', color: 'red' },
];

export function calculateRiskScore(likelihood: number, severity: number) {
  return likelihood * severity;
}

export function resolveRiskRating(
  score: number,
  thresholds: readonly RiskRatingThreshold[] = DEFAULT_RATING_THRESHOLDS,
): string {
  const match = thresholds.find((t) => score >= t.min && score <= t.max);
  return match?.rating ?? 'unknown';
}

export function buildRiskScore(
  likelihood: number,
  severity: number,
  thresholds?: readonly RiskRatingThreshold[],
) {
  const score = calculateRiskScore(likelihood, severity);
  return {
    likelihood,
    severity,
    score,
    rating: resolveRiskRating(score, thresholds),
  };
}

export interface HeatMapEntry {
  readonly likelihood: number;
  readonly severity: number;
  readonly count: number;
  readonly rating: string;
}

export function aggregateHeatMap(
  rows: readonly { likelihood: number | null; severity: number | null; rating: string | null }[],
  thresholds: readonly RiskRatingThreshold[] = DEFAULT_RATING_THRESHOLDS,
): HeatMapEntry[] {
  const cells = new Map<string, HeatMapEntry>();
  for (const row of rows) {
    if (row.likelihood === null || row.severity === null) continue;
    const key = `${row.likelihood}:${row.severity}`;
    const existing = cells.get(key);
    const rating = row.rating ?? resolveRiskRating(calculateRiskScore(row.likelihood, row.severity), thresholds);
    if (existing) {
      cells.set(key, { ...existing, count: existing.count + 1 });
    } else {
      cells.set(key, {
        likelihood: row.likelihood,
        severity: row.severity,
        count: 1,
        rating,
      });
    }
  }
  return [...cells.values()].sort(
    (a, b) => a.likelihood - b.likelihood || a.severity - b.severity,
  );
}
