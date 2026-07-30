import { leadTagLinks, leadTags } from '@workspace/db/schema';
import type { LeadTag } from '@workspace/domain/crm';
import { asEntityId, asOrganizationId } from '@workspace/domain/shared';
import {
  requirePermission,
  resolveTenantScope,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { and, eq } from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';

type LeadTagRow = typeof leadTags.$inferSelect;

export interface CreateLeadTagInput {
  readonly name: string;
  readonly color?: string | null;
}

function toLeadTag(row: LeadTagRow): LeadTag {
  return {
    id: asEntityId(row.id),
    organizationId: asOrganizationId(row.organizationId),
    name: row.name,
    color: row.color ?? null,
  };
}

export class LeadTagRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(
    context: AuthorizationContext,
    input: CreateLeadTagInput,
  ): Promise<LeadTag> {
    requirePermission(context, PERMISSIONS.LEAD_MANAGE);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead tag create requires a tenant context');
    }

    const now = new Date();
    const [row] = await this.db
      .insert(leadTags)
      .values({
        id: crypto.randomUUID(),
        organizationId,
        name: input.name.trim(),
        color: input.color ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      })
      .returning();

    if (row === undefined) {
      throw AppError.internal('Lead tag insert did not return a row');
    }

    return toLeadTag(row);
  }

  async list(context: AuthorizationContext): Promise<readonly LeadTag[]> {
    requirePermission(context, PERMISSIONS.LEAD_READ);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead tag list requires a tenant context');
    }

    const rows = await this.db
      .select()
      .from(leadTags)
      .where(eq(leadTags.organizationId, organizationId));

    return rows.map(toLeadTag);
  }

  async link(
    context: AuthorizationContext,
    leadId: string,
    tagId: string,
  ): Promise<void> {
    requirePermission(context, PERMISSIONS.LEAD_MANAGE);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead tag link requires a tenant context');
    }

    const tag = await this.db
      .select({ id: leadTags.id })
      .from(leadTags)
      .where(
        and(eq(leadTags.id, tagId), eq(leadTags.organizationId, organizationId)),
      )
      .limit(1);

    if (tag[0] === undefined) {
      throw AppError.notFound('Lead tag not found');
    }

    const now = new Date();
    await this.db
      .insert(leadTagLinks)
      .values({
        id: crypto.randomUUID(),
        leadId,
        tagId,
        organizationId,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }

  async unlink(
    context: AuthorizationContext,
    leadId: string,
    tagId: string,
  ): Promise<boolean> {
    requirePermission(context, PERMISSIONS.LEAD_MANAGE);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead tag unlink requires a tenant context');
    }

    const deleted = await this.db
      .delete(leadTagLinks)
      .where(
        and(
          eq(leadTagLinks.leadId, leadId),
          eq(leadTagLinks.tagId, tagId),
          eq(leadTagLinks.organizationId, organizationId),
        ),
      )
      .returning({ id: leadTagLinks.id });

    return deleted.length > 0;
  }

  async listForLead(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly LeadTag[]> {
    requirePermission(context, PERMISSIONS.LEAD_READ);

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      throw AppError.forbidden('Lead tag list requires a tenant context');
    }

    const rows = await this.db
      .select({
        id: leadTags.id,
        organizationId: leadTags.organizationId,
        name: leadTags.name,
        color: leadTags.color,
      })
      .from(leadTagLinks)
      .innerJoin(leadTags, eq(leadTagLinks.tagId, leadTags.id))
      .where(
        and(
          eq(leadTagLinks.leadId, leadId),
          eq(leadTagLinks.organizationId, organizationId),
        ),
      );

    return rows.map((row) => toLeadTag(row as LeadTagRow));
  }
}
