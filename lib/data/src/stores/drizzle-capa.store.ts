import type { Database } from '@workspace/db';
import {
  capaApprovals,
  capaEscalations,
  capaNotifications,
  capaRecords,
  capaRootCauseAnalyses,
  capaVerifications,
} from '@workspace/db/schema';
import { and, desc, eq, isNull, lt, sql } from 'drizzle-orm';

export class DrizzleCapaStore {
  constructor(private readonly db: Database) {}

  async listCapa(organizationId: string, status?: string) {
    const conditions = [
      eq(capaRecords.organizationId, organizationId),
      isNull(capaRecords.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(capaRecords.status, status as never));
    }
    return this.db
      .select()
      .from(capaRecords)
      .where(and(...conditions))
      .orderBy(desc(capaRecords.updatedAt));
  }

  async getCapa(organizationId: string, capaId: string) {
    const [row] = await this.db
      .select()
      .from(capaRecords)
      .where(
        and(
          eq(capaRecords.id, capaId),
          eq(capaRecords.organizationId, organizationId),
          isNull(capaRecords.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createCapa(input: typeof capaRecords.$inferInsert) {
    const [row] = await this.db.insert(capaRecords).values(input).returning();
    return row!;
  }

  async updateCapa(
    organizationId: string,
    capaId: string,
    patch: Partial<typeof capaRecords.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(capaRecords)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(capaRecords.id, capaId),
          eq(capaRecords.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async nextCapaNumber(organizationId: string) {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(capaRecords)
      .where(eq(capaRecords.organizationId, organizationId));
    const seq = (row?.count ?? 0) + 1;
    return `CAPA-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
  }

  async dashboardCounts(organizationId: string) {
    const statuses = ['open', 'in_progress', 'pending_verification', 'pending_approval', 'closed', 'overdue'] as const;
    const counts: Record<string, number> = {};
    for (const status of statuses) {
      const [row] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(capaRecords)
        .where(
          and(
            eq(capaRecords.organizationId, organizationId),
            eq(capaRecords.status, status),
            isNull(capaRecords.deletedAt),
          ),
        );
      counts[status] = row?.count ?? 0;
    }
    const [total] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(capaRecords)
      .where(and(eq(capaRecords.organizationId, organizationId), isNull(capaRecords.deletedAt)));
    const [corrective] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(capaRecords)
      .where(
        and(
          eq(capaRecords.organizationId, organizationId),
          eq(capaRecords.capaType, 'corrective'),
          isNull(capaRecords.deletedAt),
        ),
      );
    const [preventive] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(capaRecords)
      .where(
        and(
          eq(capaRecords.organizationId, organizationId),
          eq(capaRecords.capaType, 'preventive'),
          isNull(capaRecords.deletedAt),
        ),
      );
    const [overdue] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(capaRecords)
      .where(
        and(
          eq(capaRecords.organizationId, organizationId),
          isNull(capaRecords.deletedAt),
          lt(capaRecords.dueDate, new Date()),
          sql`${capaRecords.status} not in ('closed', 'cancelled')`,
        ),
      );
    return {
      total: total?.count ?? 0,
      open: counts.open ?? 0,
      inProgress: counts.in_progress ?? 0,
      pendingVerification: counts.pending_verification ?? 0,
      pendingApproval: counts.pending_approval ?? 0,
      closed: counts.closed ?? 0,
      overdue: overdue?.count ?? 0,
      corrective: corrective?.count ?? 0,
      preventive: preventive?.count ?? 0,
    };
  }

  async getRca(capaId: string) {
    const [row] = await this.db
      .select()
      .from(capaRootCauseAnalyses)
      .where(eq(capaRootCauseAnalyses.capaId, capaId))
      .orderBy(desc(capaRootCauseAnalyses.updatedAt))
      .limit(1);
    return row ?? null;
  }

  async upsertRca(input: typeof capaRootCauseAnalyses.$inferInsert) {
    const existing = await this.getRca(input.capaId);
    if (existing) {
      const [row] = await this.db
        .update(capaRootCauseAnalyses)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(capaRootCauseAnalyses.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await this.db.insert(capaRootCauseAnalyses).values(input).returning();
    return row!;
  }

  async listVerifications(capaId: string) {
    return this.db
      .select()
      .from(capaVerifications)
      .where(eq(capaVerifications.capaId, capaId))
      .orderBy(desc(capaVerifications.createdAt));
  }

  async createVerification(input: typeof capaVerifications.$inferInsert) {
    const [row] = await this.db.insert(capaVerifications).values(input).returning();
    return row!;
  }

  async listApprovals(capaId: string) {
    return this.db
      .select()
      .from(capaApprovals)
      .where(eq(capaApprovals.capaId, capaId))
      .orderBy(desc(capaApprovals.approvalLevel));
  }

  async createApproval(input: typeof capaApprovals.$inferInsert) {
    const [row] = await this.db.insert(capaApprovals).values(input).returning();
    return row!;
  }

  async listEscalations(capaId: string) {
    return this.db
      .select()
      .from(capaEscalations)
      .where(eq(capaEscalations.capaId, capaId))
      .orderBy(desc(capaEscalations.escalatedAt));
  }

  async createEscalation(input: typeof capaEscalations.$inferInsert) {
    const [row] = await this.db.insert(capaEscalations).values(input).returning();
    return row!;
  }

  async createNotification(input: typeof capaNotifications.$inferInsert) {
    const [row] = await this.db.insert(capaNotifications).values(input).returning();
    return row!;
  }

  async listNotifications(capaId: string) {
    return this.db
      .select()
      .from(capaNotifications)
      .where(eq(capaNotifications.capaId, capaId))
      .orderBy(desc(capaNotifications.createdAt));
  }
}
