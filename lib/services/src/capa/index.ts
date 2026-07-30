import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { CapaRepository } from '@workspace/data/repositories/capa';
import type { DrizzleCapaStore } from '@workspace/data/stores/capa';

const WORKFLOW: readonly string[] = [
  'draft', 'open', 'in_progress', 'pending_verification', 'pending_approval', 'approved', 'closed',
];

export interface CapaDashboardData {
  readonly statistics: {
    readonly total: number;
    readonly open: number;
    readonly inProgress: number;
    readonly pendingVerification: number;
    readonly pendingApproval: number;
    readonly closed: number;
    readonly overdue: number;
    readonly corrective: number;
    readonly preventive: number;
  };
  readonly kpis: {
    readonly closureRate: number;
    readonly overdueRate: number;
    readonly verificationPending: number;
  };
}

export class CapaService {
  constructor(private readonly capa: CapaRepository) {}

  list(context: AuthorizationContext, status?: string) {
    return this.capa.list(context, status);
  }

  async get(context: AuthorizationContext, capaId: string) {
    const record = await this.capa.get(context, capaId);
    if (record === null) {
      throw AppError.notFound('CAPA record not found');
    }
    const [rca, verifications, approvals, escalations, notifications] = await Promise.all([
      this.capa.getRca(context, capaId),
      this.capa.listVerifications(context, capaId),
      this.capa.listApprovals(context, capaId),
      this.capa.listEscalations(context, capaId),
      this.capa.listNotifications(context, capaId),
    ]);
    return { record, rca, verifications, approvals, escalations, notifications };
  }

  async create(
    context: AuthorizationContext,
    input: {
      title: string;
      description?: string;
      capaType: string;
      priority?: string;
      dueDate?: string;
      site?: string;
      department?: string;
      auditFindingId?: string;
      inspectionFindingId?: string;
      incidentId?: string;
      sourceType?: string;
    },
  ) {
    const record = await this.capa.create(context, {
      title: input.title,
      description: input.description ?? null,
      capaType: input.capaType as never,
      status: 'open',
      priority: (input.priority ?? 'medium') as never,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      site: input.site ?? null,
      department: input.department ?? null,
      auditFindingId: input.auditFindingId ?? null,
      inspectionFindingId: input.inspectionFindingId ?? null,
      incidentId: input.incidentId ?? null,
      sourceType: input.sourceType ?? null,
      assignedTo: context.userId ?? null,
    });
    await this.capa.createNotification(context, {
      capaId: record.id,
      notificationType: 'capa_created',
      recipientId: context.userId ?? null,
      subject: `CAPA ${record.capaNumber} created`,
      body: input.title,
    });
    return record;
  }

  async update(context: AuthorizationContext, capaId: string, patch: Record<string, unknown>) {
    const existing = await this.capa.get(context, capaId);
    if (existing === null) {
      throw AppError.notFound('CAPA record not found');
    }
    const updatePatch: Record<string, unknown> = {};
    for (const key of ['title', 'description', 'priority', 'site', 'department', 'assignedTo']) {
      if (key in patch) updatePatch[key] = patch[key];
    }
    if (typeof patch.dueDate === 'string') {
      updatePatch.dueDate = new Date(patch.dueDate);
    }
    if (typeof patch.status === 'string') {
      this.assertTransition(existing.status, patch.status);
      updatePatch.status = patch.status;
    }
    return this.capa.update(context, capaId, updatePatch);
  }

  async submitForVerification(context: AuthorizationContext, capaId: string) {
    return this.capa.update(context, capaId, { status: 'pending_verification' });
  }

