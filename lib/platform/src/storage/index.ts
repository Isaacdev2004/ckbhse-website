/**
 * Storage provider abstraction.
 *
 * Vendor-neutral across AWS S3, Cloudinary, Azure Blob and Google Cloud Storage.
 *
 * The interface makes one security decision on every implementation's behalf:
 * there is no method that returns a public URL. Compliance documents, audit
 * evidence and training certificates are tenant data, so access is always a
 * short-lived signed URL tied to a permission check the caller has already
 * passed. An adapter that exposes a bucket publicly is not implementing this
 * interface incorrectly — it cannot express it at all.
 *
 * No uploads and no credentials in this phase.
 */

import { AppError } from '../errors/index.js';

/**
 * A storage key. Tenant-prefixed by convention (`org/<id>/...`) so that a
 * misconfigured bucket policy still segregates tenants, and so a leaked key
 * cannot be edited into another tenant's namespace without it being obvious.
 */
export type StorageKey = string;

export interface StorageObjectMetadata {
  readonly key: StorageKey;
  readonly size: number;
  readonly contentType: string;
  readonly lastModified: Date;
  readonly checksum?: string;
}

export interface PutObjectInput {
  readonly key: StorageKey;
  readonly body: Uint8Array;
  readonly contentType: string;
  /** Provider-agnostic metadata. Never put secrets here; it is often readable. */
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface SignedUrlInput {
  readonly key: StorageKey;
  readonly expiresInSeconds: number;
  /**
   * Forces a download with this filename rather than inline rendering. Set it for
   * anything user-uploaded: an inline HTML or SVG file served from the same
   * origin is a stored cross-site scripting vector.
   */
  readonly downloadFilename?: string;
}

export interface StorageProvider {
  readonly name: string;

  put(input: PutObjectInput): Promise<StorageObjectMetadata>;
  get(key: StorageKey): Promise<Uint8Array | null>;
  head(key: StorageKey): Promise<StorageObjectMetadata | null>;
  delete(key: StorageKey): Promise<void>;
  /** Time-limited read URL. The only way to hand an object to a browser. */
  signedReadUrl(input: SignedUrlInput): Promise<string>;
  /** Time-limited write URL, so large uploads bypass the API server. */
  signedWriteUrl(input: SignedUrlInput): Promise<string>;
}

export const MAX_SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Build a tenant-prefixed key.
 *
 * Path traversal is rejected rather than sanitised: a `..` segment in a storage
 * key is either a bug or an attempt, and silently rewriting it hides both.
 */
export function buildTenantKey(
  organizationId: string,
  ...segments: readonly string[]
): StorageKey {
  if (organizationId.trim() === '') {
    throw AppError.internal('A storage key requires an organisation id');
  }

  for (const segment of segments) {
    if (segment.includes('..') || segment.startsWith('/')) {
      throw AppError.badRequest(`Invalid storage key segment: ${segment}`);
    }
  }

  return ['org', organizationId, ...segments].join('/');
}

export function assertValidSignedUrlTtl(expiresInSeconds: number): void {
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1) {
    throw AppError.badRequest('Signed URL expiry must be a positive integer');
  }

  // A long-lived signed URL is a bearer token that outlives the permission that
  // produced it, and one pasted into an email is a permanent grant.
  if (expiresInSeconds > MAX_SIGNED_URL_TTL_SECONDS) {
    throw AppError.badRequest(
      `Signed URL expiry must not exceed ${MAX_SIGNED_URL_TTL_SECONDS} seconds`,
    );
  }
}

/** In-memory storage for tests and local development. */
export class InMemoryStorageProvider implements StorageProvider {
  readonly name = 'in-memory';

  private readonly objects = new Map<
    StorageKey,
    { body: Uint8Array; metadata: StorageObjectMetadata }
  >();

  constructor(private readonly now: () => Date = () => new Date()) {}

  put(input: PutObjectInput): Promise<StorageObjectMetadata> {
    const metadata: StorageObjectMetadata = {
      key: input.key,
      size: input.body.byteLength,
      contentType: input.contentType,
      lastModified: this.now(),
    };

    this.objects.set(input.key, { body: input.body, metadata });
    return Promise.resolve(metadata);
  }

  get(key: StorageKey): Promise<Uint8Array | null> {
    return Promise.resolve(this.objects.get(key)?.body ?? null);
  }

  head(key: StorageKey): Promise<StorageObjectMetadata | null> {
    return Promise.resolve(this.objects.get(key)?.metadata ?? null);
  }

  delete(key: StorageKey): Promise<void> {
    this.objects.delete(key);
    return Promise.resolve();
  }

  // `async` so an invalid expiry rejects rather than throwing synchronously from
  // a method typed `Promise<string>`.
  async signedReadUrl(input: SignedUrlInput): Promise<string> {
    assertValidSignedUrlTtl(input.expiresInSeconds);
    return this.fakeSignedUrl('read', input);
  }

  async signedWriteUrl(input: SignedUrlInput): Promise<string> {
    assertValidSignedUrlTtl(input.expiresInSeconds);
    return this.fakeSignedUrl('write', input);
  }

  private fakeSignedUrl(mode: 'read' | 'write', input: SignedUrlInput): string {
    const expiresAt = this.now().getTime() + input.expiresInSeconds * 1000;
    const params = new URLSearchParams({
      mode,
      expiresAt: String(expiresAt),
    });

    if (input.downloadFilename !== undefined) {
      params.set('filename', input.downloadFilename);
    }

    return `memory://${input.key}?${params.toString()}`;
  }

  get size(): number {
    return this.objects.size;
  }

  clear(): void {
    this.objects.clear();
  }
}
