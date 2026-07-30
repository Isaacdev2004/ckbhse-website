import type { AuditRepository } from '@workspace/data/repositories/audit';
import type { DrizzleAuditStore } from '@workspace/data/stores/audit';
import type { AuthorizationContext } from '@workspace/platform/authorization';

/** PDF report generation architecture placeholder. */
export class AuditReportService {
  constructor(
    private readonly store: DrizzleAuditStore,
    private readonly audit: AuditRepository,
  ) {}

  async generate(
    context: AuthorizationContext,
    auditId: string,
    reportType: string,
  ) {
    const audit = await this.audit.get(context, auditId);
    if (audit === null) {
      return null;
    }
    const findings = await this.store.listFindings(auditId);
    return this.store.createReport({
      auditId,
      organizationId: audit.organizationId,
      reportType,
      title: `${audit.name} — ${reportType}`,
      summary: {
        auditId,
        findingCount: findings.length,
        score: audit.score,
        pdfGenerationPlaceholder: true,
      },
      generatedBy: context.userId ?? null,
    });
  }
}
