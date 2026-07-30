import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const complianceRoutes = [
  '/api/v1/compliance/dashboard',
  '/api/v1/compliance/workspace',
  '/api/v1/compliance/calendar',
  '/api/v1/compliance/score',
  '/api/v1/compliance/legal-register',
  '/api/v1/compliance/regulations',
  '/api/v1/compliance/controls',
  '/api/v1/compliance/frameworks',
  '/api/v1/compliance/analytics/executive',
  '/api/v1/compliance/analytics/kpis',
  '/api/v1/compliance/analytics/trends',
  '/api/v1/compliance/analytics/regulatory',
  '/api/v1/compliance/analytics/iso',
  '/api/v1/compliance/analytics/controls',
  '/api/v1/compliance/analytics/performance',
  '/api/v1/compliance/analytics/alerts',
  '/api/v1/compliance/analytics/exports',
];

const inspectionRoutes = [
  '/api/v1/inspections/dashboard',
  '/api/v1/inspections/calendar',
  '/api/v1/inspections/types',
  '/api/v1/inspections',
];

describe('compliance route authentication', () => {
  it.each(complianceRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });
});

describe('inspection route authentication', () => {
  it.each(inspectionRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });

  it('rejects inspection creation when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/inspections').send({ name: 'Test' });
    expect([401, 503]).toContain(res.status);
  });
});
