import { leadActivities } from '@workspace/db/schema';
import type { LeadActivity, LeadActivityType } from '@workspace/domain/crm';
import { asEntityId, asOrganizationId, asUserId } from '@workspace/domain/shared';
import {
  requirePermission,
  resolveTenantScope,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { and, desc, eq } from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';

type LeadActivityRow = typeof leadActivities.$inferSelect;

export interface InsertLeadActivityInput {
  readonly leadId: string;
  readonly organizationId: string;
  readonly activityType: LeadActivityType;
  readonly title: string;
  readonly description?: string | null;
  readonly actorUserId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
}

function toLeadActivity(row: LeadActivityRow): LeadActivity {
  return {
    id: asEntityId(row.id),
    leadId: asEntityId(row.leadId),
    organizationId: asOrganizationId(row.organizationId),
    activityType: row.activityType,
    title: row.title,
    description: row.description ?? null,
    actorUserId:
      row.actorUserId !== null ? asUserId(row.actorUserId) : null,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class LeadActivityRepository {
  constructor(private readonly db: DbExecutor) {}

  async insert(
    context: AuthorizationContext,
    input: Omit<InsertLeadActivityInput, 'organizationId'>,
  ): Promise<LeadActivity> {
    requirePermission(context, PERMISSIONS.LEAD_MANAGE);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead activity insert requires a tenant context');
    }

    return this.insertForOrganization({
      ...input,
      organizationId,
    });
  }

  async insertForOrganization(
    input: InsertLeadActivityInput,
  ): Promise<LeadActivity> {
    const now = new Date();
    const [row] = await this.db
      .insert(leadActivities)
      .values({
        id: crypto.randomUUID(),
        leadId: input.leadId,
        organizationId: input.organizationId,
        activityType: input.activityType,
        title: input.title,
        description: input.description ?? null,
        actorUserId: input.actorUserId ?? null,
        metadata: input.metadata ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (row === undefined) {
      throw AppError.internal('Lead activity insert did not return a row');
    }

    return toLeadActivity(row);
  }

  async listByLeadId(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly LeadActivity[]> {
    requirePermission(context, PERMISSIONS.LEAD_READ);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead activity list requires a tenant context');
    }

    const rows = await this.db
      .select()
      .from(leadActivities)
      .where(
        and(
          eq(leadActivities.leadId, leadId),
          eq(leadActivities.organizationId, organizationId),
        ),
      )
      .orderBy(desc(leadActivities.createdAt));

    return rows.map(toLeadActivity);
  }
}
