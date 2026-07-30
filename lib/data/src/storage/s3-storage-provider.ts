import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '@workspace/platform/errors';
import {
  assertValidSignedUrlTtl,
  type PutObjectInput,
  type SignedUrlInput,
  type StorageKey,
  type StorageObjectMetadata,
  type StorageProvider,
} from '@workspace/platform/storage';

export interface S3StorageProviderOptions {
  readonly bucket: string;
  readonly region: string;
  readonly accessKeyId?: string;
  readonly secretAccessKey?: string;
  readonly endpoint?: string;
  readonly forcePathStyle?: boolean;
  readonly now?: () => Date;
}

/**
 * S3-compatible object storage for production CMS media and compliance evidence.
 * Works with AWS S3, Cloudflare R2, MinIO, and other S3-compatible providers.
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = 's3';

  private readonly bucket: string;
  private readonly client: S3Client;
  private readonly now: () => Date;

  constructor(options: S3StorageProviderOptions) {
    if (options.bucket.trim() === '') {
      throw AppError.internal('S3 storage requires a bucket name');
    }

    this.bucket = options.bucket;
    this.now = options.now ?? (() => new Date());

    const clientConfig: S3ClientConfig = {
      region: options.region,
    };

    if (options.endpoint !== undefined) {
      clientConfig.endpoint = options.endpoint;
    }

    if (options.forcePathStyle === true) {
      clientConfig.forcePathStyle = true;
    }

    if (
      options.accessKeyId !== undefined &&
      options.secretAccessKey !== undefined
    ) {
      clientConfig.credentials = {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  async put(input: PutObjectInput): Promise<StorageObjectMetadata> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        Metadata: input.metadata,
      }),
    );

    return {
      key: input.key,
      size: input.body.byteLength,
      contentType: input.contentType,
      lastModified: this.now(),
    };
  }

  async get(key: StorageKey): Promise<Uint8Array | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (response.Body === undefined) {
        return null;
      }

      return new Uint8Array(await response.Body.transformToByteArray());
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async head(key: StorageKey): Promise<StorageObjectMetadata | null> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        key,
        size: response.ContentLength ?? 0,
        contentType: response.ContentType ?? 'application/octet-stream',
        lastModified: response.LastModified ?? this.now(),
        ...(response.ETag !== undefined ? { checksum: response.ETag } : {}),
      };
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(key: StorageKey): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async signedReadUrl(input: SignedUrlInput): Promise<string> {
    assertValidSignedUrlTtl(input.expiresInSeconds);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      ...(input.downloadFilename !== undefined
        ? { ResponseContentDisposition: `attachment; filename="${input.downloadFilename}"` }
        : {}),
    });
    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    });
  }

  async signedWriteUrl(input: SignedUrlInput): Promise<string> {
    assertValidSignedUrlTtl(input.expiresInSeconds);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    });
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error.name === 'NotFound' || error.name === 'NoSuchKey')
  );
}
