import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const adminRoutes = [
  '/api/v1/admin/dashboard',
  '/api/v1/admin/organizations',
  '/api/v1/admin/users',
  '/api/v1/admin/roles',
  '/api/v1/admin/permissions',
  '/api/v1/admin/audit-logs',
  '/api/v1/admin/feature-flags',
  '/api/v1/admin/system/health',
  '/api/v1/admin/system/version',
] as const;

describe('admin route authentication', () => {
  it.each(adminRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });

  it('rejects feature flag update when unauthenticated', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/feature-flags/demo_flag')
      .send({ enabled: true });
    expect([401, 503]).toContain(res.status);
  });
});
