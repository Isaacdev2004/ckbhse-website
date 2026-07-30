import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('v1 foundation routes', () => {
  it('reports versioned liveness', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 401 for auth session when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/auth/session');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('returns 401 for current user when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('returns 401 for file upload when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/files').send({
      originalFilename: 'report.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
      domain: 'documents',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('returns 503 for contact when platform services are not configured', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      firstName: 'Alex',
      lastName: 'Taylor',
      email: 'alex@example.com',
      serviceInterest: 'Consulting',
      message: 'We would like to discuss certification support.',
    });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('service_unavailable');
  });

  it('returns 422 for invalid contact payloads', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      firstName: '',
      lastName: 'Taylor',
      email: 'not-an-email',
      serviceInterest: '',
      message: 'short',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('unprocessable_entity');
  });

  it('returns 503 for system routes when platform services are not configured', async () => {
    const health = await request(app).get('/api/v1/system/health');
    const version = await request(app).get('/api/v1/system/version');

    expect(health.status).toBe(503);
    expect(version.status).toBe(503);
  });
});
