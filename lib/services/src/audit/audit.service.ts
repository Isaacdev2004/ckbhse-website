import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { AuditRepository } from '@workspace/data/repositories/audit';
import type {
  AuditAssignmentRepository,
  AuditTemplateRepository,
  ChecklistRepository,
  EvidenceRepository,
  FindingRepository,
} from '@workspace/data/repositories/audit-compliance';
import type { DrizzleAuditStore } from '@workspace/data/stores/audit';

export interface AuditRepositories {
  readonly audit: AuditRepository;
  readonly template: AuditTemplateRepository;
  readonly finding: FindingRepository;
  readonly checklist: ChecklistRepository;
  readonly evidence: EvidenceRepository;
  readonly assignment: AuditAssignmentRepository;
}

export interface AuditDashboardData {
  readonly statistics: {
    readonly total: number;
    readonly scheduled: number;
    readonly inProgress: number;
    readonly closed: number;
    readonly cancelled: number;
    readonly overdue: number;
    readonly completed: number;
  };
  readonly kpis: {
    readonly compliancePercent: number;
    readonly auditSuccessRate: number;
    readonly averageAuditScore: number;
    readonly openFindings: number;
    readonly closedFindings: number;
    readonly outstandingCapa: number;
    readonly averageClosureDays: number;
  };
  readonly trends: {
    readonly monthlyCompletion: readonly { readonly month: string; readonly count: number }[];
    readonly findingsByCategory: readonly { readonly category: string; readonly count: number }[];
  };
  readonly upcoming: readonly {
    readonly id: string;
    readonly name: string;
    readonly plannedStart: string | null;
    readonly status: string;
  }[];
}

const WORKFLOW: readonly string[] = [
  'draft',
  'scheduled',
  'assigned',
  'in_progress',
  'review',
  'approved',
  'published',
  'closed',
  'archived',
];

export class AuditService {
  constructor(
    private readonly repos: AuditRepositories,
    private readonly store: DrizzleAuditStore,
  ) {}

  listTypes(context: AuthorizationContext) {
    return this.repos.audit.listTypes(context);
  }

  list(context: AuthorizationContext, status?: string) {
    return this.repos.audit.list(context, status);
  }

  async get(context: AuthorizationContext, auditId: string) {
    const audit = await this.repos.audit.get(context, auditId);
    if (audit === null) {
      throw AppError.notFound('Audit not found');
    }
    const [assignments, findings, evidence, checklist, revisions] =
      await Promise.all([
        this.repos.assignment.list(context, auditId),
        this.repos.finding.list(context, auditId),
        this.repos.evidence.list(context, auditId),
        this.repos.checklist.list(context, auditId),
        this.store.listRevisions(auditId),
      ]);
    return { audit, assignments, findings, evidence, checklist, revisions };
  }

  create(
    context: AuthorizationContext,
    input: {
      name: string;
      auditTypeId?: string;
      templateId?: string;
      site?: string;
      department?: string;
      standard?: string;
      scope?: string;
      objectives?: string;
      criteria?: string;
      leadAuditorId?: string;
      plannedStart?: string;
      plannedEnd?: string;
      priority?: string;
      riskRating?: string;
      frequency?: string;
    },
  ) {
    return this.repos.audit.create(context, {
      name: input.name,
      status: 'draft',
      auditTypeId: input.auditTypeId ?? null,
      templateId: input.templateId ?? null,
      site: input.site ?? null,
      department: input.department ?? null,
      standard: input.standard ?? null,
      scope: input.scope ?? null,
      objectives: input.objectives ?? null,
      criteria: input.criteria ?? null,
      leadAuditorId: input.leadAuditorId ?? null,
      plannedStart: input.plannedStart ? new Date(input.plannedStart) : null,
      plannedEnd: input.plannedEnd ? new Date(input.plannedEnd) : null,
      priority: input.priority ?? 'medium',
      riskRating: input.riskRating ?? null,
      frequency: input.frequency ?? null,
    });
  }

  async update(
    context: AuthorizationContext,
    auditId: string,
    patch: Record<string, unknown>,
  ) {
    const existing = await this.repos.audit.get(context, auditId);
    if (existing === null) {
      throw AppError.notFound('Audit not found');
    }
    if (existing.isImmutable) {
      throw AppError.forbidden('Approved audits are immutable');
    }
    const updatePatch: Record<string, unknown> = {};
    for (const key of [
      'name',
      'site',
      'department',
      'standard',
      'scope',
      'objectives',
      'criteria',
      'priority',
      'riskRating',
      'frequency',
      'leadAuditorId',
      'auditTypeId',
      'templateId',
    ]) {
      if (key in patch) {
        updatePatch[key] = patch[key];
      }
    }
    if (typeof patch.plannedStart === 'string') {
      updatePatch.plannedStart = new Date(patch.plannedStart);
    }
    if (typeof patch.plannedEnd === 'string') {
      updatePatch.plannedEnd = new Date(patch.plannedEnd);
    }
    if (typeof patch.status === 'string') {
      this.assertValidTransition(existing.status, patch.status);
      updatePatch.status = patch.status;
    }
    return this.repos.audit.update(context, auditId, updatePatch);
  }

