import path from 'node:path';
import type { StorageProvider } from '@workspace/platform/storage';
import { LocalStorageProvider } from './local-storage-provider.js';
import { S3StorageProvider } from './s3-storage-provider.js';

export interface CreateStorageProviderOptions {
  readonly provider?: string;
  readonly storageRoot?: string;
  readonly storageBaseUrl?: string;
  readonly s3Bucket?: string;
  readonly s3Region?: string;
  readonly s3AccessKeyId?: string;
  readonly s3SecretAccessKey?: string;
  readonly s3Endpoint?: string;
  readonly s3ForcePathStyle?: boolean;
}

export function createStorageProvider(
  env: Record<string, string | undefined> = process.env,
  overrides: CreateStorageProviderOptions = {},
): StorageProvider {
  const provider = (
    overrides.provider ??
    env.STORAGE_PROVIDER ??
    'local'
  ).toLowerCase();

  if (provider === 's3') {
    const bucket = overrides.s3Bucket ?? env.S3_BUCKET ?? env.STORAGE_BUCKET;
    const region = overrides.s3Region ?? env.S3_REGION ?? env.AWS_REGION ?? 'eu-west-2';

    if (bucket === undefined || bucket.trim() === '') {
      throw new Error('S3 storage requires S3_BUCKET or STORAGE_BUCKET');
    }

    const accessKeyId =
      overrides.s3AccessKeyId ?? env.S3_ACCESS_KEY_ID ?? env.AWS_ACCESS_KEY_ID;
    const secretAccessKey =
      overrides.s3SecretAccessKey ??
      env.S3_SECRET_ACCESS_KEY ??
      env.AWS_SECRET_ACCESS_KEY;
    const endpoint = overrides.s3Endpoint ?? env.S3_ENDPOINT;
    const forcePathStyle =
      overrides.s3ForcePathStyle ??
      (env.S3_FORCE_PATH_STYLE === 'true' ||
        env.STORAGE_FORCE_PATH_STYLE === 'true');

    return new S3StorageProvider({
      bucket,
      region,
      ...(accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : {}),
      ...(endpoint ? { endpoint } : {}),
      ...(forcePathStyle ? { forcePathStyle: true } : {}),
    });
  }

  const storageRoot =
    overrides.storageRoot ??
    env.STORAGE_ROOT ??
    path.join(process.cwd(), '.storage');

  return new LocalStorageProvider({
    rootDir: storageRoot,
    ...(overrides.storageBaseUrl ?? env.STORAGE_BASE_URL
      ? { baseUrl: (overrides.storageBaseUrl ?? env.STORAGE_BASE_URL)! }
      : {}),
  });
}
