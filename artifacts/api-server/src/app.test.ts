import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './app';

describe('health endpoints', () => {
  it('reports liveness without touching dependencies', async () => {
    const res = await request(app).get('/api/healthz');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('reports readiness while accepting traffic', async () => {
    const res = await request(app).get('/api/readyz');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready' });
  });
});

describe('error envelope', () => {
  it('returns a structured 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({
      code: 'not_found',
      message: expect.any(String),
    });
  });

  it('rejects malformed JSON as bad_request rather than a 500', async () => {
    const res = await request(app)
      .post('/api/healthz')
      .set('Content-Type', 'application/json')
      .send('{ not json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('bad_request');
  });

  it('rejects a body over the configured limit', async () => {
    const res = await request(app)
      .post('/api/healthz')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ blob: 'x'.repeat(200_000) }));

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('payload_too_large');
  });
});

describe('CORS allowlist', () => {
  it('allows a configured origin', async () => {
    const res = await request(app)
      .get('/api/healthz')
      .set('Origin', 'http://localhost:5180');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5180',
    );
  });

  it('rejects an unlisted origin', async () => {
    const res = await request(app)
      .get('/api/healthz')
      .set('Origin', 'http://evil.example.com');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('forbidden');
  });

  it('allows requests with no Origin header', async () => {
    const res = await request(app).get('/api/healthz');

    expect(res.status).toBe(200);
  });
});

describe('security headers', () => {
  it('sets a restrictive policy and hides the server framework', async () => {
    const res = await request(app).get('/api/healthz');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['content-security-policy']).toContain(
      "default-src 'none'",
    );
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
