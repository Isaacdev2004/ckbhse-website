import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildTenantKey } from '@workspace/platform/storage';
import { LocalStorageProvider } from './local-storage-provider.js';

describe('LocalStorageProvider', () => {
  const directories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      directories.splice(0).map((directory) =>
        rm(directory, { recursive: true, force: true }),
      ),
    );
  });

  async function createStorage(): Promise<LocalStorageProvider> {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'ckbhse-storage-'));
    directories.push(rootDir);

    return new LocalStorageProvider({
      rootDir,
      baseUrl: 'http://127.0.0.1:8787/storage',
      signingSecret: 'test-secret',
      now: () => new Date('2026-07-29T10:00:00.000Z'),
    });
  }

  it('round-trips an object on the filesystem', async () => {
    const storage = await createStorage();
    const key = buildTenantKey('org-1', 'documents', 'report.pdf');
    const body = new TextEncoder().encode('report contents');

    const metadata = await storage.put({
      key,
      body,
      contentType: 'application/pdf',
    });

    expect(metadata.size).toBe(body.byteLength);
    expect(await storage.get(key)).toEqual(body);
  });

  it('issues and verifies a signed read URL', async () => {
    const storage = await createStorage();
    const key = buildTenantKey('org-1', 'documents', 'report.pdf');

    await storage.put({
      key,
      body: new TextEncoder().encode('report contents'),
      contentType: 'application/pdf',
    });

    const url = await storage.signedReadUrl({
      key,
      expiresInSeconds: 300,
      downloadFilename: 'report.pdf',
    });

    expect(storage.verifySignedUrl(url)).toEqual({ key, mode: 'read' });
  });

  it('rejects tampered signed URLs', async () => {
    const storage = await createStorage();
    const key = buildTenantKey('org-1', 'documents', 'report.pdf');

    const url = await storage.signedReadUrl({
      key,
      expiresInSeconds: 300,
    });

    const tampered = url.replace('sig=', 'sig=deadbeef');

    expect(() => storage.verifySignedUrl(tampered)).toThrowError(
      expect.objectContaining({ code: 'forbidden' }),
    );
  });

  it('deletes stored objects', async () => {
    const storage = await createStorage();
    const key = buildTenantKey('org-1', 'documents', 'report.pdf');

    await storage.put({
      key,
      body: new TextEncoder().encode('report contents'),
      contentType: 'application/pdf',
    });

    await storage.delete(key);

    expect(await storage.get(key)).toBeNull();
    expect(await storage.head(key)).toBeNull();
  });
});
