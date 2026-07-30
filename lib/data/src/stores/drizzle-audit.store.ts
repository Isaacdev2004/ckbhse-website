import type { Database } from '@workspace/db';
import {
  auditAssignments,
  auditChecklistResponses,
  auditEvidence,
  auditFindings,
  auditReports,
  auditRevisions,
  auditTemplateItems,
  auditTemplates,
  auditTemplateSections,
  auditTypes,
  complianceAudits,
} from '@workspace/db/schema';
import { and, asc, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';

export class DrizzleAuditStore {
  constructor(private readonly db: Database) {}

  async listAuditTypes(organizationId?: string) {
    return this.db
      .select()
      .from(auditTypes)
      .where(
        and(
          eq(auditTypes.isActive, true),
          organizationId
            ? or(
                isNull(auditTypes.organizationId),
                eq(auditTypes.organizationId, organizationId),
              )!
            : isNull(auditTypes.organizationId),
        ),
      )
      .orderBy(asc(auditTypes.name));
  }

  async listAudits(organizationId: string, status?: string) {
    const conditions = [
      eq(complianceAudits.organizationId, organizationId),
      isNull(complianceAudits.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(complianceAudits.status, status as never));
    }
    return this.db
      .select()
      .from(complianceAudits)
      .where(and(...conditions))
      .orderBy(desc(complianceAudits.plannedStart));
  }

  async getAudit(organizationId: string, auditId: string) {
    const [row] = await this.db
      .select()
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.id, auditId),
          eq(complianceAudits.organizationId, organizationId),
          isNull(complianceAudits.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createAudit(input: typeof complianceAudits.$inferInsert) {
    const [row] = await this.db.insert(complianceAudits).values(input).returning();
    return row!;
  }

  async updateAudit(
    organizationId: string,
    auditId: string,
    patch: Partial<typeof complianceAudits.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(complianceAudits)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(complianceAudits.id, auditId),
          eq(complianceAudits.organizationId, organizationId),
          eq(complianceAudits.isImmutable, false),
        ),
      )
      .returning();
    return row ?? null;
  }

  async listFindings(auditId: string) {
    return this.db
      .select()
      .from(auditFindings)
      .where(
        and(eq(auditFindings.auditId, auditId), isNull(auditFindings.deletedAt)),
      )
      .orderBy(desc(auditFindings.createdAt));
  }

  async createFinding(input: typeof auditFindings.$inferInsert) {
    const [row] = await this.db.insert(auditFindings).values(input).returning();
    return row!;
  }

  async listAssignments(auditId: string) {
    return this.db
      .select()
      .from(auditAssignments)
      .where(eq(auditAssignments.auditId, auditId));
  }

  async createAssignment(input: typeof auditAssignments.$inferInsert) {
    const [row] = await this.db.insert(auditAssignments).values(input).returning();
    return row!;
  }

  async listTemplates(organizationId: string) {
    return this.db
      .select()
      .from(auditTemplates)
      .where(
        and(
          eq(auditTemplates.organizationId, organizationId),
          isNull(auditTemplates.deletedAt),
          eq(auditTemplates.isActive, true),
        ),
      )
      .orderBy(desc(auditTemplates.updatedAt));
  }

  async getTemplate(organizationId: string, templateId: string) {
    const [row] = await this.db
      .select()
      .from(auditTemplates)
      .where(
        and(
          eq(auditTemplates.id, templateId),
          eq(auditTemplates.organizationId, organizationId),
          isNull(auditTemplates.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listTemplateSections(templateId: string) {
    return this.db
      .select()
      .from(auditTemplateSections)
      .where(eq(auditTemplateSections.templateId, templateId))
      .orderBy(asc(auditTemplateSections.sortOrder));
  }

  async listTemplateItems(templateId: string) {
    return this.db
      .select()
      .from(auditTemplateItems)
      .where(eq(auditTemplateItems.templateId, templateId))
      .orderBy(asc(auditTemplateItems.sortOrder));
  }

  async listChecklistResponses(auditId: string) {
    return this.db
      .select()
      .from(auditChecklistResponses)
      .where(eq(auditChecklistResponses.auditId, auditId));
  }

  async upsertChecklistResponse(input: typeof auditChecklistResponses.$inferInsert) {
    const [row] = await this.db
      .insert(auditChecklistResponses)
      .values(input)
      .returning();
    return row!;
  }

  async listEvidence(auditId: string) {
    return this.db
      .select()
      .from(auditEvidence)
      .where(eq(auditEvidence.auditId, auditId))
      .orderBy(desc(auditEvidence.capturedAt));
  }

  async createEvidence(input: typeof auditEvidence.$inferInsert) {
    const [row] = await this.db.insert(auditEvidence).values(input).returning();
    return row!;
  }

  async listReports(auditId: string) {
    return this.db
      .select()
      .from(auditReports)
      .where(eq(auditReports.auditId, auditId))
      .orderBy(desc(auditReports.generatedAt));
  }

  async createReport(input: typeof auditReports.$inferInsert) {
    const [row] = await this.db.insert(auditReports).values(input).returning();
    return row!;
  }

  async createRevision(input: typeof auditRevisions.$inferInsert) {
    const [row] = await this.db.insert(auditRevisions).values(input).returning();
    return row!;
  }

  async listRevisions(auditId: string) {
    return this.db
      .select()
      .from(auditRevisions)
      .where(eq(auditRevisions.auditId, auditId))
      .orderBy(desc(auditRevisions.revisionNumber));
  }

  async dashboardCounts(organizationId: string) {
    const statuses = ['scheduled', 'in_progress', 'closed', 'cancelled'] as const;
    const counts: Record<string, number> = {};
    for (const status of statuses) {
      const [row] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(complianceAudits)
        .where(
          and(
            eq(complianceAudits.organizationId, organizationId),
            eq(complianceAudits.status, status),
            isNull(complianceAudits.deletedAt),
          ),
        );
      counts[status] = row?.count ?? 0;
    }
    const [total] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.organizationId, organizationId),
          isNull(complianceAudits.deletedAt),
        ),
      );
    const [openFindings] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditFindings)
      .where(
        and(
          eq(auditFindings.organizationId, organizationId),
          eq(auditFindings.status, 'open'),
          isNull(auditFindings.deletedAt),
        ),
      );
    const [avgScore] = await this.db
      .select({ avg: sql<number>`coalesce(avg(${complianceAudits.score}), 0)` })
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.organizationId, organizationId),
          sql`${complianceAudits.score} is not null`,
        ),
      );
    return {
      total: total?.count ?? 0,
      scheduled: counts.scheduled ?? 0,
      inProgress: counts.in_progress ?? 0,
      closed: counts.closed ?? 0,
      cancelled: counts.cancelled ?? 0,
      openFindings: openFindings?.count ?? 0,
      averageScore: Math.round(avgScore?.avg ?? 0),
    };
  }

  async listUpcoming(organizationId: string, withinDays = 30) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + withinDays);
    return this.db
      .select()
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.organizationId, organizationId),
          isNull(complianceAudits.deletedAt),
          gte(complianceAudits.plannedStart, new Date()),
          lte(complianceAudits.plannedStart, deadline),
        ),
      )
      .orderBy(asc(complianceAudits.plannedStart))
      .limit(10);
  }
}
