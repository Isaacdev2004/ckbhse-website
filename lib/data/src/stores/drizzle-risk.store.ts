import type { Database } from '@workspace/db';
import {
  hazardRegister,
  riskAssessments,
  riskBowtieElements,
  riskMatrixConfigs,
  riskReviews,
  riskTreatmentPlans,
} from '@workspace/db/schema';
import { and, desc, eq, isNull, lt, sql } from 'drizzle-orm';

export class DrizzleRiskStore {
  constructor(private readonly db: Database) {}

  async listAssessments(organizationId: string, status?: string) {
    const conditions = [
      eq(riskAssessments.organizationId, organizationId),
      isNull(riskAssessments.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(riskAssessments.status, status as never));
    }
    return this.db
      .select()
      .from(riskAssessments)
      .where(and(...conditions))
      .orderBy(desc(riskAssessments.updatedAt));
  }

  async getAssessment(organizationId: string, assessmentId: string) {
    const [row] = await this.db
      .select()
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.id, assessmentId),
          eq(riskAssessments.organizationId, organizationId),
          isNull(riskAssessments.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createAssessment(input: typeof riskAssessments.$inferInsert) {
    const [row] = await this.db.insert(riskAssessments).values(input).returning();
    return row!;
  }

  async updateAssessment(
    organizationId: string,
    assessmentId: string,
    patch: Partial<typeof riskAssessments.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(riskAssessments)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(riskAssessments.id, assessmentId),
          eq(riskAssessments.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async nextAssessmentNumber(organizationId: string) {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(riskAssessments)
      .where(eq(riskAssessments.organizationId, organizationId));
    const seq = (row?.count ?? 0) + 1;
    return `RA-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
  }

  async listHazards(organizationId: string, assessmentId?: string) {
    const conditions = [
      eq(hazardRegister.organizationId, organizationId),
      isNull(hazardRegister.deletedAt),
    ];
    if (assessmentId !== undefined) {
      conditions.push(eq(hazardRegister.riskAssessmentId, assessmentId));
    }
    return this.db
      .select()
      .from(hazardRegister)
      .where(and(...conditions))
      .orderBy(desc(hazardRegister.updatedAt));
  }

  async getHazard(organizationId: string, hazardId: string) {
    const [row] = await this.db
      .select()
      .from(hazardRegister)
      .where(
        and(
          eq(hazardRegister.id, hazardId),
          eq(hazardRegister.organizationId, organizationId),
          isNull(hazardRegister.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createHazard(input: typeof hazardRegister.$inferInsert) {
    const [row] = await this.db.insert(hazardRegister).values(input).returning();
    return row!;
  }

  async updateHazard(
    organizationId: string,
    hazardId: string,
    patch: Partial<typeof hazardRegister.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(hazardRegister)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(hazardRegister.id, hazardId),
          eq(hazardRegister.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async nextHazardNumber(organizationId: string) {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(hazardRegister)
      .where(eq(hazardRegister.organizationId, organizationId));
    const seq = (row?.count ?? 0) + 1;
    return `HZ-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
  }

  async getDefaultMatrix(organizationId: string) {
    const [row] = await this.db
      .select()
      .from(riskMatrixConfigs)
      .where(
        and(
          eq(riskMatrixConfigs.organizationId, organizationId),
          eq(riskMatrixConfigs.isDefault, true),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listMatrices(organizationId: string) {
    return this.db
      .select()
      .from(riskMatrixConfigs)
      .where(eq(riskMatrixConfigs.organizationId, organizationId))
      .orderBy(desc(riskMatrixConfigs.isDefault), desc(riskMatrixConfigs.updatedAt));
  }

  async listTreatments(organizationId: string, assessmentId: string) {
    return this.db
      .select()
      .from(riskTreatmentPlans)
      .where(
        and(
          eq(riskTreatmentPlans.organizationId, organizationId),
          eq(riskTreatmentPlans.riskAssessmentId, assessmentId),
        ),
      )
      .orderBy(desc(riskTreatmentPlans.updatedAt));
  }

  async createTreatment(input: typeof riskTreatmentPlans.$inferInsert) {
    const [row] = await this.db.insert(riskTreatmentPlans).values(input).returning();
    return row!;
  }

  async listReviews(organizationId: string, assessmentId: string) {
    return this.db
      .select()
      .from(riskReviews)
      .where(
        and(
          eq(riskReviews.organizationId, organizationId),
          eq(riskReviews.riskAssessmentId, assessmentId),
        ),
      )
      .orderBy(desc(riskReviews.reviewDate));
  }

  async createReview(input: typeof riskReviews.$inferInsert) {
    const [row] = await this.db.insert(riskReviews).values(input).returning();
    return row!;
  }

  async listBowtieElements(organizationId: string, assessmentId: string) {
    return this.db
      .select()
      .from(riskBowtieElements)
      .where(
        and(
          eq(riskBowtieElements.organizationId, organizationId),
          eq(riskBowtieElements.riskAssessmentId, assessmentId),
        ),
      )
      .orderBy(riskBowtieElements.elementType);
  }

  async createBowtieElement(input: typeof riskBowtieElements.$inferInsert) {
    const [row] = await this.db.insert(riskBowtieElements).values(input).returning();
    return row!;
  }

  async dashboardCounts(organizationId: string) {
    const statuses = ['draft', 'active', 'under_review', 'approved', 'archived'] as const;
    const counts: Record<string, number> = {};
    for (const status of statuses) {
      const [row] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(riskAssessments)
        .where(
          and(
            eq(riskAssessments.organizationId, organizationId),
            eq(riskAssessments.status, status),
            isNull(riskAssessments.deletedAt),
          ),
        );
      counts[status] = row?.count ?? 0;
    }
    const [total] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(riskAssessments)
      .where(and(eq(riskAssessments.organizationId, organizationId), isNull(riskAssessments.deletedAt)));
    const [hazards] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(hazardRegister)
      .where(and(eq(hazardRegister.organizationId, organizationId), isNull(hazardRegister.deletedAt)));
    const [highCritical] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.organizationId, organizationId),
          isNull(riskAssessments.deletedAt),
          sql`${riskAssessments.residualRating} IN ('high', 'critical')`,
        ),
      );
    const [overdueReviews] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.organizationId, organizationId),
          isNull(riskAssessments.deletedAt),
          lt(riskAssessments.reviewDueDate, new Date()),
        ),
      );
    const [treatmentsOpen] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(riskTreatmentPlans)
      .where(
        and(
          eq(riskTreatmentPlans.organizationId, organizationId),
          sql`${riskTreatmentPlans.status} IN ('planned', 'in_progress')`,
        ),
      );
    return {
      total: total?.count ?? 0,
      hazards: hazards?.count ?? 0,
      highCritical: highCritical?.count ?? 0,
      overdueReviews: overdueReviews?.count ?? 0,
      treatmentsOpen: treatmentsOpen?.count ?? 0,
      draft: counts.draft ?? 0,
      active: counts.active ?? 0,
      under_review: counts.under_review ?? 0,
      approved: counts.approved ?? 0,
      archived: counts.archived ?? 0,
    };
  }

  async heatMapData(organizationId: string) {
    const rows = await this.db
      .select({
        likelihood: riskAssessments.residualLikelihood,
        severity: riskAssessments.residualSeverity,
        rating: riskAssessments.residualRating,
      })
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.organizationId, organizationId),
          isNull(riskAssessments.deletedAt),
          sql`${riskAssessments.residualLikelihood} IS NOT NULL`,
          sql`${riskAssessments.residualSeverity} IS NOT NULL`,
        ),
      );
    const hazardRows = await this.db
      .select({
        likelihood: hazardRegister.residualLikelihood,
        severity: hazardRegister.residualSeverity,
        rating: hazardRegister.residualRating,
      })
      .from(hazardRegister)
      .where(
        and(
          eq(hazardRegister.organizationId, organizationId),
          isNull(hazardRegister.deletedAt),
          sql`${hazardRegister.residualLikelihood} IS NOT NULL`,
          sql`${hazardRegister.residualSeverity} IS NOT NULL`,
        ),
      );
    return [...rows, ...hazardRows];
  }
}
