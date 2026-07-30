import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { RiskRepository } from '@workspace/data/repositories/risk';
import type { RiskRatingThreshold } from '@workspace/domain/risk';
import {
  aggregateHeatMap,
  buildRiskScore,
  DEFAULT_RATING_THRESHOLDS,
} from './matrix.js';

export interface RiskDashboardData {
  readonly statistics: {
    readonly total: number;
    readonly active: number;
    readonly underReview: number;
    readonly approved: number;
    readonly hazards: number;
    readonly highCritical: number;
    readonly overdueReviews: number;
    readonly treatmentsOpen: number;
  };
  readonly kpis: {
    readonly averageResidualScore: number;
    readonly reductionRate: number;
    readonly reviewCompliance: number;
  };
}

export class RiskService {
  constructor(private readonly risk: RiskRepository) {}

  list(context: AuthorizationContext, status?: string) {
    return this.risk.listAssessments(context, status);
  }

  async get(context: AuthorizationContext, assessmentId: string) {
    const record = await this.risk.getAssessment(context, assessmentId);
    if (record === null) {
      throw AppError.notFound('Risk assessment not found');
    }
    const [hazards, treatments, reviews, bowtie, matrix] = await Promise.all([
      this.risk.listHazards(context, assessmentId),
      this.risk.listTreatments(context, assessmentId),
      this.risk.listReviews(context, assessmentId),
      this.risk.listBowtieElements(context, assessmentId),
      record.matrixConfigId
        ? this.risk.listMatrices(context).then((rows) =>
            rows.find((m) => m.id === record.matrixConfigId) ?? null,
          )
        : this.risk.getDefaultMatrix(context),
    ]);
    return { record, hazards, treatments, reviews, bowtie, matrix };
  }

  async create(
    context: AuthorizationContext,
    input: {
      title: string;
      description?: string;
      assessmentType?: string;
      site?: string;
      department?: string;
      activity?: string;
      inherentLikelihood?: number;
      inherentSeverity?: number;
      residualLikelihood?: number;
      residualSeverity?: number;
    },
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    const matrix = await this.risk.getDefaultMatrix(context);
    const thresholds = parseThresholds(matrix?.ratingThresholds);
    const inherent =
      input.inherentLikelihood !== undefined && input.inherentSeverity !== undefined
        ? buildRiskScore(input.inherentLikelihood, input.inherentSeverity, thresholds)
        : null;
    const residual =
      input.residualLikelihood !== undefined && input.residualSeverity !== undefined
        ? buildRiskScore(input.residualLikelihood, input.residualSeverity, thresholds)
        : null;
    return this.risk.createAssessment(context, {
      title: input.title,
      description: input.description ?? null,
      assessmentType: (input.assessmentType ?? 'workplace') as never,
      status: 'draft',
      site: input.site ?? null,
      department: input.department ?? null,
      activity: input.activity ?? null,
      matrixConfigId: matrix?.id ?? null,
      inherentLikelihood: inherent?.likelihood ?? null,
      inherentSeverity: inherent?.severity ?? null,
      inherentScore: inherent?.score ?? null,
      inherentRating: inherent?.rating ?? null,
      residualLikelihood: residual?.likelihood ?? null,
      residualSeverity: residual?.severity ?? null,
      residualScore: residual?.score ?? null,
      residualRating: residual?.rating ?? null,
      assignedTo: context.userId ?? null,
    });
  }

