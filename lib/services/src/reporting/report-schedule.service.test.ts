import { describe, expect, it } from 'vitest';
import { computeNextRunAt } from './report-schedule.service.js';

describe('computeNextRunAt', () => {
  it('schedules daily reports for the next day when time has passed', () => {
    const from = new Date('2026-07-30T12:00:00.000Z');
    const next = computeNextRunAt('daily', '08:00', from);
    expect(next.toISOString()).toBe('2026-07-31T08:00:00.000Z');
  });

  it('schedules weekly reports seven days ahead', () => {
    const from = new Date('2026-07-30T12:00:00.000Z');
    const next = computeNextRunAt('weekly', '08:00', from);
    expect(next.toISOString()).toBe('2026-08-06T08:00:00.000Z');
  });
});
