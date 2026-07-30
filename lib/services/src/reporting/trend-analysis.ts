import type { SeasonalityFlag, TrendDirection } from '@workspace/domain/reporting';

export function computeMovingAverage(
  values: readonly number[],
  window: number,
): readonly (number | null)[] {
  if (window <= 0) return values.map(() => null);
  return values.map((_, index) => {
    if (index + 1 < window) return null;
    const slice = values.slice(index + 1 - window, index + 1);
    const sum = slice.reduce((total, value) => total + value, 0);
    return Math.round((sum / window) * 100) / 100;
  });
}

export function detectSeasonalityFlag(values: readonly number[]): SeasonalityFlag {
  if (values.length < 6) return 'none';
  const deltas = values.slice(1).map((value, index) => value - values[index]!);
  const signChanges = deltas.slice(1).filter((delta, index) => {
    const previous = deltas[index]!;
    return (delta >= 0 && previous < 0) || (delta < 0 && previous >= 0);
  }).length;
  if (signChanges >= values.length - 2) return 'likely';
  if (signChanges >= Math.floor(values.length / 3)) return 'possible';
  return 'none';
}

export function trendDirectionFromSeries(values: readonly number[]): TrendDirection {
  if (values.length < 2) return 'stable';
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const delta = Math.round((last - first) * 100) / 100;
  if (Math.abs(delta) < 0.5) return 'stable';
  return delta > 0 ? 'up' : 'down';
}

export function linearForecast(values: readonly number[], periodsAhead = 1): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0]!;
  const n = values.length;
  const xs = values.map((_, index) => index);
  const sumX = xs.reduce((total, value) => total + value, 0);
  const sumY = values.reduce((total, value) => total + value, 0);
  const sumXY = xs.reduce((total, x, index) => total + x * values[index]!, 0);
  const sumXX = xs.reduce((total, x) => total + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  const nextX = n - 1 + periodsAhead;
  return Math.round((intercept + slope * nextX) * 100) / 100;
}

export function computeRiskOfBreach(
  projected: number,
  target: number,
  higherIsBetter = true,
): boolean {
  return higherIsBetter ? projected < target : projected > target;
}

export function percentileRank(
  value: number,
  percentile25: number,
  percentile50: number,
  percentile75: number,
): number {
  if (value <= percentile25) {
    return Math.max(5, Math.round((value / percentile25) * 25));
  }
  if (value <= percentile50) {
    const span = percentile50 - percentile25 || 1;
    return 25 + Math.round(((value - percentile25) / span) * 25);
  }
  if (value <= percentile75) {
    const span = percentile75 - percentile50 || 1;
    return 50 + Math.round(((value - percentile50) / span) * 25);
  }
  const span = percentile75 || 1;
  return Math.min(99, 75 + Math.round(((value - percentile75) / span) * 24));
}

export function thresholdBreached(
  value: number,
  operator: 'lt' | 'lte' | 'gt' | 'gte',
  threshold: number,
): boolean {
  switch (operator) {
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
  }
}

export function forecastConfidenceFromPoints(pointCount: number): 'low' | 'medium' | 'high' {
  if (pointCount >= 6) return 'high';
  if (pointCount >= 3) return 'medium';
  return 'low';
}

export function nextSnapshotPeriod(current: string): string {
  const [yearText, monthText] = current.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) return current;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}
