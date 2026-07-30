import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { InspectionRepository } from '@workspace/data/repositories/compliance';
import type { ComplianceRepository } from '@workspace/data/repositories/compliance';
import type { LegalRegisterRepository } from '@workspace/data/repositories/compliance';
import type { RegulatoryRepository } from '@workspace/data/repositories/compliance';
import type { ControlRepository } from '@workspace/data/repositories/compliance';
import type { ComplianceCalendarRepository } from '@workspace/data/repositories/compliance';
import type { AuditRepository } from '@workspace/data/repositories/audit';
import type { CapaRepository } from '@workspace/data/repositories/capa';
import type { ComplianceAnalyticsRepository } from '@workspace/data/repositories/compliance';
import {
  ComplianceAnalyticsService,
  createComplianceAnalyticsService,
  type ComplianceAnalyticsExecutiveData,
} from './analytics.js';

export type { ComplianceAnalyticsExecutiveData };
export {
  ComplianceAnalyticsService,
  createComplianceAnalyticsService,
} from './analytics.js';

export interface ComplianceRepositories {
  readonly inspection: InspectionRepository;
  readonly compliance: ComplianceRepository;
  readonly legal: LegalRegisterRepository;
  readonly regulatory: RegulatoryRepository;
  readonly control: ControlRepository;
  readonly calendar: ComplianceCalendarRepository;
  readonly audit: AuditRepository;
  readonly capa: CapaRepository;
}

export interface ComplianceWorkspaceData {
  readonly overallComplianceScore: number;
  readonly openAudits: number;
  readonly openInspections: number;
  readonly outstandingFindings: number;
  readonly legalObligations: number;
  readonly activeControls: number;
  readonly upcomingReviews: readonly { readonly title: string; readonly startsAt: string }[];
  readonly certifications: readonly { readonly name: string; readonly status: string }[];
}

export interface ComplianceDashboardData {
  readonly widgets: {
    readonly compliancePercent: number;
    readonly auditCompletion: number;
    readonly inspectionCompletion: number;
    readonly capaCompletion: number;
    readonly trainingCompletion: number;
    readonly openIncidents: number;
    readonly overdueReviews: number;
    readonly controlEffectiveness: number;
    readonly openAlerts: number;
  };
  readonly trends: {
    readonly monthlyCompliance: readonly { readonly month: string; readonly score: number }[];
    readonly auditTrend: readonly { readonly month: string; readonly count: number }[];
  };
}

export class InspectionService {
  constructor(private readonly inspection: InspectionRepository) {}

  listTypes(context: AuthorizationContext) {
    return this.inspection.listTypes(context);
  }

  list(context: AuthorizationContext, status?: string) {
    return this.inspection.list(context, status);
  }

  async get(context: AuthorizationContext, inspectionId: string) {
    const inspection = await this.inspection.get(context, inspectionId);
    if (inspection === null) {
      throw AppError.notFound('Inspection not found');
    }
    const [findings, evidence, checklist] = await Promise.all([
      this.inspection.listFindings(context, inspectionId),
      this.inspection.listEvidence(context, inspectionId),
      this.inspection.listChecklist(context, inspectionId),
    ]);
    return { inspection, findings, evidence, checklist };
  }

  create(
    context: AuthorizationContext,
    input: {
      name: string;
      inspectionTypeId?: string;
      site?: string;
      department?: string;
      frequency?: string;
      scheduledAt?: string;
    },
  ) {
    return this.inspection.create(context, {
      name: input.name,
      status: 'draft',
      inspectionTypeId: input.inspectionTypeId ?? null,
      site: input.site ?? null,
      department: input.department ?? null,
      frequency: (input.frequency ?? 'unscheduled') as never,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    });
  }

