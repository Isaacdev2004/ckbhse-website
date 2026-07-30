import { leadStatusHistory } from '@workspace/db/schema';
import type { LeadStatus, LeadStatusHistoryEntry } from '@workspace/domain/crm';
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

type LeadStatusHistoryRow = typeof leadStatusHistory.$inferSelect;

export interface RecordLeadStatusChangeInput {
  readonly leadId: string;
  readonly organizationId: string;
  readonly fromStatus: LeadStatus | null;
  readonly toStatus: LeadStatus;
  readonly changedByUserId?: string | null;
  readonly reason?: string | null;
}

function toLeadStatusHistoryEntry(
  row: LeadStatusHistoryRow,
): LeadStatusHistoryEntry {
  return {
    id: asEntityId(row.id),
    leadId: asEntityId(row.leadId),
    organizationId: asOrganizationId(row.organizationId),
    fromStatus: row.fromStatus ?? null,
    toStatus: row.toStatus,
    changedByUserId:
      row.changedByUserId !== null ? asUserId(row.changedByUserId) : null,
    reason: row.reason ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class LeadStatusHistoryRepository {
  constructor(private readonly db: DbExecutor) {}

  async record(
    context: AuthorizationContext,
    input: Omit<RecordLeadStatusChangeInput, 'organizationId'>,
  ): Promise<LeadStatusHistoryEntry> {
    requirePermission(context, PERMISSIONS.LEAD_MANAGE);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden(
        'Lead status history record requires a tenant context',
      );
    }

    return this.recordForOrganization({
      ...input,
      organizationId,
    });
  }

  async recordForOrganization(
    input: RecordLeadStatusChangeInput,
  ): Promise<LeadStatusHistoryEntry> {
    const now = new Date();
    const [row] = await this.db
      .insert(leadStatusHistory)
      .values({
        id: crypto.randomUUID(),
        leadId: input.leadId,
        organizationId: input.organizationId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        changedByUserId: input.changedByUserId ?? null,
        reason: input.reason ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (row === undefined) {
      throw AppError.internal(
        'Lead status history insert did not return a row',
      );
    }

    return toLeadStatusHistoryEntry(row);
  }

  async listByLeadId(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly LeadStatusHistoryEntry[]> {
    requirePermission(context, PERMISSIONS.LEAD_READ);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden(
        'Lead status history list requires a tenant context',
      );
    }

    const rows = await this.db
      .select()
      .from(leadStatusHistory)
      .where(
        and(
          eq(leadStatusHistory.leadId, leadId),
          eq(leadStatusHistory.organizationId, organizationId),
        ),
      )
      .orderBy(desc(leadStatusHistory.createdAt));

    return rows.map(toLeadStatusHistoryEntry);
  }
}
