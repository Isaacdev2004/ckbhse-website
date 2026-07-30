import { describe, expect, it } from 'vitest';
import { createStorageProvider } from './create-storage-provider.js';
import { LocalStorageProvider } from './local-storage-provider.js';
import { S3StorageProvider } from './s3-storage-provider.js';

describe('createStorageProvider', () => {
  it('defaults to local filesystem storage', () => {
    const storage = createStorageProvider({});
    expect(storage).toBeInstanceOf(LocalStorageProvider);
    expect(storage.name).toBe('local-filesystem');
  });

  it('creates S3 storage when configured', () => {
    const storage = createStorageProvider(
      {},
      {
        provider: 's3',
        s3Bucket: 'ckbhse-media',
        s3Region: 'eu-west-2',
      },
    );
    expect(storage).toBeInstanceOf(S3StorageProvider);
    expect(storage.name).toBe('s3');
  });

  it('throws when S3 bucket is missing', () => {
    expect(() => createStorageProvider({}, { provider: 's3' })).toThrow(
      'S3 storage requires S3_BUCKET or STORAGE_BUCKET',
    );
  });
});
