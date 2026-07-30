import type { ReportExecutionResult } from '@workspace/domain/reporting';

function escapeCsv(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function formatReportCsv(result: ReportExecutionResult): string {
  const header = result.columns.map((column) => escapeCsv(column.label)).join(',');
  const rows = result.rows.map((row) =>
    result.columns.map((column) => escapeCsv(row[column.key])).join(','),
  );
  return [header, ...rows].join('\n');
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function formatReportPdf(result: ReportExecutionResult): Uint8Array {
  const lines = [
    result.title,
    `Generated: ${result.executedAt}`,
    result.snapshotPeriod ? `Period: ${result.snapshotPeriod}` : '',
    '',
    result.columns.map((column) => column.label).join(' | '),
    ...result.rows.map((row) =>
      result.columns.map((column) => String(row[column.key] ?? '')).join(' | '),
    ),
  ].filter(Boolean);

  const contentLines = ['BT', '/F1 10 Tf', '50 760 Td'];
  for (const [index, line] of lines.entries()) {
    const yOffset = index === 0 ? 0 : -14;
    if (index > 0) {
      contentLines.push(`0 ${yOffset} Td`);
    }
    contentLines.push(`(${escapePdfText(line.slice(0, 100))}) Tj`);
  }
  contentLines.push('ET');
  const stream = contentLines.join('\n');

  const objects = [
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj',
    `4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj`,
    '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function formatReportExport(
  result: ReportExecutionResult,
  format: 'csv' | 'xlsx' | 'pdf',
): { body: Uint8Array; contentType: string; extension: string } {
  if (format === 'pdf') {
    return {
      body: formatReportPdf(result),
      contentType: 'application/pdf',
      extension: 'pdf',
    };
  }

  const csv = formatReportCsv(result);
  const body = new TextEncoder().encode(`\uFEFF${csv}`);
  return {
    body,
    contentType: format === 'xlsx' ? 'application/vnd.ms-excel' : 'text/csv',
    extension: format === 'xlsx' ? 'xlsx' : 'csv',
  };
}
