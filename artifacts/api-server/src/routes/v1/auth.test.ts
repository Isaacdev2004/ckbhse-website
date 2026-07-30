import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('auth routes', () => {
  it('returns 503 for login when authentication is not configured', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'consultant@ckbhse.co.uk',
      password: 'StaffDev123!',
    });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('service_unavailable');
  });

  it('returns 401 for session when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/auth/session');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('returns 503 for password reset when authentication is not configured', async () => {
    const res = await request(app)
      .post('/api/v1/auth/request-password-reset')
      .send({ email: 'consultant@ckbhse.co.uk' });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('service_unavailable');
  });
});