  async update(context: AuthorizationContext, assessmentId: string, patch: Record<string, unknown>) {
    const existing = await this.risk.getAssessment(context, assessmentId);
    if (existing === null) {
      throw AppError.notFound('Risk assessment not found');
    }
    const matrix = await this.risk.getDefaultMatrix(context);
    const thresholds = parseThresholds(matrix?.ratingThresholds);
    const updatePatch: Record<string, unknown> = {};
    for (const key of ['title', 'description', 'site', 'department', 'activity', 'status', 'assignedTo']) {
      if (key in patch) updatePatch[key] = patch[key];
    }
    if (typeof patch.reviewDueDate === 'string') {
      updatePatch.reviewDueDate = new Date(patch.reviewDueDate);
    }
    if (typeof patch.inherentLikelihood === 'number' && typeof patch.inherentSeverity === 'number') {
      const score = buildRiskScore(patch.inherentLikelihood, patch.inherentSeverity, thresholds);
      Object.assign(updatePatch, {
        inherentLikelihood: score.likelihood,
        inherentSeverity: score.severity,
        inherentScore: score.score,
        inherentRating: score.rating,
      });
    }
    if (typeof patch.residualLikelihood === 'number' && typeof patch.residualSeverity === 'number') {
      const score = buildRiskScore(patch.residualLikelihood, patch.residualSeverity, thresholds);
      Object.assign(updatePatch, {
        residualLikelihood: score.likelihood,
        residualSeverity: score.severity,
        residualScore: score.score,
        residualRating: score.rating,
      });
    }
    return this.risk.updateAssessment(context, assessmentId, updatePatch);
  }

  async scoreAssessment(
    context: AuthorizationContext,
    assessmentId: string,
    input: { likelihood: number; severity: number; scoreType: 'inherent' | 'residual' },
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    const matrix = await this.risk.getDefaultMatrix(context);
    const thresholds = parseThresholds(matrix?.ratingThresholds);
    const score = buildRiskScore(input.likelihood, input.severity, thresholds);
    if (input.scoreType === 'inherent') {
      return this.risk.updateAssessment(context, assessmentId, {
        inherentLikelihood: score.likelihood,
        inherentSeverity: score.severity,
        inherentScore: score.score,
        inherentRating: score.rating,
      });
    }
    return this.risk.updateAssessment(context, assessmentId, {
      residualLikelihood: score.likelihood,
      residualSeverity: score.severity,
      residualScore: score.score,
      residualRating: score.rating,
    });
  }

  async approve(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    return this.risk.updateAssessment(context, assessmentId, {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: context.userId ?? null,
    });
  }

  createHazard(
    context: AuthorizationContext,
    input: {
      title: string;
      description?: string;
      category?: string;
      riskAssessmentId?: string;
      location?: string;
      inherentLikelihood?: number;
      inherentSeverity?: number;
      residualLikelihood?: number;
      residualSeverity?: number;
      existingControls?: string[];
    },
  ) {
    return this.createHazardWithScores(context, input);
  }

  async createHazardWithScores(
    context: AuthorizationContext,
    input: {
      title: string;
      description?: string;
      category?: string;
      riskAssessmentId?: string;
      location?: string;
      inherentLikelihood?: number;
      inherentSeverity?: number;
      residualLikelihood?: number;
      residualSeverity?: number;
      existingControls?: string[];
    },
  ) {
    const matrix = await this.risk.getDefaultMatrix(context);
    const thresholds = parseThresholds(matrix?.ratingThresholds);
    const inherent =
      input.inherentLikelihood !== undefined && input.inherentSeverity !== undefined
        ? buildRiskScore(input.inherentLikelihood, input.inherentSeverity, thresholds)
        : null;
    const residual =
      input.residualLikelihood !== undefined && input.residualSeverity !== undefined
        ? buildRiskScore(input.residualLikelihood, input.residualSeverity, thresholds)
        : null;
    return this.risk.createHazard(context, {
      title: input.title,
      description: input.description ?? null,
      category: (input.category ?? 'physical') as never,
      status: 'identified',
      riskAssessmentId: input.riskAssessmentId ?? null,
      location: input.location ?? null,
      existingControls: input.existingControls ?? [],
      inherentLikelihood: inherent?.likelihood ?? null,
      inherentSeverity: inherent?.severity ?? null,
      inherentScore: inherent?.score ?? null,
      inherentRating: inherent?.rating ?? null,
      residualLikelihood: residual?.likelihood ?? null,
      residualSeverity: residual?.severity ?? null,
      residualScore: residual?.score ?? null,
      residualRating: residual?.rating ?? null,
    });
  }

