import { describe, expect, it, vi } from 'vitest';
import { NoOpFileScanProvider } from '@workspace/platform/files/scan';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { FileUploadService } from './file-upload.service.js';

const context = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: '00000000-0000-4000-8000-000000000011',
  permissions: new Set([
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.DOCUMENT_READ,
  ]),
  roles: new Set<string>(),
  actorKind: 'user' as const,
  metadata: { requestId: 'req-1' },
};

const pdfBody = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

describe('FileUploadService', () => {
  it('creates a pending upload and returns a signed write URL', async () => {
    const uploads = {
      createPending: vi.fn(async () => [
        {
          id: 'upload-1',
          organizationId: context.organizationId,
          storageKey: 'org/org-1/documents/upload-1/file.pdf',
          originalFilename: 'report.pdf',
          contentType: 'application/pdf',
          sizeBytes: '1024',
          status: 'pending',
          domain: 'documents',
          entityType: null,
          entityId: null,
          createdAt: new Date('2026-07-30T10:00:00.000Z'),
        },
      ]),
    };
    const storage = {
      name: 'local-filesystem',
      signedWriteUrl: vi.fn(async () => 'https://storage.example/upload'),
    };

    const service = new FileUploadService(
      uploads as never,
      storage as never,
      new NoOpFileScanProvider(),
    );
    const result = await service.initiateUpload(context as never, {
      originalFilename: 'report.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
      domain: 'documents',
    });

    expect(result.upload.status).toBe('pending');
    expect(result.uploadUrl).toContain('https://storage.example/upload');
    expect(storage.signedWriteUrl).toHaveBeenCalledOnce();
  });

  it('marks upload verified when storage object passes scanning', async () => {
    const uploads = {
      getForOrganization: vi.fn(async () => ({
        id: 'upload-1',
        organizationId: context.organizationId,
        storageKey: 'org/org-1/documents/upload-1/file.pdf',
        originalFilename: 'report.pdf',
        contentType: 'application/pdf',
        sizeBytes: '1024',
        status: 'pending',
        domain: 'documents',
        entityType: null,
        entityId: null,
        createdAt: new Date('2026-07-30T10:00:00.000Z'),
      })),
      markVerified: vi.fn(async () => [
        {
          id: 'upload-1',
          organizationId: context.organizationId,
          storageKey: 'org/org-1/documents/upload-1/file.pdf',
          originalFilename: 'report.pdf',
          contentType: 'application/pdf',
          sizeBytes: '1024',
          status: 'verified',
          domain: 'documents',
          entityType: null,
          entityId: null,
          createdAt: new Date('2026-07-30T10:00:00.000Z'),
        },
      ]),
      markFailed: vi.fn(),
    };
    const storage = {
      name: 'local-filesystem',
      head: vi.fn(async () => ({
        key: 'org/org-1/documents/upload-1/file.pdf',
        size: 1024,
        contentType: 'application/pdf',
        lastModified: new Date(),
      })),
      get: vi.fn(async () => pdfBody),
      delete: vi.fn(async () => undefined),
    };

    const service = new FileUploadService(
      uploads as never,
      storage as never,
      new NoOpFileScanProvider(),
    );
    const result = await service.completeUpload(context as never, 'upload-1');

    expect(result.upload.status).toBe('verified');
    expect(uploads.markVerified).toHaveBeenCalledOnce();
    expect(uploads.markFailed).not.toHaveBeenCalled();
  });

  it('rejects upload when scanning fails and deletes the stored object', async () => {
    const uploads = {
      getForOrganization: vi.fn(async () => ({
        id: 'upload-1',
        organizationId: context.organizationId,
        storageKey: 'org/org-1/documents/upload-1/file.pdf',
        originalFilename: 'report.pdf',
        contentType: 'application/pdf',
        sizeBytes: '1024',
        status: 'pending',
        domain: 'documents',
        entityType: null,
        entityId: null,
        createdAt: new Date('2026-07-30T10:00:00.000Z'),
      })),
      markVerified: vi.fn(),
      markFailed: vi.fn(async () => []),
    };
    const storage = {
      name: 'local-filesystem',
      head: vi.fn(async () => ({
        key: 'org/org-1/documents/upload-1/file.pdf',
        size: 1024,
        contentType: 'application/pdf',
        lastModified: new Date(),
      })),
      get: vi.fn(async () => new TextEncoder().encode('<html></html>')),
      delete: vi.fn(async () => undefined),
    };
    const scanner = {
      name: 'test-scanner',
      scan: vi.fn(async () => ({
        clean: false,
        reason: 'blocked file signature',
        scanner: 'test-scanner',
      })),
    };

    const service = new FileUploadService(uploads as never, storage as never, scanner);
    await expect(service.completeUpload(context as never, 'upload-1')).rejects.toMatchObject({
      code: 'unprocessable_entity',
    });

    expect(storage.delete).toHaveBeenCalledOnce();
    expect(uploads.markFailed).toHaveBeenCalledOnce();
    expect(uploads.markVerified).not.toHaveBeenCalled();
  });

  it('allows download only for verified uploads', async () => {
    const uploads = {
      getForOrganization: vi.fn(async () => ({
        id: 'upload-1',
        organizationId: context.organizationId,
        storageKey: 'org/org-1/documents/upload-1/file.pdf',
        originalFilename: 'report.pdf',
        contentType: 'application/pdf',
        sizeBytes: '1024',
        status: 'uploaded',
        domain: 'documents',
        entityType: null,
        entityId: null,
        createdAt: new Date('2026-07-30T10:00:00.000Z'),
      })),
    };
    const storage = { name: 'local-filesystem' };
    const service = new FileUploadService(
      uploads as never,
      storage as never,
      new NoOpFileScanProvider(),
    );

    await expect(service.getDownloadGrant(context as never, 'upload-1')).rejects.toMatchObject({
      code: 'conflict',
    });
  });
});
