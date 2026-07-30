import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';
import { csrfConfig } from '../config';
import { generateCsrfToken } from './csrf';

/**
 * Covers the request-context and CSRF middleware against the real app, so the
 * mounting order in `app.ts` is exercised rather than assumed.
 */

function csrfCookie(token: string): string {
  return `${csrfConfig.cookieName}=${token}`;
}

/**
 * Supertest types `set-cookie` as a string, but Node delivers an array when more
 * than one cookie is set. Normalise both rather than trusting either.
 */
function setCookieHeader(headers: Record<string, unknown>): string {
  const raw = headers['set-cookie'];
  return (Array.isArray(raw) ? raw : [raw]).join(';');
}

describe('request context', () => {
  it('assigns a request id and echoes it in the response header', async () => {
    const res = await request(app).get('/api/healthz');

    expect(res.headers['x-request-id']).toMatch(/^[\w-]+$/);
  });

  it('propagates a well-formed client-supplied request id', async () => {
    const res = await request(app)
      .get('/api/healthz')
      .set('x-request-id', 'trace-abc-123');

    // Lets a proxy or a calling service stitch its logs to ours.
    expect(res.headers['x-request-id']).toBe('trace-abc-123');
  });

  it('replaces a malformed client-supplied request id', async () => {
    const res = await request(app)
      .get('/api/healthz')
      .set('x-request-id', 'id with spaces; injected=1');

    // The id reaches the logs, so an unconstrained value is a log-forging vector.
    expect(res.headers['x-request-id']).not.toContain(' ');
    expect(res.headers['x-request-id']).not.toContain(';');
  });

  it('replaces an over-long request id', async () => {
    const res = await request(app)
      .get('/api/healthz')
      .set('x-request-id', 'a'.repeat(200));

    expect(res.headers['x-request-id']?.length).toBeLessThan(200);
  });

  it('includes the request id in the error envelope', async () => {
    const res = await request(app)
      .get('/api/nope')
      .set('x-request-id', 'trace-err-1');

    // This is the value a user quotes in a support request, so it has to match
    // what appears in the logs.
    expect(res.body.error.requestId).toBe('trace-err-1');
  });
});

describe('CSRF protection', () => {
  it('issues a token cookie that the browser can read', async () => {
    const res = await request(app).get('/api/healthz');

    const setCookie = setCookieHeader(res.headers);

    expect(setCookie).toContain(csrfConfig.cookieName);
    // The double-submit pattern requires JavaScript to read this cookie and echo
    // it in a header, so unlike the session cookie it must not be HttpOnly.
    expect(setCookie.toLowerCase()).not.toContain('httponly');
    expect(setCookie.toLowerCase()).toContain('samesite=lax');
  });

  it('does not require a token for a safe method', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
  });

  it('exempts an unsafe request that carries no cookie', async () => {
    // CSRF attacks abuse ambient credentials. A request with none to abuse has
    // nothing to forge, which is what lets this be mounted globally before
    // authentication exists.
    const res = await request(app).post('/api/nope').send({});

    expect(res.status).toBe(404);
  });

  it('rejects a cookie-bearing unsafe request that has no CSRF cookie', async () => {
    // The exemption above must key on "no cookies at all", not on "no CSRF
    // cookie". Keying it on the CSRF cookie fails open for exactly the request
    // that matters: one presenting a session cookie without its CSRF
    // counterpart, which is what a `sameSite: 'none'` session cookie would
    // produce.
    const res = await request(app)
      .post('/api/nope')
      .set('Cookie', 'session=forged')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('forbidden');
  });

  it('rejects an unsafe request whose cookie has no matching header', async () => {
    const token = generateCsrfToken();

    const res = await request(app)
      .post('/api/nope')
      .set('Cookie', csrfCookie(token))
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('forbidden');
  });

  it('rejects an unsafe request whose header does not match its cookie', async () => {
    const res = await request(app)
      .post('/api/nope')
      .set('Cookie', csrfCookie(generateCsrfToken()))
      .set(csrfConfig.headerName, generateCsrfToken())
      .send({});

    expect(res.status).toBe(403);
  });

  it('accepts an unsafe request whose header matches its cookie', async () => {
    const token = generateCsrfToken();

    const res = await request(app)
      .post('/api/nope')
      .set('Cookie', csrfCookie(token))
      .set(csrfConfig.headerName, token)
      .send({});

    // Reaches the router, so CSRF passed; 404 is the route not existing.
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });

  it('permits a token-carrying DELETE and OPTIONS preflight', async () => {
    const token = generateCsrfToken();

    const options = await request(app)
      .options('/api/healthz')
      .set('Cookie', csrfCookie(token));

    expect(options.status).toBeLessThan(400);
  });
});

describe('session auth', () => {
  it('rejects malformed session cookies without a 500', async () => {
    const res = await request(app)
      .get('/api/v1/auth/session')
      .set('Cookie', 'ckbhse_session=invalid-session-id');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });
});

describe('error envelope consistency', () => {
  it('uses the same shape for every failure', async () => {
    const notFound = await request(app).get('/api/nope');
    const forbidden = await request(app)
      .post('/api/nope')
      .set('Cookie', csrfCookie(generateCsrfToken()))
      .send({});

    for (const res of [notFound, forbidden]) {
      expect(Object.keys(res.body)).toEqual(['error']);
      expect(res.body.error).toMatchObject({
        code: expect.any(String),
        message: expect.any(String),
        requestId: expect.any(String),
      });
    }
  });

  it('reports validation failures with field paths', async () => {
    const res = await request(app)
      .post('/api/healthz')
      .set('Content-Type', 'application/json')
      .send('{ not json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('bad_request');
  });
});
