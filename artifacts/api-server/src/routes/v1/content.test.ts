import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

describe('public content routes', () => {
  it('lists published entries without authentication', async () => {
    const res = await request(app).get('/api/v1/content/entries');
    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.items)).toBe(true);
    }
  });

  it('returns snapshot without authentication', async () => {
    const res = await request(app).get('/api/v1/content/snapshot');
    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.entries)).toBe(true);
    }
  });
});

describe('admin CMS media/SEO authentication', () => {
  it.each([
    '/api/v1/admin/cms/media',
    '/api/v1/admin/cms/seo',
  ] as const)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });
});
