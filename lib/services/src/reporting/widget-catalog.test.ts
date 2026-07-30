import { describe, expect, it } from 'vitest';
import { WIDGET_CATALOG, isWidgetType } from './widget-catalog.js';

describe('widget catalog', () => {
  it('defines six widget types', () => {
    expect(WIDGET_CATALOG.map((entry) => entry.type)).toEqual([
      'metric',
      'trend',
      'table',
      'chart',
      'heatmap',
      'benchmark',
    ]);
  });

  it('validates widget types', () => {
    expect(isWidgetType('chart')).toBe(true);
    expect(isWidgetType('unknown')).toBe(false);
  });
});
