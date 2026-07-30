import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const auditRoutes = [
  '/api/v1/audits/dashboard',
  '/api/v1/audits/types',
  '/api/v1/audits/calendar',
  '/api/v1/audits/templates',
  '/api/v1/audits',
];

describe('audit route authentication', () => {
  it.each(auditRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });
});

describe('audit route availability', () => {
  it('rejects audit creation when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/audits').send({ name: 'Test' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects audit detail when unauthenticated', async () => {
    const res = await request(app).get(
      '/api/v1/audits/00000000-0000-4000-8000-000000000099',
    );
    expect([401, 503]).toContain(res.status);
  });
});
