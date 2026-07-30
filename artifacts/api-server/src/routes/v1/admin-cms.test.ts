import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const cmsRoutes = [
  '/api/v1/admin/cms/dashboard',
  '/api/v1/admin/cms/entries',
  '/api/v1/admin/cms/media',
  '/api/v1/admin/cms/seo',
] as const;

describe('admin CMS route authentication', () => {
  it.each(cmsRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });

  it('rejects CMS entry creation when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/admin/cms/entries').send({
      contentType: 'hub',
      slug: 'demo',
      path: '/demo',
      title: 'Demo',
      payload: {},
    });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects CMS import when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/admin/cms/import-from-files').send({});
    expect([401, 503]).toContain(res.status);
  });
});