  update(
    context: AuthorizationContext,
    inspectionId: string,
    patch: Record<string, unknown>,
  ) {
    const updatePatch: Record<string, unknown> = {};
    for (const key of ['name', 'site', 'department', 'status', 'score', 'notes', 'frequency']) {
      if (key in patch) updatePatch[key] = patch[key];
    }
    if (typeof patch.scheduledAt === 'string') {
      updatePatch.scheduledAt = new Date(patch.scheduledAt);
    }
    if (patch.status === 'completed' || patch.status === 'passed' || patch.status === 'failed') {
      updatePatch.completedAt = new Date();
    }
    return this.inspection.update(context, inspectionId, updatePatch);
  }

  async getDashboard(context: AuthorizationContext) {
    const [counts, today, upcoming] = await Promise.all([
      this.inspection.dashboardCounts(context),
      this.inspection.listToday(context),
      this.inspection.listUpcoming(context),
    ]);
    const completionRate =
      counts.total > 0
        ? Math.round(((counts.completed + counts.passed) / counts.total) * 100)
        : 0;
    return {
      statistics: counts,
      kpis: {
        averageInspectionScore: counts.averageScore,
        outstandingFindings: counts.openFindings,
        complianceTrend: completionRate,
      },
      today: today.map((row) => ({
        id: row.id,
        name: row.name,
        scheduledAt: row.scheduledAt?.toISOString() ?? null,
        status: row.status,
      })),
      upcoming: upcoming.map((row) => ({
        id: row.id,
        name: row.name,
        scheduledAt: row.scheduledAt?.toISOString() ?? null,
        status: row.status,
      })),
    };
  }

  listForPortal(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.inspection.list(context).then((rows) =>
      rows
        .filter((row) => !['draft', 'cancelled'].includes(row.status))
        .map((row) => ({
          id: row.id,
          title: row.name,
          status: row.status,
          scheduledAt: row.scheduledAt?.toISOString() ?? null,
          site: row.site,
          score: row.score,
        })),
    );
  }

  createFinding(
    context: AuthorizationContext,
    inspectionId: string,
    input: { title: string; description?: string; severity?: string },
  ) {
    return this.inspection.createFinding(context, {
      inspectionId,
      title: input.title,
      description: input.description ?? null,
      severity: (input.severity ?? 'minor') as never,
    });
  }

  saveChecklist(
    context: AuthorizationContext,
    input: {
      inspectionId: string;
      itemKey: string;
      prompt: string;
      responseValue?: string;
      score?: number;
      comment?: string;
    },
  ) {
    return this.inspection.saveChecklist(context, {
      inspectionId: input.inspectionId,
      itemKey: input.itemKey,
      prompt: input.prompt,
      responseValue: input.responseValue ?? null,
      score: input.score ?? null,
      comment: input.comment ?? null,
    });
  }

  createEvidence(
    context: AuthorizationContext,
    input: { inspectionId: string; fileName?: string; notes?: string },
  ) {
    return this.inspection.createEvidence(context, {
      inspectionId: input.inspectionId,
      fileName: input.fileName ?? null,
      notes: input.notes ?? null,
    });
  }

  async listCalendar(context: AuthorizationContext) {
    const rows = await this.inspection.listUpcoming(context);
    return rows.map((row) => ({
      id: row.id,
      title: row.name,
      start: row.scheduledAt?.toISOString() ?? null,
      status: row.status,
      site: row.site,
    }));
  }
}

export class ComplianceScoreService {
  constructor(
    private readonly compliance: ComplianceRepository,
    private readonly inspection: InspectionRepository,
    private readonly audit: AuditRepository,
  ) {}

