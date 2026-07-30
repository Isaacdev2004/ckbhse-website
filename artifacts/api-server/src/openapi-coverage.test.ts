import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const openapiPath = path.join(repoRoot, 'lib', 'api-spec', 'openapi.yaml');

/** M2.6 staff and portal routes that must remain contract-documented. */
const REQUIRED_M26_PATHS = [
  '/v1/audits/dashboard',
  '/v1/audits',
  '/v1/compliance/dashboard',
  '/v1/compliance/workspace',
  '/v1/compliance/analytics/executive',
  '/v1/compliance/analytics/alerts/{alertId}/acknowledge',
  '/v1/inspections/dashboard',
  '/v1/capa/dashboard',
  '/v1/risk-assessments/dashboard',
  '/v1/risk-assessments/heatmap',
  '/v1/portal/compliance',
  '/v1/portal/compliance/analytics/executive',
  '/v1/portal/capa/dashboard',
  '/v1/portal/risk-assessments/dashboard',
  '/v1/portal/audits',
  '/v1/portal/inspections',
] as const;

/** M2.7 admin routes that must remain contract-documented. */
const REQUIRED_M27_ADMIN_PATHS = [
  '/v1/admin/dashboard',
  '/v1/admin/organizations',
  '/v1/admin/users',
  '/v1/admin/roles',
  '/v1/admin/permissions',
  '/v1/admin/audit-logs',
  '/v1/admin/feature-flags',
  '/v1/admin/feature-flags/{key}',
  '/v1/admin/system/health',
  '/v1/admin/system/version',
] as const;

/** M2.7 Part 2 CMS routes that must remain contract-documented. */
const REQUIRED_M27_CMS_PATHS = [
  '/v1/admin/cms/dashboard',
  '/v1/admin/cms/entries',
  '/v1/admin/cms/entries/{entryId}',
  '/v1/admin/cms/entries/{entryId}/draft',
  '/v1/admin/cms/entries/{entryId}/publish',
  '/v1/admin/cms/entries/{entryId}/archive',
  '/v1/admin/cms/entries/{entryId}/rollback',
  '/v1/admin/cms/import-from-files',
  '/v1/admin/cms/media',
  '/v1/admin/cms/seo',
  '/v1/admin/cms/seo/{entryId}',
] as const;

/** M2.7 Part 3 public content routes. */
const REQUIRED_M27_CONTENT_PATHS = [
  '/v1/content/entries',
  '/v1/content/snapshot',
  '/v1/content/by-path',
] as const;

/** M2.8 Part 1 reporting routes. */
const REQUIRED_M28_REPORTING_PATHS = [
  '/v1/reporting/kpi-definitions',
  '/v1/reporting/kpis',
  '/v1/reporting/executive-summary',
  '/v1/reporting/views',
  '/v1/reporting/definitions',
  '/v1/reporting/refresh',
  '/v1/reporting/widgets/catalog',
  '/v1/reporting/dashboards',
  '/v1/reporting/dashboards/{dashboardKey}',
  '/v1/reporting/dashboards/{dashboardKey}/layout',
  '/v1/reporting/reports',
  '/v1/reporting/reports/{reportKey}',
  '/v1/reporting/reports/{reportKey}/run',
  '/v1/reporting/exports',
  '/v1/reporting/reports/{reportKey}/export',
  '/v1/reporting/exports/{jobId}',
  '/v1/reporting/exports/{jobId}/download',
  '/v1/reporting/schedules',
  '/v1/reporting/schedules/run-due',
  '/v1/reporting/schedules/{scheduleKey}',
  '/v1/reporting/bi/connections',
  '/v1/reporting/bi/connections/{connectionKey}',
  '/v1/reporting/bi/connections/{connectionKey}/manifest',
  '/v1/reporting/bi/connections/{connectionKey}/export',
  '/v1/reporting/bi/exports',
  '/v1/reporting/bi/exports/{exportId}',
  '/v1/reporting/bi/exports/{exportId}/download',
  '/v1/reporting/benchmarks/cohorts',
  '/v1/reporting/benchmarks/compare',
  '/v1/reporting/trends/{kpiKey}',
  '/v1/reporting/forecasts',
  '/v1/reporting/forecasts/refresh',
  '/v1/reporting/forecasts/{kpiKey}',
  '/v1/reporting/subscriptions',
  '/v1/reporting/subscriptions/evaluate',
  '/v1/reporting/subscriptions/{subscriptionKey}',
] as const;

