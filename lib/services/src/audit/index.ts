import type { AuditRepository } from '@workspace/data/repositories/audit';
import type { AuditTemplateRepository } from '@workspace/data/repositories/audit-compliance';
import type { DrizzleAuditStore } from '@workspace/data/stores/audit';
import { AuditService, type AuditRepositories } from './audit.service.js';
import { AuditCalendarService } from './audit-calendar.service.js';
import { AuditReportService } from './audit-report.service.js';

export interface AuditServices {
  readonly audit: AuditService;
  readonly calendar: AuditCalendarService;
  readonly reports: AuditReportService;
}

export function createAuditServices(deps: {
  repos: AuditRepositories;
  store: DrizzleAuditStore;
  auditRepo: AuditRepository;
  templateRepo: AuditTemplateRepository;
}): AuditServices {
  return {
    audit: new AuditService(deps.repos, deps.store),
    calendar: new AuditCalendarService(deps.auditRepo),
    reports: new AuditReportService(deps.store, deps.auditRepo),
  };
}

export { AuditService } from './audit.service.js';
export { AuditCalendarService } from './audit-calendar.service.js';
export { AuditReportService } from './audit-report.service.js';
export type { AuditRepositories, AuditDashboardData } from './audit.service.js';