  async calculate(context: AuthorizationContext) {
    const [configs, inspectionCounts, auditCounts] = await Promise.all([
      this.compliance.listScoreConfigs(context),
      this.inspection.dashboardCounts(context),
      this.audit.dashboardCounts(context),
    ]);
    const config = configs[0];
    const weights = (config?.weights ?? {}) as Record<string, number>;
    const auditScore = auditCounts.averageScore;
    const inspectionScore = inspectionCounts.averageScore;
    const auditWeight = weights.audit ?? 30;
    const inspectionWeight = weights.inspection ?? 25;
    const trainingWeight = weights.training ?? 20;
    const legalWeight = weights.legal ?? 15;
    const controlsWeight = weights.controls ?? 10;
    const totalWeight = auditWeight + inspectionWeight + trainingWeight + legalWeight + controlsWeight;
    const weighted =
      totalWeight > 0
        ? Math.round(
            (auditScore * auditWeight +
              inspectionScore * inspectionWeight +
              75 * trainingWeight +
              80 * legalWeight +
              85 * controlsWeight) /
              totalWeight,
          )
        : 0;
    return {
      organizationScore: weighted,
      auditScore,
      inspectionScore,
      config: config ?? null,
      breakdown: {
        audit: { score: auditScore, weight: auditWeight },
        inspection: { score: inspectionScore, weight: inspectionWeight },
        training: { score: 75, weight: trainingWeight },
        legal: { score: 80, weight: legalWeight },
        controls: { score: 85, weight: controlsWeight },
      },
    };
  }
}

export class LegalRegisterService {
  constructor(private readonly legal: LegalRegisterRepository) {}

  list(context: AuthorizationContext) {
    return this.legal.list(context);
  }

  create(
    context: AuthorizationContext,
    input: {
      regulation: string;
      legislation?: string;
      jurisdiction?: string;
      category?: string;
      authority?: string;
      reviewDate?: string;
    },
  ) {
    return this.legal.create(context, {
      regulation: input.regulation,
      legislation: input.legislation ?? null,
      jurisdiction: input.jurisdiction ?? null,
      category: input.category ?? null,
      authority: input.authority ?? null,
      reviewDate: input.reviewDate ? new Date(input.reviewDate) : null,
    });
  }
}

export class RegulatoryService {
  constructor(private readonly regulatory: RegulatoryRepository) {}

  list(context: AuthorizationContext) {
    return this.regulatory.list(context);
  }
}

export class ControlRegisterService {
  constructor(private readonly control: ControlRepository) {}

  list(context: AuthorizationContext) {
    return this.control.list(context);
  }

  create(
    context: AuthorizationContext,
    input: {
      name: string;
      description?: string;
      controlType: string;
      frequency?: string;
    },
  ) {
    return this.control.create(context, {
      name: input.name,
      description: input.description ?? null,
      controlType: input.controlType as never,
      frequency: input.frequency ?? null,
    });
  }
}

export class ComplianceService {
  constructor(
    private readonly repos: ComplianceRepositories,
    private readonly score: ComplianceScoreService,
    private readonly analytics?: ComplianceAnalyticsRepository,
  ) {}

  async getWorkspace(context: AuthorizationContext): Promise<ComplianceWorkspaceData> {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const [scoreData, auditCounts, inspectionCounts, legal, controls, calendar, frameworks] =
      await Promise.all([
        this.score.calculate(context),
        this.repos.audit.dashboardCounts(context),
        this.repos.inspection.dashboardCounts(context),
        this.repos.legal.list(context),
        this.repos.control.list(context),
        this.repos.calendar.list(context, new Date(), undefined),
        this.repos.compliance.listIsoFrameworks(context),
      ]);
    return {
      overallComplianceScore: scoreData.organizationScore,
      openAudits: auditCounts.scheduled + auditCounts.inProgress,
      openInspections: inspectionCounts.scheduled,
      outstandingFindings: auditCounts.openFindings + inspectionCounts.openFindings,
      legalObligations: legal.length,
      activeControls: controls.filter((c) => c.status === 'active').length,
      upcomingReviews: calendar.slice(0, 5).map((e) => ({
        title: e.title,
        startsAt: e.startsAt.toISOString(),
      })),
      certifications: frameworks.map((f) => ({
        name: f.name,
        status: f.isActive ? 'active' : 'inactive',
      })),
    };
  }

