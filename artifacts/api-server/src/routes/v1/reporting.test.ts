import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const reportingRoutes = [
  '/api/v1/reporting/kpi-definitions',
  '/api/v1/reporting/kpis',
  '/api/v1/reporting/executive-summary',
  '/api/v1/reporting/views',
  '/api/v1/reporting/definitions',
  '/api/v1/reporting/widgets/catalog',
  '/api/v1/reporting/dashboards',
  '/api/v1/reporting/reports',
  '/api/v1/reporting/exports',
  '/api/v1/reporting/schedules',
  '/api/v1/reporting/bi/connections',
  '/api/v1/reporting/bi/exports',
  '/api/v1/reporting/benchmarks/cohorts',
  '/api/v1/reporting/benchmarks/compare',
  '/api/v1/reporting/forecasts',
  '/api/v1/reporting/subscriptions',
] as const;

const reportingMutations = [
  ['POST', '/api/v1/reporting/refresh'],
  ['POST', '/api/v1/reporting/reports/demo/run'],
  ['POST', '/api/v1/reporting/reports/demo/export'],
  ['POST', '/api/v1/reporting/schedules/run-due'],
  ['POST', '/api/v1/reporting/bi/connections/acme-executive/export'],
  ['POST', '/api/v1/reporting/forecasts/refresh'],
  ['POST', '/api/v1/reporting/subscriptions/evaluate'],
] as const;

describe('reporting route authentication', () => {
  it.each(reportingRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });

  it.each(reportingMutations)('rejects unauthenticated %s %s', async (method, path) => {
    const res = await request(app)[method.toLowerCase() as 'post'](path);
    expect([401, 503]).toContain(res.status);
  });
});