  async approve(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_APPROVE);
    const existing = await this.repos.audit.get(context, auditId);
    if (existing === null) {
      throw AppError.notFound('Audit not found');
    }
    await this.store.createRevision({
      auditId,
      organizationId: existing.organizationId,
      revisionNumber: existing.version,
      snapshot: existing,
      changedBy: context.userId ?? null,
      changeReason: 'Approved',
    });
    return this.repos.audit.update(context, auditId, {
      status: 'approved',
      isImmutable: true,
      approvedAt: new Date(),
      approvedBy: context.userId ?? null,
    });
  }

  async close(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_CLOSE);
    return this.repos.audit.update(context, auditId, {
      status: 'closed',
      closedAt: new Date(),
    });
  }

  listTemplates(context: AuthorizationContext) {
    return this.repos.template.list(context);
  }

  getTemplateDetail(context: AuthorizationContext, templateId: string) {
    return this.repos.template.getDetail(context, templateId);
  }

  listFindings(context: AuthorizationContext, auditId: string) {
    return this.repos.finding.list(context, auditId);
  }

  createFinding(
    context: AuthorizationContext,
    auditId: string,
    input: {
      title: string;
      description?: string;
      severity?: string;
      category?: string;
      clauseReference?: string;
      dueDate?: string;
    },
  ) {
    return this.repos.finding.create(context, {
      auditId,
      title: input.title,
      description: input.description ?? null,
      severity: (input.severity ?? 'minor') as never,
      category: input.category ?? null,
      clauseReference: input.clauseReference ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });
  }

  listChecklist(context: AuthorizationContext, auditId: string) {
    return this.repos.checklist.list(context, auditId);
  }

  saveChecklistResponse(
    context: AuthorizationContext,
    input: {
      auditId: string;
      templateItemId: string;
      responseValue?: string;
      responseData?: Record<string, unknown>;
      score?: number;
      comment?: string;
    },
  ) {
    return this.repos.checklist.saveResponse(context, {
      auditId: input.auditId,
      templateItemId: input.templateItemId,
      responseValue: input.responseValue ?? null,
      responseData: input.responseData ?? {},
      score: input.score ?? null,
      comment: input.comment ?? null,
    });
  }

  listEvidence(context: AuthorizationContext, auditId: string) {
    return this.repos.evidence.list(context, auditId);
  }

  createEvidence(
    context: AuthorizationContext,
    input: {
      auditId: string;
      findingId?: string;
      storageKey?: string;
      fileName?: string;
      notes?: string;
    },
  ) {
    return this.repos.evidence.create(context, {
      auditId: input.auditId,
      findingId: input.findingId ?? null,
      storageKey: input.storageKey ?? null,
      fileName: input.fileName ?? null,
      notes: input.notes ?? null,
    });
  }

  listAssignments(context: AuthorizationContext, auditId: string) {
    return this.repos.assignment.list(context, auditId);
  }

  assign(
    context: AuthorizationContext,
    input: { auditId: string; userId: string; role: string },
  ) {
    return this.repos.assignment.assign(context, {
      auditId: input.auditId,
      userId: input.userId,
      role: input.role as never,
    });
  }

  async getDashboard(context: AuthorizationContext): Promise<AuditDashboardData> {
    const counts = await this.repos.audit.dashboardCounts(context);
    const upcoming = await this.repos.audit.listUpcoming(context);
    const closedRate =
      counts.total > 0 ? Math.round((counts.closed / counts.total) * 100) : 0;
    return {
      statistics: {
        total: counts.total,
        scheduled: counts.scheduled,
        inProgress: counts.inProgress,
        closed: counts.closed,
        cancelled: counts.cancelled,
        overdue: 0,
        completed: counts.closed,
      },
      kpis: {
        compliancePercent: counts.averageScore,
        auditSuccessRate: closedRate,
        averageAuditScore: counts.averageScore,
        openFindings: counts.openFindings,
        closedFindings: 0,
        outstandingCapa: counts.openFindings,
        averageClosureDays: 0,
      },
      trends: {
        monthlyCompletion: [],
        findingsByCategory: [],
      },
      upcoming: upcoming.map((row) => ({
        id: row.id,
        name: row.name,
        plannedStart: row.plannedStart?.toISOString() ?? null,
        status: row.status,
      })),
    };
  }

  /** Client portal: published/closed audits only. */
  async listForPortal(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    const rows = await this.repos.audit.list(context);
    return rows
      .filter((row) =>
        ['published', 'closed', 'scheduled', 'in_progress', 'review'].includes(
          row.status,
        ),
      )
      .map((row) => ({
        id: row.id,
        title: row.name,
        status: row.status,
        scheduledAt: row.plannedStart?.toISOString() ?? null,
        site: row.site,
        score: row.score,
      }));
  }

  async listReports(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listReports(auditId);
  }

  async listHistory(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listRevisions(auditId);
  }

  private assertValidTransition(current: string, next: string) {
    if (current === next) return;
    const currentIdx = WORKFLOW.indexOf(current);
    const nextIdx = WORKFLOW.indexOf(next);
    if (currentIdx === -1 || nextIdx === -1) {
      throw AppError.badRequest('Invalid audit status');
    }
    if (nextIdx < currentIdx && next !== 'draft') {
      throw AppError.badRequest(
        'Status regression requires reopen permission workflow',
      );
    }
  }
}