  listHazards(context: AuthorizationContext, assessmentId?: string) {
    return this.risk.listHazards(context, assessmentId);
  }

  createTreatment(
    context: AuthorizationContext,
    assessmentId: string,
    input: {
      title: string;
      description?: string;
      treatmentType?: string;
      hazardId?: string;
      dueDate?: string;
    },
  ) {
    return this.risk.createTreatment(context, {
      riskAssessmentId: assessmentId,
      hazardId: input.hazardId ?? null,
      title: input.title,
      description: input.description ?? null,
      treatmentType: (input.treatmentType ?? 'administrative') as never,
      status: 'planned',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      ownerId: context.userId ?? null,
    });
  }

  createReview(
    context: AuthorizationContext,
    assessmentId: string,
    input: { outcome: string; notes?: string; nextReviewDate?: string },
  ) {
    return this.risk.createReview(context, {
      riskAssessmentId: assessmentId,
      outcome: input.outcome as never,
      notes: input.notes ?? null,
      nextReviewDate: input.nextReviewDate ? new Date(input.nextReviewDate) : null,
    });
  }

  createBowtieElement(
    context: AuthorizationContext,
    assessmentId: string,
    input: { elementType: string; title: string; description?: string },
  ) {
    return this.risk.createBowtieElement(context, {
      riskAssessmentId: assessmentId,
      elementType: input.elementType as never,
      title: input.title,
      description: input.description ?? null,
    });
  }

  async getDashboard(context: AuthorizationContext): Promise<RiskDashboardData> {
    const counts = await this.risk.dashboardCounts(context);
    const assessments = await this.risk.listAssessments(context);
    const scored = assessments.filter((a) => a.residualScore !== null);
    const averageResidualScore =
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, a) => sum + (a.residualScore ?? 0), 0) / scored.length,
          )
        : 0;
    const reduced = assessments.filter(
      (a) =>
        a.inherentScore !== null &&
        a.residualScore !== null &&
        (a.residualScore ?? 0) < (a.inherentScore ?? 0),
    );
    const reductionRate =
      assessments.length > 0 ? Math.round((reduced.length / assessments.length) * 100) : 0;
    const reviewCompliance =
      counts.total > 0
        ? Math.round(((counts.total - counts.overdueReviews) / counts.total) * 100)
        : 100;
    return {
      statistics: {
        total: counts.total,
        active: counts.active ?? 0,
        underReview: counts.under_review ?? 0,
        approved: counts.approved ?? 0,
        hazards: counts.hazards,
        highCritical: counts.highCritical,
        overdueReviews: counts.overdueReviews,
        treatmentsOpen: counts.treatmentsOpen,
      },
      kpis: { averageResidualScore, reductionRate, reviewCompliance },
    };
  }

  async getHeatMap(context: AuthorizationContext) {
    const matrix = await this.risk.getDefaultMatrix(context);
    const thresholds = parseThresholds(matrix?.ratingThresholds);
    const rows = await this.risk.heatMapData(context);
    return {
      matrix: matrix ?? null,
      cells: aggregateHeatMap(rows, thresholds),
    };
  }

  getMatrix(context: AuthorizationContext) {
    return this.risk.listMatrices(context);
  }

  listForPortal(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.risk.listAssessments(context).then((rows) =>
      rows
        .filter((row) => row.status !== 'draft' && row.status !== 'archived')
        .map((row) => ({
          id: row.id,
          assessmentNumber: row.assessmentNumber,
          title: row.title,
          status: row.status,
          residualRating: row.residualRating,
          reviewDueDate: row.reviewDueDate?.toISOString() ?? null,
        })),
    );
  }
}

function parseThresholds(raw: unknown): readonly RiskRatingThreshold[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_RATING_THRESHOLDS;
  }
  return raw as RiskRatingThreshold[];
}

export function createRiskServices(deps: { risk: RiskRepository }) {
  return {
    risk: new RiskService(deps.risk),
  };
}

export type RiskServices = ReturnType<typeof createRiskServices>;
