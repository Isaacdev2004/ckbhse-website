import { AppError } from '@workspace/platform/errors';
import {
  can,
  requirePermission,
  resolveTenantScope,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleFileUploadStore } from '../stores/drizzle-file-upload.store.js';

function requireFileWritePermission(context: AuthorizationContext): void {
  if (
    can(context, PERMISSIONS.DOCUMENT_MANAGE) ||
    can(context, PERMISSIONS.EVIDENCE_UPLOAD)
  ) {
    return;
  }
  requirePermission(context, PERMISSIONS.DOCUMENT_MANAGE);
}

function requireFileReadPermission(context: AuthorizationContext): void {
  if (
    can(context, PERMISSIONS.DOCUMENT_READ) ||
    can(context, PERMISSIONS.DOCUMENT_MANAGE) ||
    can(context, PERMISSIONS.EVIDENCE_UPLOAD)
  ) {
    return;
  }
  requirePermission(context, PERMISSIONS.DOCUMENT_READ);
}

export class FileUploadRepository {
  constructor(private readonly store: DrizzleFileUploadStore) {}

  createPending(
    context: AuthorizationContext,
    input: {
      id: string;
      storageKey: string;
      originalFilename: string;
      contentType: string;
      sizeBytes: number;
      domain: string;
      entityType?: string | null;
      entityId?: string | null;
    },
  ) {
    requireFileWritePermission(context);
    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('File uploads require an organization context');
    }

    return this.store.createPending({
      ...input,
      organizationId,
      createdBy: context.userId ?? null,
    });
  }

  getForOrganization(context: AuthorizationContext, uploadId: string) {
    requireFileReadPermission(context);
    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('File access requires an organization context');
    }

    return this.store.getByIdForOrganization(uploadId, organizationId);
  }

  markUploaded(context: AuthorizationContext, uploadId: string) {
    requireFileWritePermission(context);
    return this.store.markUploaded(uploadId, context.userId ?? null);
  }

  markVerified(context: AuthorizationContext, uploadId: string) {
    requireFileWritePermission(context);
    return this.store.markVerified(uploadId, context.userId ?? null);
  }

  markFailed(context: AuthorizationContext, uploadId: string) {
    requireFileWritePermission(context);
    return this.store.markFailed(uploadId, context.userId ?? null);
  }
}
