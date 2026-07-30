import { test, expect } from '@playwright/test';

test.describe('platform smoke', () => {
  test('versioned health endpoint responds ok', async ({ request }) => {
    const response = await request.get('/api/v1/health');
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  test('unauthenticated session probe returns unauthorized', async ({ request }) => {
    const response = await request.get('/api/v1/auth/session');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe('unauthorized');
  });

  test('unauthenticated file upload returns unauthorized', async ({ request }) => {
    const response = await request.post('/api/v1/files', {
      data: {
        originalFilename: 'report.pdf',
        contentType: 'application/pdf',
        sizeBytes: 1024,
        domain: 'documents',
      },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe('unauthorized');
  });
});
