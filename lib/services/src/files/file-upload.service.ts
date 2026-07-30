import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { AppError } from '@workspace/platform/errors';
import {
  buildTenantKey,
  MAX_SIGNED_URL_TTL_SECONDS,
  type StorageProvider,
} from '@workspace/platform/storage';
import type { FileScanProvider } from '@workspace/platform/files/scan';
import { createFileScanProviderFromEnv } from '@workspace/platform/files/scan';
import type { FileUploadRepository } from '@workspace/data/repositories/file-upload';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import { resolveTenantScope } from '@workspace/platform/authorization';
import type {
  CompleteFileUploadResult,
  FileDownloadGrant,
  FileUploadSummary,
  InitiateFileUploadInput,
  InitiateFileUploadResult,
} from '@workspace/domain/files';

export const MAX_FILE_UPLOAD_BYTES = 52_428_800;
export const FILE_UPLOAD_SIGNED_URL_TTL_SECONDS = MAX_SIGNED_URL_TTL_SECONDS;
const FILE_SCAN_SAMPLE_BYTES = 512;

const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function mapRow(row: {
  id: string;
  organizationId: string;
  storageKey: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: string;
  status: FileUploadSummary['status'];
  domain: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: Date;
}): FileUploadSummary {
  return {
    id: row.id,
    organizationId: row.organizationId,
    storageKey: row.storageKey,
    originalFilename: row.originalFilename,
    contentType: row.contentType,
    sizeBytes: Number(row.sizeBytes),
    status: row.status,
    domain: row.domain,
    entityType: row.entityType,
    entityId: row.entityId,
    createdAt: row.createdAt.toISOString(),
  };
}

function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).replace(/[^\w.\-()+ ]+/g, '_');
  return base.length > 0 ? base.slice(0, 180) : 'upload.bin';
}

function buildStoredFilename(originalFilename: string): string {
  const extension = path.extname(originalFilename).toLowerCase().slice(0, 12);
  return `${randomUUID()}${extension}`;
}

export class FileUploadService {
  constructor(
    private readonly uploads: FileUploadRepository,
    private readonly storage: StorageProvider,
    private readonly scanner: FileScanProvider = createFileScanProviderFromEnv(),
  ) {}

  async initiateUpload(
    context: AuthorizationContext,
    input: InitiateFileUploadInput,
  ): Promise<InitiateFileUploadResult> {
    this.assertValidUploadInput(input);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('File uploads require an organization context');
    }

    const uploadId = randomUUID();
    const storedFilename = buildStoredFilename(input.originalFilename);
    const storageKey = buildTenantKey(
      organizationId,
      input.domain,
      uploadId,
      storedFilename,
    );

    const [row] = await this.uploads.createPending(context, {
      id: uploadId,
      storageKey,
      originalFilename: sanitizeFilename(input.originalFilename),
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      domain: input.domain,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
    });

    if (!row) {
      throw AppError.internal('Failed to create file upload record');
    }

    const uploadUrl = await this.storage.signedWriteUrl({
      key: storageKey,
      expiresInSeconds: FILE_UPLOAD_SIGNED_URL_TTL_SECONDS,
    });

    return {
      upload: mapRow(row),
      uploadUrl,
      expiresInSeconds: FILE_UPLOAD_SIGNED_URL_TTL_SECONDS,
    };
  }

  async completeUpload(
    context: AuthorizationContext,
    uploadId: string,
  ): Promise<CompleteFileUploadResult> {
    const existing = await this.uploads.getForOrganization(context, uploadId);
    if (!existing) {
      throw AppError.notFound('File upload not found');
    }

    if (existing.status !== 'pending') {
      throw AppError.conflict(`Upload is already ${existing.status}`);
    }

    const metadata = await this.storage.head(existing.storageKey);
    if (metadata === null) {
      await this.uploads.markFailed(context, uploadId);
      throw AppError.unprocessable('Uploaded object was not found in storage');
    }

    const expectedSize = Number(existing.sizeBytes);
    if (metadata.size > MAX_FILE_UPLOAD_BYTES) {
      await this.uploads.markFailed(context, uploadId);
      throw AppError.unprocessable('Uploaded file exceeds the maximum size');
    }

    if (expectedSize > 0 && metadata.size !== expectedSize) {
      await this.uploads.markFailed(context, uploadId);
      throw AppError.unprocessable('Uploaded file size does not match declaration');
    }

    const body = await this.storage.get(existing.storageKey);
    if (body === null) {
      await this.uploads.markFailed(context, uploadId);
      throw AppError.unprocessable('Uploaded object could not be read for verification');
    }

    const scanSample = body.subarray(0, Math.min(body.byteLength, FILE_SCAN_SAMPLE_BYTES));
    const scanResult = await this.scanner.scan({
      storageKey: existing.storageKey,
      contentType: existing.contentType,
      sizeBytes: metadata.size,
      body: scanSample,
    });

    if (!scanResult.clean) {
      await this.storage.delete(existing.storageKey);
      await this.uploads.markFailed(context, uploadId);
      throw AppError.unprocessable(
        scanResult.reason ?? 'Uploaded file failed security verification',
      );
    }

    const [updated] = await this.uploads.markVerified(context, uploadId);
    if (!updated) {
      throw AppError.internal('Failed to mark upload verified');
    }

    return { upload: mapRow(updated) };
  }

  async getDownloadGrant(
    context: AuthorizationContext,
    uploadId: string,
  ): Promise<FileDownloadGrant> {
    const existing = await this.uploads.getForOrganization(context, uploadId);
    if (!existing) {
      throw AppError.notFound('File upload not found');
    }

    if (existing.status !== 'verified') {
      throw AppError.conflict('File is not available for download');
    }

    const downloadUrl = await this.storage.signedReadUrl({
      key: existing.storageKey,
      expiresInSeconds: FILE_UPLOAD_SIGNED_URL_TTL_SECONDS,
      downloadFilename: existing.originalFilename,
    });

    return {
      uploadId: existing.id,
      downloadUrl,
      expiresInSeconds: FILE_UPLOAD_SIGNED_URL_TTL_SECONDS,
      originalFilename: existing.originalFilename,
      contentType: existing.contentType,
    };
  }

  private assertValidUploadInput(input: InitiateFileUploadInput): void {
    if (input.originalFilename.trim() === '') {
      throw AppError.badRequest('originalFilename is required');
    }
    if (input.domain.trim() === '') {
      throw AppError.badRequest('domain is required');
    }
    if (!Number.isInteger(input.sizeBytes) || input.sizeBytes < 1) {
      throw AppError.badRequest('sizeBytes must be a positive integer');
    }
    if (input.sizeBytes > MAX_FILE_UPLOAD_BYTES) {
      throw AppError.badRequest('File exceeds maximum upload size');
    }
    if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
      throw AppError.badRequest('Content type is not permitted');
    }
  }
}

export function createFileUploadService(deps: {
  uploads: FileUploadRepository;
  storage: StorageProvider;
  scanner?: FileScanProvider;
}) {
  return new FileUploadService(
    deps.uploads,
    deps.storage,
    deps.scanner ?? createFileScanProviderFromEnv(),
  );
}
