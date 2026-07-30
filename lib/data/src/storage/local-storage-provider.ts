import { createHmac, randomBytes } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '@workspace/platform/errors';
import {
  assertValidSignedUrlTtl,
  type PutObjectInput,
  type SignedUrlInput,
  type StorageKey,
  type StorageObjectMetadata,
  type StorageProvider,
} from '@workspace/platform/storage';

export interface LocalStorageProviderOptions {
  readonly rootDir: string;
  readonly baseUrl?: string;
  readonly signingSecret?: string;
  readonly now?: () => Date;
}

/**
 * Filesystem-backed storage for local development.
 *
 * Signed URLs are simulated with an HMAC token and expiry timestamp so callers
 * exercise the same permission-gated access flow as production object storage.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local-filesystem';

  private readonly rootDir: string;
  private readonly baseUrl: string;
  private readonly signingSecret: string;
  private readonly now: () => Date;

  constructor(options: LocalStorageProviderOptions) {
    this.rootDir = path.resolve(options.rootDir);
    this.baseUrl = options.baseUrl ?? 'http://127.0.0.1:8787/storage';
    this.signingSecret =
      options.signingSecret ?? randomBytes(32).toString('hex');
    this.now = options.now ?? (() => new Date());
  }

  async put(input: PutObjectInput): Promise<StorageObjectMetadata> {
    const filePath = this.resolvePath(input.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);

    const metadata: StorageObjectMetadata = {
      key: input.key,
      size: input.body.byteLength,
      contentType: input.contentType,
      lastModified: this.now(),
    };

    return metadata;
  }

  async get(key: StorageKey): Promise<Uint8Array | null> {
    try {
      const buffer = await readFile(this.resolvePath(key));
      return new Uint8Array(buffer);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async head(key: StorageKey): Promise<StorageObjectMetadata | null> {
    try {
      const filePath = this.resolvePath(key);
      const fileStat = await stat(filePath);

      return {
        key,
        size: fileStat.size,
        contentType: inferContentType(key),
        lastModified: fileStat.mtime,
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async delete(key: StorageKey): Promise<void> {
    try {
      await rm(this.resolvePath(key), { force: true });
    } catch (error) {
      if (isNotFound(error)) return;
      throw error;
    }
  }

  async signedReadUrl(input: SignedUrlInput): Promise<string> {
    assertValidSignedUrlTtl(input.expiresInSeconds);
    return this.buildSignedUrl('read', input);
  }

  async signedWriteUrl(input: SignedUrlInput): Promise<string> {
    assertValidSignedUrlTtl(input.expiresInSeconds);
    return this.buildSignedUrl('write', input);
  }

  /** Validate a simulated signed URL and return the storage key when valid. */
  verifySignedUrl(url: string): { key: StorageKey; mode: 'read' | 'write' } {
    const parsed = new URL(url);
    const key = parsed.searchParams.get('key');
    const mode = parsed.searchParams.get('mode');
    const expiresAt = Number(parsed.searchParams.get('expiresAt'));
    const signature = parsed.searchParams.get('sig');

    if (key === null || key === '') {
      throw AppError.badRequest('Signed URL key is missing');
    }

    if (mode !== 'read' && mode !== 'write') {
      throw AppError.badRequest('Signed URL mode is invalid');
    }

    if (!Number.isFinite(expiresAt) || expiresAt < this.now().getTime()) {
      throw AppError.badRequest('Signed URL has expired');
    }

    const expected = this.sign(key, mode, expiresAt);
    if (signature !== expected) {
      throw AppError.forbidden('Signed URL signature is invalid');
    }

    return { key, mode };
  }

  private buildSignedUrl(mode: 'read' | 'write', input: SignedUrlInput): string {
    const expiresAt =
      this.now().getTime() + input.expiresInSeconds * 1000;
    const signature = this.sign(input.key, mode, expiresAt);
    const url = new URL(this.baseUrl);

    url.searchParams.set('key', input.key);
    url.searchParams.set('mode', mode);
    url.searchParams.set('expiresAt', String(expiresAt));
    url.searchParams.set('sig', signature);

    if (input.downloadFilename !== undefined) {
      url.searchParams.set('filename', input.downloadFilename);
    }

    return url.toString();
  }

  private sign(
    key: StorageKey,
    mode: 'read' | 'write',
    expiresAt: number,
  ): string {
    return createHmac('sha256', this.signingSecret)
      .update(`${mode}:${key}:${expiresAt}`)
      .digest('hex');
  }

  private resolvePath(key: StorageKey): string {
    const normalised = path.normalize(key);

    if (normalised.includes('..') || path.isAbsolute(normalised)) {
      throw AppError.badRequest(`Invalid storage key: ${key}`);
    }

    const resolved = path.resolve(this.rootDir, normalised);
    const relative = path.relative(this.rootDir, resolved);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw AppError.badRequest(`Invalid storage key: ${key}`);
    }

    return resolved;
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}

function inferContentType(key: StorageKey): string {
  const extension = path.extname(key).toLowerCase();

  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}