/** M2.7 Part 4 CMS workflow routes. */
const REQUIRED_M27_CMS_PART4_PATHS = [
  '/v1/admin/cms/entries/{entryId}/approve-client',
  '/v1/admin/cms/entries/{entryId}/schedule',
  '/v1/admin/cms/approvals/pending',
  '/v1/admin/cms/workflow/run-due',
] as const;

/** Cross-cutting file upload routes. */
const REQUIRED_FILE_UPLOAD_PATHS = [
  '/v1/files',
  '/v1/files/{uploadId}/complete',
  '/v1/files/{uploadId}/download',
] as const;

function loadOpenApiPaths(spec: string): Set<string> {
  const paths = new Set<string>();
  for (const match of spec.matchAll(/^  (\/v1\/[^\s:]+):/gm)) {
    paths.add(match[1] ?? '');
  }
  return paths;
}

describe('OpenAPI M2.6 route coverage', () => {
  const spec = readFileSync(openapiPath, 'utf8');

  it('documents core audit/compliance/capa/risk staff and portal endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_M26_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes compliance analytics executive schema reference', () => {
    expect(spec).toContain('ComplianceExecutiveDashboard');
    expect(spec).toContain('PortalComplianceResponse');
  });
});

describe('OpenAPI M2.7 admin route coverage', () => {
  const spec = readFileSync(openapiPath, 'utf8');

  it('documents admin governance endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_M27_ADMIN_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes admin dashboard schema reference', () => {
    expect(spec).toContain('AdminDashboardData');
    expect(spec).toContain('PlatformAuditLogEntry');
  });
});

describe('OpenAPI M2.7 CMS route coverage', () => {
  const spec = readFileSync(openapiPath, 'utf8');

  it('documents CMS admin endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_M27_CMS_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes CMS schema references', () => {
    expect(spec).toContain('CmsDashboardData');
    expect(spec).toContain('CmsEntryDetail');
  });

  it('documents CMS Part 4 workflow endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_M27_CMS_PART4_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('OpenAPI M2.7 public content route coverage', () => {
  const spec = readFileSync(openapiPath, 'utf8');

  it('documents public content endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_M27_CONTENT_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes public content schema references', () => {
    expect(spec).toContain('PublicContentEntry');
    expect(spec).toContain('CmsContentSnapshot');
  });
});

describe('OpenAPI file upload route coverage', () => {
  const spec = readFileSync(openapiPath, 'utf8');

  it('documents file upload endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_FILE_UPLOAD_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes file upload schema references', () => {
    expect(spec).toContain('FileUploadSummary');
    expect(spec).toContain('InitiateFileUploadRequest');
  });
});

describe('OpenAPI M2.8 reporting route coverage', () => {
  const spec = readFileSync(openapiPath, 'utf8');

  it('documents reporting endpoints', () => {
    const paths = loadOpenApiPaths(spec);
    const missing = REQUIRED_M28_REPORTING_PATHS.filter((route) => !paths.has(route));
    expect(missing, `Missing OpenAPI paths: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes reporting schema references', () => {
    expect(spec).toContain('ReportingExecutiveSummary');
    expect(spec).toContain('ReportingKpiSnapshot');
    expect(spec).toContain('ReportingDashboardView');
    expect(spec).toContain('ReportingWidgetCatalogEntry');
    expect(spec).toContain('ReportingReportExecutionResult');
    expect(spec).toContain('ReportingExportJob');
    expect(spec).toContain('ReportingSchedule');
    expect(spec).toContain('ReportingBiConnection');
    expect(spec).toContain('ReportingBenchmarkComparison');
    expect(spec).toContain('ReportingTrendAnalysis');
    expect(spec).toContain('ReportingForecast');
    expect(spec).toContain('ReportingKpiSubscription');
  });
});

const REQUIRED_M28_REPORTING_HOOKS = [
  'useReportingExecutiveSummary',
  'useReportingListDashboards',
  'useReportingListReports',
  'useReportingCreateExport',
  'useReportingListSchedules',
  'useReportingListBiConnections',
  'useReportingCompareBenchmarks',
  'useReportingGetTrendAnalysis',
  'useReportingListForecasts',
  'useReportingListSubscriptions',
] as const;

describe('M2.8 reporting Orval hook coverage', () => {
  const clientSource = readFileSync(
    path.join(repoRoot, 'lib', 'api-client-react', 'src', 'generated', 'api.ts'),
    'utf8',
  );

  it('generates React Query hooks for staff portal reporting pages', () => {
    const missing = REQUIRED_M28_REPORTING_HOOKS.filter((hook) => !clientSource.includes(hook));
    expect(missing, `Missing Orval hooks: ${missing.join(', ')}`).toEqual([]);
  });
});
