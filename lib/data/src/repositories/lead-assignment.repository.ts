import { leadAssignments } from '@workspace/db/schema';
import type { LeadAssignment } from '@workspace/domain/crm';
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

type LeadAssignmentRow = typeof leadAssignments.$inferSelect;

export interface CreateLeadAssignmentInput {
  readonly leadId: string;
  readonly assignedToUserId: string;
  readonly assignedByUserId?: string | null;
  readonly reason?: string | null;
}

function toLeadAssignment(row: LeadAssignmentRow): LeadAssignment {
  return {
    id: asEntityId(row.id),
    leadId: asEntityId(row.leadId),
    organizationId: asOrganizationId(row.organizationId),
    assignedToUserId: asUserId(row.assignedToUserId),
    assignedByUserId:
      row.assignedByUserId !== null ? asUserId(row.assignedByUserId) : null,
    reason: row.reason ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class LeadAssignmentRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(
    context: AuthorizationContext,
    input: CreateLeadAssignmentInput,
  ): Promise<LeadAssignment> {
    requirePermission(context, PERMISSIONS.LEAD_MANAGE);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden(
        'Lead assignment create requires a tenant context',
      );
    }

    const now = new Date();

    await this.db
      .update(leadAssignments)
      .set({ isActive: false, updatedAt: now })
      .where(
        and(
          eq(leadAssignments.leadId, input.leadId),
          eq(leadAssignments.organizationId, organizationId),
          eq(leadAssignments.isActive, true),
        ),
      );

    const [row] = await this.db
      .insert(leadAssignments)
      .values({
        id: crypto.randomUUID(),
        leadId: input.leadId,
        organizationId,
        assignedToUserId: input.assignedToUserId,
        assignedByUserId: input.assignedByUserId ?? null,
        reason: input.reason ?? null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (row === undefined) {
      throw AppError.internal('Lead assignment insert did not return a row');
    }

    return toLeadAssignment(row);
  }

  async listHistory(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly LeadAssignment[]> {
    requirePermission(context, PERMISSIONS.LEAD_READ);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden(
        'Lead assignment history requires a tenant context',
      );
    }

    const rows = await this.db
      .select()
      .from(leadAssignments)
      .where(
        and(
          eq(leadAssignments.leadId, leadId),
          eq(leadAssignments.organizationId, organizationId),
        ),
      )
      .orderBy(desc(leadAssignments.createdAt));

    return rows.map(toLeadAssignment);
  }
}
