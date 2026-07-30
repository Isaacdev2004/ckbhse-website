import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

const portalRoutes = [
  '/api/v1/portal/dashboard',
  '/api/v1/portal/organisation',
  '/api/v1/portal/users',
  '/api/v1/portal/projects',
  '/api/v1/portal/documents',
  '/api/v1/portal/certificates',
  '/api/v1/portal/compliance',
  '/api/v1/portal/audits',
  '/api/v1/portal/audits/calendar',
  '/api/v1/portal/audits/history',
  '/api/v1/portal/audits/reports',
  '/api/v1/portal/inspections',
  '/api/v1/portal/inspections/calendar',
  '/api/v1/portal/inspections/history',
  '/api/v1/portal/capa',
  '/api/v1/portal/capa/dashboard',
  '/api/v1/portal/risk-assessments',
  '/api/v1/portal/risk-assessments/dashboard',
  '/api/v1/portal/risk-assessments/heatmap',
  '/api/v1/portal/incidents',
  '/api/v1/portal/actions',
  '/api/v1/portal/support',
  '/api/v1/portal/messages',
  '/api/v1/portal/activity',
  '/api/v1/portal/settings',
  '/api/v1/portal/training',
];

describe('portal route authentication', () => {
  it.each(portalRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
    expect(['unauthorized', 'service_unavailable']).toContain(res.body.error.code);
  });
});

describe('portal route availability', () => {
  it('rejects portal search when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/portal/search?q=test');
    expect([401, 503]).toContain(res.status);
  });

  it('returns 503 or 401 for support ticket creation without session', async () => {
    const res = await request(app)
      .post('/api/v1/portal/support')
      .send({ subject: 'Help needed' });
    expect([401, 503]).toContain(res.status);
  });
});
