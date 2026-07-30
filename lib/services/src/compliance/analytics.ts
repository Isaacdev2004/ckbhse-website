import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { ComplianceAnalyticsRepository } from '@workspace/data/repositories/compliance';
import type { ComplianceRepositories } from './index.js';
import type { ComplianceScoreService } from './index.js';

export interface ComplianceAnalyticsExecutiveData {
  readonly complianceScore: number;
  readonly trendDirection: 'up' | 'down' | 'stable';
  readonly trendDelta: number;
  readonly widgets: {
    readonly auditCompletion: number;
    readonly inspectionCompletion: number;
    readonly capaCompletion: number;
    readonly trainingCompletion: number;
    readonly controlEffectiveness: number;
    readonly openFindings: number;
    readonly openAlerts: number;
    readonly criticalAlerts: number;
  };
  readonly trends: {
    readonly monthlyCompliance: readonly {
      readonly month: string;
      readonly score: number;
      readonly auditCompletion: number;
      readonly inspectionCompletion: number;
      readonly capaCompletion: number;
    }[];
    readonly auditTrend: readonly { readonly month: string; readonly count: number }[];
  };
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export class ComplianceAnalyticsService {
  constructor(
    private readonly repos: ComplianceRepositories,
    private readonly analytics: ComplianceAnalyticsRepository,
    private readonly score: ComplianceScoreService,
  ) {}

  async getExecutiveDashboard(
    context: AuthorizationContext,
  ): Promise<ComplianceAnalyticsExecutiveData> {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const [
      scoreData,
      auditCounts,
      inspectionCounts,
      capaCounts,
      controlStats,
      snapshots,
      alerts,
    ] = await Promise.all([
      this.score.calculate(context),
      this.repos.audit.dashboardCounts(context),
      this.repos.inspection.dashboardCounts(context),
      this.repos.capa.dashboardCounts(context),
      this.analytics.controlEffectiveness(context),
      this.analytics.listKpiSnapshots(context, 12),
      this.analytics.listAlerts(context, 'open'),
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

    const sorted = [...snapshots].sort((a, b) => a.snapshotMonth.localeCompare(b.snapshotMonth));
    const latest = sorted.at(-1);
    const previous = sorted.at(-2);
    const trendDelta =
      latest && previous ? latest.complianceScore - previous.complianceScore : 0;
    const trendDirection: 'up' | 'down' | 'stable' =
      trendDelta > 0 ? 'up' : trendDelta < 0 ? 'down' : 'stable';

    const monthlyCompliance = sorted.map((s) => ({
      month: s.snapshotMonth,
      score: s.complianceScore,
      auditCompletion: s.auditCompletion,
      inspectionCompletion: s.inspectionCompletion,
      capaCompletion: s.capaCompletion,
    }));

    const auditTrend = sorted.map((s) => ({
      month: s.snapshotMonth,
      count: s.auditCompletion,
    }));

    return {
      complianceScore: scoreData.organizationScore,
      trendDirection,
      trendDelta,
      widgets: {
        auditCompletion,
        inspectionCompletion,
        capaCompletion,
        trainingCompletion: latest?.trainingCompletion ?? 75,
        controlEffectiveness: controlStats.effectivenessRate,
        openFindings: auditCounts.openFindings + inspectionCounts.openFindings,
        openAlerts: alerts.length,
        criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
      },
      trends: { monthlyCompliance, auditTrend },
    };
  }

  async getKpis(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const [scoreData, controlStats, snapshots] = await Promise.all([
      this.score.calculate(context),
      this.analytics.controlEffectiveness(context),
      this.analytics.listKpiSnapshots(context, 6),
    ]);
    return {
      current: {
        complianceScore: scoreData.organizationScore,
        breakdown: scoreData.breakdown,
      },
      controlEffectiveness: controlStats,
      history: snapshots.map((s) => ({
        month: s.snapshotMonth,
        complianceScore: s.complianceScore,
        auditCompletion: s.auditCompletion,
        inspectionCompletion: s.inspectionCompletion,
        capaCompletion: s.capaCompletion,
        controlEffectiveness: s.controlEffectiveness,
      })),
    };
  }

  async getTrends(context: AuthorizationContext) {
    const snapshots = await this.analytics.listKpiSnapshots(context, 12);
    return {
      items: [...snapshots]
        .sort((a, b) => a.snapshotMonth.localeCompare(b.snapshotMonth))
        .map((s) => ({
          month: s.snapshotMonth,
          complianceScore: s.complianceScore,
          auditCompletion: s.auditCompletion,
          inspectionCompletion: s.inspectionCompletion,
          capaCompletion: s.capaCompletion,
          openFindings: s.openFindings,
        })),
    };
  }

  async getRegulatoryMonitoring(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REGULATORY_READ);
    const [stats, alerts, regulations] = await Promise.all([
      this.analytics.regulatoryMonitoring(context),
      this.analytics.listAlerts(context),
      this.repos.regulatory.list(context),
    ]);
    return { stats, alerts, regulations };
  }

  async getIsoDashboard(context: AuthorizationContext, frameworkId?: string) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const frameworks = await this.repos.compliance.listIsoFrameworks(context);
    const targetId = frameworkId ?? frameworks[0]?.id;
    if (!targetId) {
      return { frameworks: [], clauses: [], coveragePercent: 0 };
    }
    const clauses = await this.repos.compliance.listIsoClauses(context, targetId);
    const framework = frameworks.find((f) => f.id === targetId);
    const coveragePercent =
      clauses.length > 0 ? Math.min(100, Math.round((clauses.length / 20) * 100)) : 0;
    return {
      framework,
      frameworks,
      clauses,
      coveragePercent,
      clauseCount: clauses.length,
    };
  }

  getControlEffectiveness(context: AuthorizationContext) {
    return this.analytics.controlEffectiveness(context);
  }

  async getPerformanceAnalytics(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const [auditCounts, inspectionCounts, capaCounts, controlStats, scoreData] =
      await Promise.all([
        this.repos.audit.dashboardCounts(context),
        this.repos.inspection.dashboardCounts(context),
        this.repos.capa.dashboardCounts(context),
        this.analytics.controlEffectiveness(context),
        this.score.calculate(context),
      ]);
    return {
      complianceScore: scoreData.organizationScore,
      audits: {
        total: auditCounts.total,
        closed: auditCounts.closed,
        openFindings: auditCounts.openFindings,
        averageScore: auditCounts.averageScore,
      },
      inspections: {
        total: inspectionCounts.total,
        passed: inspectionCounts.passed,
        overdue: inspectionCounts.overdue,
        averageScore: inspectionCounts.averageScore,
      },
      capa: {
        total: capaCounts.total,
        closed: capaCounts.closed,
        overdue: capaCounts.overdue,
      },
      controls: controlStats,
    };
  }

  listAlerts(context: AuthorizationContext, status?: string) {
    return this.analytics.listAlerts(context, status);
  }

  acknowledgeAlert(context: AuthorizationContext, alertId: string) {
    return this.analytics.acknowledgeAlert(context, alertId);
  }

  listExports(context: AuthorizationContext) {
    return this.analytics.listExports(context);
  }

  async createExport(
    context: AuthorizationContext,
    input: { exportType: string; format?: string; parameters?: Record<string, unknown> },
  ) {
    const format = input.format ?? 'json';
    const job = await this.analytics.createExport(context, {
      exportType: input.exportType,
      format: format as never,
      status: 'pending',
      parameters: input.parameters ?? {},
    });
    const orgId = context.organizationId ?? 'unknown';
    const fileKey = `exports/${orgId}/${job.id}.${format}`;
    return this.analytics.completeExport(context, job.id, fileKey);
  }

  async recordCurrentKpiSnapshot(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_MANAGE);
    const executive = await this.getExecutiveDashboard(context);
    const controlStats = await this.analytics.controlEffectiveness(context);
    return this.analytics.upsertKpiSnapshot(context, {
      snapshotMonth: currentMonthKey(),
      complianceScore: executive.complianceScore,
      auditCompletion: executive.widgets.auditCompletion,
      inspectionCompletion: executive.widgets.inspectionCompletion,
      capaCompletion: executive.widgets.capaCompletion,
      trainingCompletion: executive.widgets.trainingCompletion,
      controlEffectiveness: controlStats.effectivenessRate,
      openFindings: executive.widgets.openFindings,
    });
  }

  async syncCalendarAutomation(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_MANAGE);
    const [legal, calendar] = await Promise.all([
      this.repos.legal.list(context),
      this.repos.calendar.list(context),
    ]);
    const existingTitles = new Set(calendar.map((e) => e.title));
    const created: string[] = [];
    for (const entry of legal) {
      if (!entry.reviewDate) continue;
      const title = `Legal review: ${entry.regulation}`;
      if (existingTitles.has(title)) continue;
      await this.repos.calendar.create(context, {
        eventType: 'legal_review',
        title,
        description: entry.legislation ?? null,
        startsAt: entry.reviewDate,
        sourceType: 'legal_register',
        sourceId: entry.id,
      });
      created.push(title);
    }
    return { createdCount: created.length, created };
  }
}

export function createComplianceAnalyticsService(deps: {
  repos: ComplianceRepositories;
  analytics: ComplianceAnalyticsRepository;
  score: ComplianceScoreService;
}) {
  return new ComplianceAnalyticsService(deps.repos, deps.analytics, deps.score);
}
