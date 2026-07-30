import { describe, expect, it } from 'vitest';
import {
  aggregateHeatMap,
  buildRiskScore,
  calculateRiskScore,
  resolveRiskRating,
} from './matrix.js';

describe('risk matrix engine', () => {
  it('calculates likelihood × severity score', () => {
    expect(calculateRiskScore(4, 3)).toBe(12);
  });

  it('resolves rating from score thresholds', () => {
    expect(resolveRiskRating(4)).toBe('low');
    expect(resolveRiskRating(12)).toBe('high');
    expect(resolveRiskRating(20)).toBe('critical');
  });

  it('builds complete risk score object', () => {
    const score = buildRiskScore(3, 4);
    expect(score.score).toBe(12);
    expect(score.rating).toBe('high');
  });

  it('aggregates heat map cells', () => {
    const cells = aggregateHeatMap([
      { likelihood: 2, severity: 3, rating: 'medium' },
      { likelihood: 2, severity: 3, rating: 'medium' },
      { likelihood: 4, severity: 5, rating: 'critical' },
    ]);
    expect(cells).toHaveLength(2);
    expect(cells.find((c) => c.likelihood === 2)?.count).toBe(2);
  });
});