  async getDashboard(context: AuthorizationContext): Promise<ComplianceDashboardData> {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const [scoreData, auditCounts, inspectionCounts, capaCounts] = await Promise.all([
      this.score.calculate(context),
      this.repos.audit.dashboardCounts(context),
      this.repos.inspection.dashboardCounts(context),
      this.repos.capa.dashboardCounts(context),
    ]);
    const auditCompletion =
      auditCounts.total > 0 ? Math.round((auditCounts.closed / auditCounts.total) * 100) : 0;
    const inspectionCompletion =
      inspectionCounts.total > 0
        ? Math.round(
            ((inspectionCounts.completed + inspectionCounts.passed) / inspectionCounts.total) *
              100,
          )
        : 0;
    const capaCompletion =
      capaCounts.total > 0 ? Math.round((capaCounts.closed / capaCounts.total) * 100) : 0;

    let monthlyCompliance: { month: string; score: number }[] = [];
    let auditTrend: { month: string; count: number }[] = [];
    if (this.analytics) {
      const snapshots = await this.analytics.listKpiSnapshots(context, 12);
      const sorted = [...snapshots].sort((a, b) => a.snapshotMonth.localeCompare(b.snapshotMonth));
      monthlyCompliance = sorted.map((s) => ({
        month: s.snapshotMonth,
        score: s.complianceScore,
      }));
      auditTrend = sorted.map((s) => ({
        month: s.snapshotMonth,
        count: s.auditCompletion,
      }));
    }

    const controlStats = this.analytics
      ? await this.analytics.controlEffectiveness(context)
      : null;
    const alerts = this.analytics
      ? await this.analytics.listAlerts(context, 'open')
      : [];
    const overdueReviews = alerts.filter((a) => a.alertType === 'legal_review').length;

    return {
      widgets: {
        compliancePercent: scoreData.organizationScore,
        auditCompletion,
        inspectionCompletion,
        capaCompletion,
        trainingCompletion: 75,
        openIncidents: 0,
        overdueReviews,
        controlEffectiveness: controlStats?.effectivenessRate ?? 0,
        openAlerts: alerts.length,
      },
      trends: {
        monthlyCompliance,
        auditTrend,
      },
    };
  }

  listCalendar(context: AuthorizationContext) {
    return this.repos.calendar.list(context);
  }

  listIsoFrameworks(context: AuthorizationContext) {
    return this.repos.compliance.listIsoFrameworks(context);
  }

  listIsoClauses(context: AuthorizationContext, frameworkId: string) {
    return this.repos.compliance.listIsoClauses(context, frameworkId);
  }

  getScore(context: AuthorizationContext) {
    return this.score.calculate(context);
  }
}

export interface ComplianceServices {
  readonly inspection: InspectionService;
  readonly compliance: ComplianceService;
  readonly score: ComplianceScoreService;
  readonly legal: LegalRegisterService;
  readonly regulatory: RegulatoryService;
  readonly control: ControlRegisterService;
  readonly analytics: ComplianceAnalyticsService;
}

export function createComplianceServices(deps: {
  repos: ComplianceRepositories;
  analytics: ComplianceAnalyticsRepository;
}): ComplianceServices {
  const score = new ComplianceScoreService(
    deps.repos.compliance,
    deps.repos.inspection,
    deps.repos.audit,
  );
  const analytics = createComplianceAnalyticsService({
    repos: deps.repos,
    analytics: deps.analytics,
    score,
  });
  return {
    inspection: new InspectionService(deps.repos.inspection),
    compliance: new ComplianceService(deps.repos, score, deps.analytics),
    score,
    legal: new LegalRegisterService(deps.repos.legal),
    regulatory: new RegulatoryService(deps.repos.regulatory),
    control: new ControlRegisterService(deps.repos.control),
    analytics,
  };
}
