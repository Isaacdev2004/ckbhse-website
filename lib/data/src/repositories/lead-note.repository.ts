import { leadNotes } from '@workspace/db/schema';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import {
  auditHooks,
  BaseRepository,
  type BaseRepositoryOptions,
  type Entity,
  type RepositoryDefinition,
  type SoftDeletableEntity,
  type TenantScopedEntity,
} from '@workspace/platform/repository';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import { and, eq, isNull } from 'drizzle-orm';
import { asEntityId } from '@workspace/domain/shared';
import type { DbExecutor } from '../transaction/transaction-manager.js';

type LeadNoteRow = typeof leadNotes.$inferSelect;

export interface LeadNoteEntity
  extends Entity,
    SoftDeletableEntity,
    TenantScopedEntity {
  readonly leadId: string;
  readonly body: string;
  readonly isInternal: boolean;
  readonly authorUserId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export const LEAD_NOTE_DEFINITION = {
  name: 'LeadNote',
  tenantScoped: true,
  softDeletable: true,
} as const;

export interface CreateLeadNoteInput {
  readonly leadId: string;
  readonly body: string;
  readonly isInternal?: boolean;
  readonly authorUserId: string;
}

function toLeadNoteEntity(row: LeadNoteRow): LeadNoteEntity {
  return {
    id: asEntityId(row.id),
    organizationId: row.organizationId,
    leadId: row.leadId,
    body: row.body,
    isInternal: row.isInternal,
    authorUserId: row.authorUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
    version: row.version,
    createdBy: row.createdBy ?? null,
    updatedBy: row.updatedBy ?? null,
  };
}

function toLeadNoteRow(entity: LeadNoteEntity): LeadNoteRow {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    leadId: entity.leadId,
    body: entity.body,
    isInternal: entity.isInternal,
    authorUserId: entity.authorUserId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    version: entity.version,
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
  };
}

class DrizzleLeadNoteStore {
  constructor(private readonly db: DbExecutor) {}

  async get(id: string): Promise<LeadNoteEntity | null> {
    const rows = await this.db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.id, id))
      .limit(1);

    const row = rows[0];
    return row === undefined ? null : toLeadNoteEntity(row);
  }

  async query(scope: {
    organizationId: string | null;
    includeDeleted: boolean;
  }): Promise<readonly LeadNoteEntity[]> {
    const conditions = [];

    if (scope.organizationId !== null) {
      conditions.push(eq(leadNotes.organizationId, scope.organizationId));
    }

    if (!scope.includeDeleted) {
      conditions.push(isNull(leadNotes.deletedAt));
    }

    const where =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const rows = await this.db.select().from(leadNotes).where(where);
    return rows.map(toLeadNoteEntity);
  }

  async insert(entity: LeadNoteEntity): Promise<LeadNoteEntity> {
    const existing = await this.get(entity.id);
    if (existing !== null) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }

    const [row] = await this.db
      .insert(leadNotes)
      .values(toLeadNoteRow(entity))
      .returning();

    if (row === undefined) {
      throw AppError.internal('LeadNote insert did not return a row');
    }

    return toLeadNoteEntity(row);
  }

  async replace(entity: LeadNoteEntity): Promise<LeadNoteEntity> {
    const existing = await this.get(entity.id);
    if (existing === null) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    const [row] = await this.db
      .update(leadNotes)
      .set(toLeadNoteRow(entity))
      .where(eq(leadNotes.id, entity.id))
      .returning();

    if (row === undefined) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    return toLeadNoteEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(leadNotes).where(eq(leadNotes.id, id));
  }
}

const definition: RepositoryDefinition<LeadNoteEntity> = LEAD_NOTE_DEFINITION;

export interface LeadNoteRepositoryOptions
  extends Omit<
    BaseRepositoryOptions<LeadNoteEntity>,
    'definition' | 'permissions' | 'store'
  > {
  readonly db: DbExecutor;
}

export class LeadNoteRepository extends BaseRepository<LeadNoteEntity> {
  constructor(options: LeadNoteRepositoryOptions) {
    super({
      definition,
      store: new DrizzleLeadNoteStore(options.db),
      permissions: {
        read: PERMISSIONS.LEAD_READ,
        write: PERMISSIONS.LEAD_MANAGE,
      },
      ...options,
    });
  }

  create(
    context: AuthorizationContext,
    input: CreateLeadNoteInput,
  ): Promise<LeadNoteEntity> {
    const now = new Date();

    return this.insert(context, {
      id: asEntityId(crypto.randomUUID()),
      organizationId: '',
      leadId: input.leadId,
      body: input.body.trim(),
      isInternal: input.isInternal ?? true,
      authorUserId: input.authorUserId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
      createdBy: input.authorUserId,
      updatedBy: input.authorUserId,
    });
  }

  async listByLeadId(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly LeadNoteEntity[]> {
    const page = await this.list(context, {
      page: { kind: 'offset', offset: 0, limit: 100 },
    });

    return page.items.filter((note) => note.leadId === leadId);
  }
}

export { auditHooks as leadNoteAuditHooks };
