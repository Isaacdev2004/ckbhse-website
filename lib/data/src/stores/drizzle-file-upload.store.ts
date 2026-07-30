import { fileUploads } from '@workspace/db/schema';
import type { Database } from '@workspace/db';
import { and, eq } from 'drizzle-orm';

export interface CreateFileUploadRowInput {
  readonly id: string;
  readonly organizationId: string;
  readonly storageKey: string;
  readonly originalFilename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly domain: string;
  readonly entityType?: string | null;
  readonly entityId?: string | null;
  readonly createdBy?: string | null;
}

export class DrizzleFileUploadStore {
  constructor(private readonly db: Database) {}

  createPending(input: CreateFileUploadRowInput) {
    return this.db
      .insert(fileUploads)
      .values({
        id: input.id,
        organizationId: input.organizationId,
        storageKey: input.storageKey,
        originalFilename: input.originalFilename,
        contentType: input.contentType,
        sizeBytes: String(input.sizeBytes),
        status: 'pending',
        domain: input.domain,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        createdBy: input.createdBy ?? null,
        updatedBy: input.createdBy ?? null,
      })
      .returning();
  }

  getById(uploadId: string) {
    return this.db.query.fileUploads.findFirst({
      where: eq(fileUploads.id, uploadId),
    });
  }

  getByIdForOrganization(uploadId: string, organizationId: string) {
    return this.db.query.fileUploads.findFirst({
      where: and(
        eq(fileUploads.id, uploadId),
        eq(fileUploads.organizationId, organizationId),
      ),
    });
  }

  markUploaded(uploadId: string, userId?: string | null) {
    return this.db
      .update(fileUploads)
      .set({
        status: 'uploaded',
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(fileUploads.id, uploadId))
      .returning();
  }

  markVerified(uploadId: string, userId?: string | null) {
    return this.db
      .update(fileUploads)
      .set({
        status: 'verified',
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(fileUploads.id, uploadId))
      .returning();
  }

  markFailed(uploadId: string, userId?: string | null) {
    return this.db
      .update(fileUploads)
      .set({
        status: 'failed',
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(fileUploads.id, uploadId))
      .returning();
  }
}
