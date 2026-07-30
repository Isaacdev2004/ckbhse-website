import { describe, expect, it } from 'vitest';
import {
  computeMovingAverage,
  computeRiskOfBreach,
  detectSeasonalityFlag,
  linearForecast,
  percentileRank,
  thresholdBreached,
  trendDirectionFromSeries,
} from './trend-analysis.js';

describe('trend-analysis', () => {
  it('computes moving averages', () => {
    expect(computeMovingAverage([10, 20, 30], 2)).toEqual([null, 15, 25]);
  });

  it('detects oscillating seasonality', () => {
    expect(detectSeasonalityFlag([10, 20, 10, 20, 10, 20])).toBe('likely');
  });

  it('projects linear forecast', () => {
    expect(linearForecast([70, 72, 74], 1)).toBe(76);
  });

  it('computes percentile rank bands', () => {
    expect(percentileRank(80, 72, 78, 85)).toBeGreaterThan(50);
  });

  it('evaluates threshold breaches', () => {
    expect(thresholdBreached(79, 'lt', 80)).toBe(true);
    expect(thresholdBreached(81, 'lt', 80)).toBe(false);
  });

  it('flags risk of breach when projected below target', () => {
    expect(computeRiskOfBreach(75, 80)).toBe(true);
  });

  it('derives trend direction from series', () => {
    expect(trendDirectionFromSeries([70, 72, 74])).toBe('up');
  });
});
