import { leadReminders } from '@workspace/db/schema';
import type { LeadPriority } from '@workspace/domain/crm';
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

type LeadReminderRow = typeof leadReminders.$inferSelect;

export interface LeadReminderEntity
  extends Entity,
    SoftDeletableEntity,
    TenantScopedEntity {
  readonly leadId: string;
  readonly title: string;
  readonly dueAt: Date;
  readonly priority: LeadPriority;
  readonly completedAt: Date | null;
  readonly assignedToUserId: string | null;
  readonly isRecurring: boolean;
  readonly recurrenceRule: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export const LEAD_REMINDER_DEFINITION = {
  name: 'LeadReminder',
  tenantScoped: true,
  softDeletable: true,
} as const;

export interface CreateLeadReminderInput {
  readonly leadId: string;
  readonly title: string;
  readonly dueAt: Date;
  readonly priority?: LeadPriority;
  readonly assignedToUserId?: string | null;
  readonly isRecurring?: boolean;
  readonly recurrenceRule?: string | null;
}

export interface UpdateLeadReminderInput {
  readonly title?: string;
  readonly dueAt?: Date;
  readonly priority?: LeadPriority;
  readonly completedAt?: Date | null;
  readonly assignedToUserId?: string | null;
  readonly isRecurring?: boolean;
  readonly recurrenceRule?: string | null;
}

function toLeadReminderEntity(row: LeadReminderRow): LeadReminderEntity {
  return {
    id: asEntityId(row.id),
    organizationId: row.organizationId,
    leadId: row.leadId,
    title: row.title,
    dueAt: row.dueAt,
    priority: row.priority,
    completedAt: row.completedAt ?? null,
    assignedToUserId: row.assignedToUserId ?? null,
    isRecurring: row.isRecurring,
    recurrenceRule: row.recurrenceRule ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
    version: row.version,
    createdBy: row.createdBy ?? null,
    updatedBy: row.updatedBy ?? null,
  };
}

function toLeadReminderRow(entity: LeadReminderEntity): LeadReminderRow {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    leadId: entity.leadId,
    title: entity.title,
    dueAt: entity.dueAt,
    priority: entity.priority,
    completedAt: entity.completedAt,
    assignedToUserId: entity.assignedToUserId,
    isRecurring: entity.isRecurring,
    recurrenceRule: entity.recurrenceRule,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    version: entity.version,
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
  };
}

class DrizzleLeadReminderStore {
  constructor(private readonly db: DbExecutor) {}

  async get(id: string): Promise<LeadReminderEntity | null> {
    const rows = await this.db
      .select()
      .from(leadReminders)
      .where(eq(leadReminders.id, id))
      .limit(1);

    const row = rows[0];
    return row === undefined ? null : toLeadReminderEntity(row);
  }

  async query(scope: {
    organizationId: string | null;
    includeDeleted: boolean;
  }): Promise<readonly LeadReminderEntity[]> {
    const conditions = [];

    if (scope.organizationId !== null) {
      conditions.push(eq(leadReminders.organizationId, scope.organizationId));
    }

    if (!scope.includeDeleted) {
      conditions.push(isNull(leadReminders.deletedAt));
    }

    const where =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const rows = await this.db.select().from(leadReminders).where(where);
    return rows.map(toLeadReminderEntity);
  }

  async insert(entity: LeadReminderEntity): Promise<LeadReminderEntity> {
    const existing = await this.get(entity.id);
    if (existing !== null) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }

    const [row] = await this.db
      .insert(leadReminders)
      .values(toLeadReminderRow(entity))
      .returning();

    if (row === undefined) {
      throw AppError.internal('LeadReminder insert did not return a row');
    }

    return toLeadReminderEntity(row);
  }

  async replace(entity: LeadReminderEntity): Promise<LeadReminderEntity> {
    const existing = await this.get(entity.id);
    if (existing === null) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    const [row] = await this.db
      .update(leadReminders)
      .set(toLeadReminderRow(entity))
      .where(eq(leadReminders.id, entity.id))
      .returning();

    if (row === undefined) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    return toLeadReminderEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(leadReminders).where(eq(leadReminders.id, id));
  }
}

const definition: RepositoryDefinition<LeadReminderEntity> =
  LEAD_REMINDER_DEFINITION;

export interface LeadReminderRepositoryOptions
  extends Omit<
    BaseRepositoryOptions<LeadReminderEntity>,
    'definition' | 'permissions' | 'store'
  > {
  readonly db: DbExecutor;
}

export class LeadReminderRepository extends BaseRepository<LeadReminderEntity> {
  constructor(options: LeadReminderRepositoryOptions) {
    super({
      definition,
      store: new DrizzleLeadReminderStore(options.db),
      permissions: {
        read: PERMISSIONS.LEAD_READ,
        write: PERMISSIONS.LEAD_MANAGE,
      },
      ...options,
    });
  }

  create(
    context: AuthorizationContext,
    input: CreateLeadReminderInput,
  ): Promise<LeadReminderEntity> {
    const now = new Date();

    return this.insert(context, {
      id: asEntityId(crypto.randomUUID()),
      organizationId: '',
      leadId: input.leadId,
      title: input.title.trim(),
      dueAt: input.dueAt,
      priority: input.priority ?? 'normal',
      completedAt: null,
      assignedToUserId: input.assignedToUserId ?? null,
      isRecurring: input.isRecurring ?? false,
      recurrenceRule: input.recurrenceRule ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
      createdBy: null,
      updatedBy: null,
    });
  }

  update(
    context: AuthorizationContext,
    id: string,
    input: UpdateLeadReminderInput,
  ): Promise<LeadReminderEntity> {
    return this.mutate(context, id, (current) => ({
      ...current,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.completedAt !== undefined
        ? { completedAt: input.completedAt }
        : {}),
      ...(input.assignedToUserId !== undefined
        ? { assignedToUserId: input.assignedToUserId }
        : {}),
      ...(input.isRecurring !== undefined
        ? { isRecurring: input.isRecurring }
        : {}),
      ...(input.recurrenceRule !== undefined
        ? { recurrenceRule: input.recurrenceRule }
        : {}),
      updatedAt: new Date(),
      version: current.version + 1,
    }));
  }

  async listByLeadId(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly LeadReminderEntity[]> {
    const page = await this.list(context, {
      page: { kind: 'offset', offset: 0, limit: 100 },
    });

    return page.items.filter((reminder) => reminder.leadId === leadId);
  }
}

export { auditHooks as leadReminderAuditHooks };
