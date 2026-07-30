import type {
  DashboardWidgetType,
  WidgetCatalogEntry,
} from '@workspace/domain/reporting';

/** Code-first widget type catalogue for dashboard composition. */
export const WIDGET_CATALOG: readonly WidgetCatalogEntry[] = Object.freeze([
  {
    type: 'metric',
    label: 'Metric',
    description: 'Single KPI value with optional trend indicator',
  },
  {
    type: 'trend',
    label: 'Trend',
    description: 'Line chart of KPI values across snapshot periods',
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Tabular KPI listing for a domain or highlight set',
  },
  {
    type: 'chart',
    label: 'Chart',
    description: 'Bar or column chart for domain scores and comparisons',
  },
  {
    type: 'heatmap',
    label: 'Heat map',
    description: 'Risk likelihood × severity distribution grid',
  },
  {
    type: 'benchmark',
    label: 'Benchmark',
    description: 'KPI value compared against a target threshold',
  },
]);

export function isWidgetType(value: string): value is DashboardWidgetType {
  return WIDGET_CATALOG.some((entry) => entry.type === value);
}
