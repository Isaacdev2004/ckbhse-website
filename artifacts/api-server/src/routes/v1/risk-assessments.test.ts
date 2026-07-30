import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

describe('risk-assessments route authentication', () => {
  it.each([
    '/api/v1/risk-assessments/dashboard',
    '/api/v1/risk-assessments/heatmap',
    '/api/v1/risk-assessments/matrix',
    '/api/v1/risk-assessments/hazards',
    '/api/v1/risk-assessments',
  ])('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });

  it('rejects risk assessment creation when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/risk-assessments').send({ title: 'Test RA' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects hazard creation when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/risk-assessments/hazards')
      .send({ title: 'Slip hazard' });
    expect([401, 503]).toContain(res.status);
  });
});
