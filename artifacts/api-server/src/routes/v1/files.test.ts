import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('files routes', () => {
  it('returns 401 for complete when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/files/upload-1/complete');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('returns 401 for download when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/files/upload-1/download');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });
});
