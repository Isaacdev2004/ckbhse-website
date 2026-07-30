import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { FileUploadRepository } from './file-upload.repository.js';

const ORG_A = '00000000-0000-4000-8000-000000000002';
const ORG_B = '00000000-0000-4000-8000-000000000003';

function contextFor(orgId: string) {
  return {
    organizationId: orgId,
    userId: 'user-1',
    permissions: new Set([
      PERMISSIONS.DOCUMENT_READ,
      PERMISSIONS.DOCUMENT_MANAGE,
    ]),
    roles: new Set<string>(),
    actorKind: 'user' as const,
    metadata: { requestId: 'req-1' },
  } as const;
}

describe('file upload tenant isolation', () => {
  it('scopes reads to caller organization', async () => {
    const store = {
      getByIdForOrganization: vi.fn(async (uploadId: string, organizationId: string) => ({
        id: uploadId,
        organizationId,
      })),
    };
    const repository = new FileUploadRepository(store as never);

    await repository.getForOrganization(contextFor(ORG_A) as never, 'upload-1');
    await repository.getForOrganization(contextFor(ORG_B) as never, 'upload-2');

    expect(store.getByIdForOrganization).toHaveBeenNthCalledWith(1, 'upload-1', ORG_A);
    expect(store.getByIdForOrganization).toHaveBeenNthCalledWith(2, 'upload-2', ORG_B);
  });

  it('requires organization context for pending upload creation', () => {
    const store = { createPending: vi.fn(async () => []) };
    const repository = new FileUploadRepository(store as never);

    expect(() =>
      repository.createPending(
        {
          userId: 'user-1',
          permissions: new Set([PERMISSIONS.DOCUMENT_MANAGE]),
          roles: new Set<string>(),
          actorKind: 'user' as const,
          metadata: { requestId: 'req-1' },
        } as never,
        {
          id: 'upload-1',
          storageKey: 'org/a/documents/upload-1/file.pdf',
          originalFilename: 'file.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
          domain: 'documents',
        },
      ),
    ).toThrow(/organisation-scoped session/i);
  });
});
