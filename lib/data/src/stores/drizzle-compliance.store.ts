import type { Database } from '@workspace/db';
import {
  complianceCalendarEvents,
  complianceControls,
  complianceScoreConfigs,
  inspectionChecklistResponses,
  inspectionEvidence,
  inspectionFindings,
  inspectionTypes,
  inspections,
  isoClauses,
  isoFrameworks,
  legalRegisterEntries,
  regulatoryRegisterEntries,
  complianceExportJobs,
  complianceKpiSnapshots,
  regulatoryAlerts,
} from '@workspace/db/schema';
import { and, asc, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';

export class DrizzleComplianceStore {
  constructor(private readonly db: Database) {}

  async listInspectionTypes(organizationId?: string) {
    return this.db
      .select()
      .from(inspectionTypes)
      .where(
        and(
          eq(inspectionTypes.isActive, true),
          organizationId
            ? or(
                isNull(inspectionTypes.organizationId),
                eq(inspectionTypes.organizationId, organizationId),
              )!
            : isNull(inspectionTypes.organizationId),
        ),
      )
      .orderBy(asc(inspectionTypes.name));
  }

  async listInspections(organizationId: string, status?: string) {
    const conditions = [
      eq(inspections.organizationId, organizationId),
      isNull(inspections.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(inspections.status, status as never));
    }
    return this.db
      .select()
      .from(inspections)
      .where(and(...conditions))
      .orderBy(desc(inspections.scheduledAt));
  }

  async getInspection(organizationId: string, inspectionId: string) {
    const [row] = await this.db
      .select()
      .from(inspections)
      .where(
        and(
          eq(inspections.id, inspectionId),
          eq(inspections.organizationId, organizationId),
          isNull(inspections.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createInspection(input: typeof inspections.$inferInsert) {
    const [row] = await this.db.insert(inspections).values(input).returning();
    return row!;
  }

  async updateInspection(
    organizationId: string,
    inspectionId: string,
    patch: Partial<typeof inspections.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(inspections)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(inspections.id, inspectionId),
          eq(inspections.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async inspectionDashboardCounts(organizationId: string) {
    const statuses = ['scheduled', 'completed', 'failed', 'passed', 'overdue'] as const;
    const counts: Record<string, number> = {};
    for (const status of statuses) {
      const [row] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(inspections)
        .where(
          and(
            eq(inspections.organizationId, organizationId),
            eq(inspections.status, status),
            isNull(inspections.deletedAt),
          ),
        );
      counts[status] = row?.count ?? 0;
    }
    const [total] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(inspections)
      .where(
        and(eq(inspections.organizationId, organizationId), isNull(inspections.deletedAt)),
      );
    const [openFindings] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(inspectionFindings)
      .where(
        and(
          eq(inspectionFindings.organizationId, organizationId),
          eq(inspectionFindings.status, 'open'),
          isNull(inspectionFindings.deletedAt),
        ),
      );
    const [avgScore] = await this.db
      .select({ avg: sql<number>`coalesce(avg(${inspections.score}), 0)` })
      .from(inspections)
      .where(
        and(
          eq(inspections.organizationId, organizationId),
          sql`${inspections.score} is not null`,
        ),
      );
    return {
      total: total?.count ?? 0,
      scheduled: counts.scheduled ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      passed: counts.passed ?? 0,
      overdue: counts.overdue ?? 0,
      openFindings: openFindings?.count ?? 0,
      averageScore: Math.round(avgScore?.avg ?? 0),
    };
  }

  async listInspectionFindings(inspectionId: string) {
    return this.db
      .select()
      .from(inspectionFindings)
      .where(
        and(
          eq(inspectionFindings.inspectionId, inspectionId),
          isNull(inspectionFindings.deletedAt),
        ),
      )
      .orderBy(desc(inspectionFindings.createdAt));
  }

  async createInspectionFinding(input: typeof inspectionFindings.$inferInsert) {
    const [row] = await this.db.insert(inspectionFindings).values(input).returning();
    return row!;
  }

  async listInspectionEvidence(inspectionId: string) {
    return this.db
      .select()
      .from(inspectionEvidence)
      .where(eq(inspectionEvidence.inspectionId, inspectionId))
      .orderBy(desc(inspectionEvidence.capturedAt));
  }

  async createInspectionEvidence(input: typeof inspectionEvidence.$inferInsert) {
    const [row] = await this.db.insert(inspectionEvidence).values(input).returning();
    return row!;
  }

  async listInspectionChecklist(inspectionId: string) {
    return this.db
      .select()
      .from(inspectionChecklistResponses)
      .where(eq(inspectionChecklistResponses.inspectionId, inspectionId));
  }

  async upsertInspectionChecklist(input: typeof inspectionChecklistResponses.$inferInsert) {
    const [row] = await this.db
      .insert(inspectionChecklistResponses)
      .values(input)
      .returning();
    return row!;
  }

  async listLegalRegister(organizationId: string) {
    return this.db
      .select()
      .from(legalRegisterEntries)
      .where(
        and(
          eq(legalRegisterEntries.organizationId, organizationId),
          isNull(legalRegisterEntries.deletedAt),
        ),
      )
      .orderBy(desc(legalRegisterEntries.updatedAt));
  }

  async createLegalEntry(input: typeof legalRegisterEntries.$inferInsert) {
    const [row] = await this.db.insert(legalRegisterEntries).values(input).returning();
    return row!;
  }

  async getLegalEntry(organizationId: string, id: string) {
    const [row] = await this.db
      .select()
      .from(legalRegisterEntries)
      .where(
        and(
          eq(legalRegisterEntries.id, id),
          eq(legalRegisterEntries.organizationId, organizationId),
          isNull(legalRegisterEntries.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listRegulatory(organizationId: string) {
    return this.db
      .select()
      .from(regulatoryRegisterEntries)
      .where(
        and(
          eq(regulatoryRegisterEntries.organizationId, organizationId),
          isNull(regulatoryRegisterEntries.deletedAt),
        ),
      )
      .orderBy(desc(regulatoryRegisterEntries.updatedAt));
  }

  async listControls(organizationId: string) {
    return this.db
      .select()
      .from(complianceControls)
      .where(
        and(
          eq(complianceControls.organizationId, organizationId),
          isNull(complianceControls.deletedAt),
        ),
      )
      .orderBy(desc(complianceControls.updatedAt));
  }

  async createControl(input: typeof complianceControls.$inferInsert) {
    const [row] = await this.db.insert(complianceControls).values(input).returning();
    return row!;
  }

  async listScoreConfigs(organizationId: string) {
    return this.db
      .select()
      .from(complianceScoreConfigs)
      .where(
        and(
          eq(complianceScoreConfigs.organizationId, organizationId),
          eq(complianceScoreConfigs.isActive, true),
        ),
      );
  }

  async listCalendarEvents(organizationId: string, from?: Date, to?: Date) {
    const conditions = [eq(complianceCalendarEvents.organizationId, organizationId)];
    if (from !== undefined) {
      conditions.push(gte(complianceCalendarEvents.startsAt, from));
    }
    if (to !== undefined) {
      conditions.push(lte(complianceCalendarEvents.startsAt, to));
    }
    return this.db
      .select()
      .from(complianceCalendarEvents)
      .where(and(...conditions))
      .orderBy(asc(complianceCalendarEvents.startsAt));
  }

  async createCalendarEvent(input: typeof complianceCalendarEvents.$inferInsert) {
    const [row] = await this.db.insert(complianceCalendarEvents).values(input).returning();
    return row!;
  }

  async listIsoFrameworks(organizationId?: string) {
    return this.db
      .select()
      .from(isoFrameworks)
      .where(
        and(
          eq(isoFrameworks.isActive, true),
          organizationId
            ? or(
                isNull(isoFrameworks.organizationId),
                eq(isoFrameworks.organizationId, organizationId),
              )!
            : isNull(isoFrameworks.organizationId),
        ),
      )
      .orderBy(asc(isoFrameworks.name));
  }

  async listIsoClauses(frameworkId: string) {
    return this.db
      .select()
      .from(isoClauses)
      .where(eq(isoClauses.frameworkId, frameworkId))
      .orderBy(asc(isoClauses.sortOrder));
  }

  async listUpcomingInspections(organizationId: string, withinDays = 30) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + withinDays);
    return this.db
      .select()
      .from(inspections)
      .where(
        and(
          eq(inspections.organizationId, organizationId),
          isNull(inspections.deletedAt),
          gte(inspections.scheduledAt, new Date()),
          lte(inspections.scheduledAt, deadline),
        ),
      )
      .orderBy(asc(inspections.scheduledAt))
      .limit(10);
  }

  async listTodaysInspections(organizationId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.db
      .select()
      .from(inspections)
      .where(
        and(
          eq(inspections.organizationId, organizationId),
          isNull(inspections.deletedAt),
          gte(inspections.scheduledAt, start),
          lte(inspections.scheduledAt, end),
        ),
      )
      .orderBy(asc(inspections.scheduledAt));
  }

  async listKpiSnapshots(organizationId: string, limit = 12) {
    return this.db
      .select()
      .from(complianceKpiSnapshots)
      .where(eq(complianceKpiSnapshots.organizationId, organizationId))
      .orderBy(desc(complianceKpiSnapshots.snapshotMonth))
      .limit(limit);
  }

  async upsertKpiSnapshot(input: typeof complianceKpiSnapshots.$inferInsert) {
    const [row] = await this.db
      .insert(complianceKpiSnapshots)
      .values(input)
      .onConflictDoUpdate({
        target: [complianceKpiSnapshots.organizationId, complianceKpiSnapshots.snapshotMonth],
        set: {
          complianceScore: input.complianceScore,
          auditCompletion: input.auditCompletion,
          inspectionCompletion: input.inspectionCompletion,
          capaCompletion: input.capaCompletion,
          trainingCompletion: input.trainingCompletion,
          controlEffectiveness: input.controlEffectiveness,
          openFindings: input.openFindings,
          metadata: input.metadata,
        },
      })
      .returning();
    return row!;
  }

  async listRegulatoryAlerts(organizationId: string, status?: string) {
    const conditions = [eq(regulatoryAlerts.organizationId, organizationId)];
    if (status !== undefined) {
      conditions.push(eq(regulatoryAlerts.status, status as never));
    }
    return this.db
      .select()
      .from(regulatoryAlerts)
      .where(and(...conditions))
      .orderBy(desc(regulatoryAlerts.createdAt));
  }

  async acknowledgeRegulatoryAlert(
    organizationId: string,
    alertId: string,
    acknowledgedBy: string | null,
  ) {
    const [row] = await this.db
      .update(regulatoryAlerts)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(regulatoryAlerts.id, alertId),
          eq(regulatoryAlerts.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async createRegulatoryAlert(input: typeof regulatoryAlerts.$inferInsert) {
    const [row] = await this.db.insert(regulatoryAlerts).values(input).returning();
    return row!;
  }

  async listExportJobs(organizationId: string) {
    return this.db
      .select()
      .from(complianceExportJobs)
      .where(eq(complianceExportJobs.organizationId, organizationId))
      .orderBy(desc(complianceExportJobs.createdAt))
      .limit(20);
  }

  async createExportJob(input: typeof complianceExportJobs.$inferInsert) {
    const [row] = await this.db.insert(complianceExportJobs).values(input).returning();
    return row!;
  }

  async completeExportJob(organizationId: string, jobId: string, fileKey: string) {
    const [row] = await this.db
      .update(complianceExportJobs)
      .set({
        status: 'ready',
        fileKey,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(complianceExportJobs.id, jobId),
          eq(complianceExportJobs.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async controlEffectivenessStats(organizationId: string) {
    const controls = await this.listControls(organizationId);
    const active = controls.filter((c) => c.status === 'active');
    const effective = active.filter((c) => c.effectiveness === 'effective' || c.effectiveness === 'high');
    const testedRecently = active.filter((c) => {
      if (!c.lastTestedAt) return false;
      const days = (Date.now() - c.lastTestedAt.getTime()) / (1000 * 60 * 60 * 24);
      return days <= 90;
    });
    const rate = active.length > 0 ? Math.round((effective.length / active.length) * 100) : 0;
    return {
      total: controls.length,
      active: active.length,
      effectiveCount: effective.length,
      effectivenessRate: rate,
      testedRecently: testedRecently.length,
      underReview: controls.filter((c) => c.status === 'under_review').length,
      ineffective: controls.filter((c) => c.status === 'ineffective').length,
    };
  }

  async regulatoryMonitoringStats(organizationId: string) {
    const entries = await this.listRegulatory(organizationId);
    return {
      total: entries.length,
      compliant: entries.filter((e) => e.complianceStatus === 'compliant').length,
      reviewRequired: entries.filter((e) => e.complianceStatus === 'review_required').length,
      nonCompliant: entries.filter((e) => e.complianceStatus === 'non_compliant').length,
    };
  }
}
