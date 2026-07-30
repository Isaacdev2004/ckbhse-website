/**
 * The central permission catalogue.
 *
 * Document 03.5 section 10.1 forbids branching on role names: every access
 * decision resolves a permission, and roles exist only as bundles of
 * permissions composed at runtime. This module is the single source of truth for
 * which permissions exist, so a typo becomes a compile error instead of a
 * silent denial — or worse, a silent grant.
 *
 * Naming convention: `<domain>.<resource>.<action>`, all lower case, with
 * `<domain>.access` reserved for "may reach this ecosystem at all". The
 * permission set is derived from the approved matrix in Document 04 section 15.1.
 *
 * This catalogue is deliberately code rather than data. It is versioned,
 * reviewable in a pull request and diffable; the database rows that mirror it
 * are seeded from here by migration when the identity schema lands, never
 * authored at runtime.
 */

export const PERMISSIONS = {
  // --- Ecosystem access ----------------------------------------------------
  PORTAL_ACCESS: 'portal.access',
  STAFF_ACCESS: 'staff.access',
  ADMIN_ACCESS: 'admin.access',
  LEARNING_ACCESS: 'learning.enrolment.access',

  // --- Identity and access -------------------------------------------------
  USER_READ: 'identity.user.read',
  USER_MANAGE: 'identity.user.manage',
  ROLE_READ: 'identity.role.read',
  ROLE_MANAGE: 'identity.role.manage',
  PERMISSION_READ: 'identity.permission.read',
  /** Delegated administration: a client admin managing their own colleagues. */
  CLIENT_USER_MANAGE: 'client.user.manage',

  // --- CRM and clients -----------------------------------------------------
  CLIENT_READ: 'crm.client.view',
  CLIENT_MANAGE: 'crm.client.manage',
  ENQUIRY_READ: 'crm.enquiry.view',
  ENQUIRY_MANAGE: 'crm.enquiry.manage',
  LEAD_READ: 'crm.lead.view',
  LEAD_MANAGE: 'crm.lead.manage',

  // --- Project delivery ----------------------------------------------------
  PROJECT_READ: 'delivery.project.read',
  PROJECT_MANAGE: 'delivery.project.manage',
  DOCUMENT_READ: 'delivery.document.read',
  DOCUMENT_MANAGE: 'delivery.document.manage',

  // --- Consultancy ---------------------------------------------------------
  AUDIT_READ: 'consultancy.audit.read',
  AUDIT_CREATE: 'consultancy.audit.create',
  AUDIT_UPDATE: 'consultancy.audit.update',
  AUDIT_DELETE: 'consultancy.audit.delete',
  AUDIT_ASSIGN: 'consultancy.audit.assign',
  AUDIT_APPROVE: 'consultancy.audit.approve',
  AUDIT_CLOSE: 'consultancy.audit.close',
  AUDIT_EXPORT: 'consultancy.audit.export',
  AUDIT_TEMPLATE_MANAGE: 'consultancy.audit-template.manage',
  CHECKLIST_MANAGE: 'consultancy.checklist.manage',
  EVIDENCE_UPLOAD: 'consultancy.evidence.upload',
  AUDIT_CONDUCT: 'consultancy.audit.conduct',
  /** Issuance is separate from drafting: an issued report is immutable. */
  AUDIT_ISSUE: 'consultancy.audit.issue',
  INSPECTION_CONDUCT: 'consultancy.inspection.conduct',
  INSPECTION_READ: 'consultancy.inspection.read',
  INSPECTION_CREATE: 'consultancy.inspection.create',
  INSPECTION_UPDATE: 'consultancy.inspection.update',
  COMPLIANCE_READ: 'consultancy.compliance.read',
  COMPLIANCE_MANAGE: 'consultancy.compliance.manage',
  LEGAL_REGISTER_READ: 'consultancy.legal-register.read',
  LEGAL_REGISTER_MANAGE: 'consultancy.legal-register.manage',
  REGULATORY_READ: 'consultancy.regulatory.read',
  REGULATORY_MANAGE: 'consultancy.regulatory.manage',
  CONTROL_READ: 'consultancy.control.read',
  CONTROL_MANAGE: 'consultancy.control.manage',
  CAPA_READ: 'consultancy.capa.read',
  CAPA_CREATE: 'consultancy.capa.create',
  CAPA_UPDATE: 'consultancy.capa.update',
  CAPA_ASSIGN: 'consultancy.capa.assign',
  CAPA_APPROVE: 'consultancy.capa.approve',
  CAPA_VERIFY: 'consultancy.capa.verify',
  CAPA_CLOSE: 'consultancy.capa.close',
  CAPA_ESCALATE: 'consultancy.capa.escalate',
  RISK_ASSESSMENT_READ: 'consultancy.risk-assessment.read',
  RISK_ASSESSMENT_MANAGE: 'consultancy.risk-assessment.manage',
  INCIDENT_READ: 'consultancy.incident.read',
  INCIDENT_MANAGE: 'consultancy.incident.manage',

  // --- Training ------------------------------------------------------------
  COURSE_READ: 'training.course.read',
  COURSE_AUTHOR: 'training.course.author',
  ASSESSMENT_MARK: 'training.assessment.mark',
  CERTIFICATE_READ: 'training.certificate.read',
  CERTIFICATE_ISSUE: 'training.certificate.issue',
  ENROLMENT_MANAGE: 'training.enrolment.manage',

  // --- Operations ----------------------------------------------------------
  ASSIGNMENT_MANAGE: 'operations.assignment.manage',
  SCHEDULE_MANAGE: 'operations.schedule.manage',
  APPROVAL_ACTION: 'operations.approval.action',

  // --- Finance -------------------------------------------------------------
  INVOICE_READ_OWN: 'finance.invoice.view.own',
  INVOICE_READ_ALL: 'finance.invoice.view.all',
  INVOICE_MANAGE: 'finance.invoice.manage',
  PAYMENT_MANAGE: 'finance.payment.manage',

  // --- People --------------------------------------------------------------
  HR_RECORD_READ: 'hr.record.view',
  HR_RECORD_MANAGE: 'hr.record.manage',
  RECRUITMENT_MANAGE: 'hr.recruitment.manage',

  // --- Content and marketing ----------------------------------------------
  CONTENT_READ: 'cms.content.read',
  CONTENT_MANAGE: 'cms.content.manage',
  CONTENT_PUBLISH: 'marketing.content.publish',
  MEDIA_MANAGE: 'cms.media.manage',

  // --- Support -------------------------------------------------------------
  TICKET_MANAGE: 'support.ticket.manage',

  // --- Platform governance -------------------------------------------------
  /** Reading across tenant boundaries. The audited exception, not the rule. */
  TENANT_VIEW_ALL: 'platform.tenant.view',
  AUDIT_LOG_READ: 'platform.audit.read',
  SECURITY_MANAGE: 'platform.security.manage',
  INTEGRATION_MANAGE: 'platform.integration.manage',
  FEATURE_FLAG_MANAGE: 'platform.feature-flag.manage',
  SYSTEM_READ: 'platform.system.read',

  // --- Reporting & analytics -----------------------------------------------
  REPORT_READ: 'reporting.report.read',
  REPORT_MANAGE: 'reporting.report.manage',
  REPORT_EXPORT: 'reporting.report.export',
  DASHBOARD_PERSONALIZE: 'reporting.dashboard.personalize',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/** A permission string drawn from the catalogue. Never a free-form string. */
export type Permission = (typeof PERMISSIONS)[PermissionKey];

export const ALL_PERMISSIONS: readonly Permission[] = Object.freeze(
  Object.values(PERMISSIONS),
);

const PERMISSION_SET: ReadonlySet<string> = new Set<string>(ALL_PERMISSIONS);

export function isPermission(value: string): value is Permission {
  return PERMISSION_SET.has(value);
}

/**
 * Parse an untrusted list (a database row, a seed file, a token claim) into
 * catalogue permissions, reporting anything unrecognised rather than silently
 * dropping it. A permission that no longer exists usually means a migration was
 * missed, and failing loudly is the only way that gets noticed.
 */
export function parsePermissions(values: readonly string[]): {
  permissions: Permission[];
  unknown: string[];
} {
  const permissions: Permission[] = [];
  const unknown: string[] = [];

  for (const value of values) {
    if (isPermission(value)) {
      permissions.push(value);
    } else {
      unknown.push(value);
    }
  }

  return { permissions, unknown };
}

/**
 * Permissions grouped by the domain prefix, for building administration screens
 * without hardcoding the grouping in the interface.
 */
export function permissionsByDomain(): ReadonlyMap<string, Permission[]> {
  const grouped = new Map<string, Permission[]>();

  for (const permission of ALL_PERMISSIONS) {
    const [domain = 'other'] = permission.split('.');
    const existing = grouped.get(domain);
    if (existing) {
      existing.push(permission);
    } else {
      grouped.set(domain, [permission]);
    }
  }

  return grouped;
}
