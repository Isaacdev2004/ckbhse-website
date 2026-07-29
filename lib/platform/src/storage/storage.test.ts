import { describe, expect, it } from 'vitest';
import {
  InMemoryStorageProvider,
  MAX_SIGNED_URL_TTL_SECONDS,
  assertValidSignedUrlTtl,
  buildTenantKey,
} from './index.js';

describe('buildTenantKey', () => {
  it('prefixes with the organisation', () => {
    expect(buildTenantKey('org-1', 'documents', 'report.pdf')).toBe(
      'org/org-1/documents/report.pdf',
    );
  });

  it('rejects path traversal rather than sanitising it', () => {
    // Silently rewriting a `..` segment hides both the bug and the attempt.
    expect(() =>
      buildTenantKey('org-1', '../org-2', 'secret.pdf'),
    ).toThrowError(expect.objectContaining({ code: 'bad_request' }));
  });

  it('rejects an absolute segment', () => {
    expect(() => buildTenantKey('org-1', '/etc/passwd')).toThrowError(
      expect.objectContaining({ code: 'bad_request' }),
    );
  });

  it('requires an organisation', () => {
    expect(() => buildTenantKey('  ', 'file.pdf')).toThrowError(
      /requires an organisation/,
    );
  });
});

describe('assertValidSignedUrlTtl', () => {
  it('accepts a short expiry', () => {
    expect(() => assertValidSignedUrlTtl(300)).not.toThrow();
  });

  it('rejects an expiry beyond the maximum', () => {
    // A long-lived signed URL is a bearer token that outlives the permission
    // check that produced it.
    expect(() =>
      assertValidSignedUrlTtl(MAX_SIGNED_URL_TTL_SECONDS + 1),
    ).toThrowError(expect.objectContaining({ code: 'bad_request' }));
  });

  it('rejects a non-positive expiry', () => {
    expect(() => assertValidSignedUrlTtl(0)).toThrowError(
      expect.objectContaining({ code: 'bad_request' }),
    );
  });
});

describe('InMemoryStorageProvider', () => {
  const body = new TextEncoder().encode('report contents');

  it('round-trips an object with metadata', async () => {
    const storage = new InMemoryStorageProvider();
    const key = buildTenantKey('org-1', 'reports', 'q1.pdf');

    const metadata = await storage.put({
      key,
      body,
      contentType: 'application/pdf',
    });

    expect(metadata.size).toBe(body.byteLength);
    expect(metadata.contentType).toBe('application/pdf');
    expect(await storage.get(key)).toEqual(body);
  });

  it('reports a missing object as null rather than throwing', async () => {
    const storage = new InMemoryStorageProvider();

    expect(await storage.get('org/org-1/absent.pdf')).toBeNull();
    expect(await storage.head('org/org-1/absent.pdf')).toBeNull();
  });

  it('deletes an object', async () => {
    const storage = new InMemoryStorageProvider();
    await storage.put({ key: 'k', body, contentType: 'text/plain' });

    await storage.delete('k');

    expect(storage.size).toBe(0);
  });

  it('enforces the expiry cap on signed URLs', async () => {
    const storage = new InMemoryStorageProvider();

    await expect(
      storage.signedReadUrl({ key: 'k', expiresInSeconds: 86_400 }),
    ).rejects.toMatchObject({ code: 'bad_request' });
  });

  it('carries a download filename into the signed URL', async () => {
    const storage = new InMemoryStorageProvider();

    const url = await storage.signedReadUrl({
      key: 'k',
      expiresInSeconds: 60,
      downloadFilename: 'audit-report.pdf',
    });

    expect(url).toContain('filename=audit-report.pdf');
  });

  it('distinguishes read from write URLs', async () => {
    const storage = new InMemoryStorageProvider();

    const read = await storage.signedReadUrl({
      key: 'k',
      expiresInSeconds: 60,
    });
    const write = await storage.signedWriteUrl({
      key: 'k',
      expiresInSeconds: 60,
    });

    expect(read).toContain('mode=read');
    expect(write).toContain('mode=write');
  });
});
