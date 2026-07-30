import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const capaRoutes = [
  '/api/v1/capa/dashboard',
  '/api/v1/capa',
];

describe('capa route authentication', () => {
  it.each(capaRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa creation when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/capa').send({
      title: 'Test CAPA',
      capaType: 'corrective',
    });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa detail when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/capa/00000000-0000-4000-8000-000000000099');
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa update when unauthenticated', async () => {
    const res = await request(app)
      .patch('/api/v1/capa/00000000-0000-4000-8000-000000000099')
      .send({ title: 'Updated' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa RCA save when unauthenticated', async () => {
    const res = await request(app)
      .put('/api/v1/capa/00000000-0000-4000-8000-000000000099/rca')
      .send({ summary: 'Root cause' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa verify when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/capa/00000000-0000-4000-8000-000000000099/verify')
      .send({ result: 'effective' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa approve when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/capa/00000000-0000-4000-8000-000000000099/approve')
      .send({ comments: 'Approved' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa close when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/capa/00000000-0000-4000-8000-000000000099/close');
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa escalate when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/capa/00000000-0000-4000-8000-000000000099/escalate')
      .send({ reason: 'Overdue' });
    expect([401, 503]).toContain(res.status);
  });

  it('rejects capa submit verification when unauthenticated', async () => {
    const res = await request(app).post(
      '/api/v1/capa/00000000-0000-4000-8000-000000000099/submit-verification',
    );
    expect([401, 503]).toContain(res.status);
  });
});