  async verify(
    context: AuthorizationContext,
    capaId: string,
    input: { result: string; notes?: string },
  ) {
    requirePermission(context, PERMISSIONS.CAPA_VERIFY);
    const verification = await this.capa.createVerification(context, {
      capaId,
      result: input.result as never,
      notes: input.notes ?? null,
    });
    const nextStatus = input.result === 'effective' ? 'pending_approval' : 'in_progress';
    await this.capa.update(context, capaId, { status: nextStatus });
    await this.capa.createNotification(context, {
      capaId,
      notificationType: 'capa_verified',
      recipientId: null,
      subject: `CAPA verification: ${input.result}`,
      body: input.notes ?? null,
    });
    return verification;
  }

  async approve(context: AuthorizationContext, capaId: string, comments?: string) {
    requirePermission(context, PERMISSIONS.CAPA_APPROVE);
    const approval = await this.capa.createApproval(context, {
      capaId,
      approvalLevel: 1,
      comments: comments ?? null,
    });
    await this.capa.update(context, capaId, {
      status: 'approved',
      completedAt: new Date(),
    });
    return approval;
  }

  async close(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_CLOSE);
    return this.capa.update(context, capaId, {
      status: 'closed',
      closedAt: new Date(),
    });
  }

  async escalate(
    context: AuthorizationContext,
    capaId: string,
    input: { reason: string; escalatedTo?: string },
  ) {
    requirePermission(context, PERMISSIONS.CAPA_ESCALATE);
    const escalation = await this.capa.createEscalation(context, {
      capaId,
      reason: input.reason,
      escalatedTo: input.escalatedTo ?? null,
      escalationLevel: 1,
    });
    await this.capa.update(context, capaId, { status: 'overdue' });
    await this.capa.createNotification(context, {
      capaId,
      notificationType: 'capa_escalated',
      recipientId: input.escalatedTo ?? null,
      subject: 'CAPA escalated',
      body: input.reason,
    });
    return escalation;
  }

  saveRca(
    context: AuthorizationContext,
    capaId: string,
    input: {
      method?: string;
      summary?: string;
      rootCauses?: string[];
      contributingFactors?: string[];
      analysisData?: Record<string, unknown>;
    },
  ) {
    return this.capa.upsertRca(context, {
      capaId,
      method: (input.method ?? 'five_whys') as never,
      summary: input.summary ?? null,
      rootCauses: input.rootCauses ?? [],
      contributingFactors: input.contributingFactors ?? [],
      analysisData: input.analysisData ?? {},
    });
  }

  async getDashboard(context: AuthorizationContext): Promise<CapaDashboardData> {
    const counts = await this.capa.dashboardCounts(context);
    const closureRate =
      counts.total > 0 ? Math.round((counts.closed / counts.total) * 100) : 0;
    const overdueRate =
      counts.total > 0 ? Math.round((counts.overdue / counts.total) * 100) : 0;
    return {
      statistics: counts,
      kpis: {
        closureRate,
        overdueRate,
        verificationPending: counts.pendingVerification,
      },
    };
  }

  listForPortal(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.capa.list(context).then((rows) =>
      rows
        .filter((row) => row.status !== 'draft')
        .map((row) => ({
          id: row.id,
          capaNumber: row.capaNumber,
          title: row.title,
          status: row.status,
          capaType: row.capaType,
          priority: row.priority,
          dueDate: row.dueDate?.toISOString() ?? null,
        })),
    );
  }

  private assertTransition(current: string, next: string) {
    if (current === next) return;
    const currentIdx = WORKFLOW.indexOf(current);
    const nextIdx = WORKFLOW.indexOf(next);
    if (currentIdx === -1 || nextIdx === -1) {
      throw AppError.badRequest('Invalid CAPA status');
    }
    if (nextIdx < currentIdx && next !== 'draft' && next !== 'open') {
      throw AppError.badRequest('Invalid CAPA status regression');
    }
  }
}

export function createCapaServices(deps: {
  capa: CapaRepository;
  store: DrizzleCapaStore;
}) {
  return {
    capa: new CapaService(deps.capa),
  };
}

export type CapaServices = ReturnType<typeof createCapaServices>;
