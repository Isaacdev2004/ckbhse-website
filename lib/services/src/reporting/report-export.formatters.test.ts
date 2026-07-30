import { describe, expect, it } from 'vitest';
import { formatReportCsv, formatReportPdf } from './report-export.formatters.js';

const sample = {
  reportKey: 'compliance-kpi-summary',
  title: 'Compliance KPI Summary',
  sourceType: 'kpi' as const,
  snapshotPeriod: '2026-07',
  columns: [
    { key: 'label', label: 'Label' },
    { key: 'value', label: 'Value' },
  ],
  rows: [{ label: 'Compliance score', value: 82 }],
  rowCount: 1,
  executedAt: '2026-07-30T00:00:00.000Z',
};

describe('report export formatters', () => {
  it('formats CSV with header row', () => {
    const csv = formatReportCsv(sample);
    expect(csv).toContain('Label,Value');
    expect(csv).toContain('Compliance score,82');
  });

  it('formats a minimal PDF document', () => {
    const pdf = formatReportPdf(sample);
    const text = new TextDecoder().decode(pdf);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('Compliance KPI Summary');
  });
});
