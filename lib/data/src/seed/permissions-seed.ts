import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  type Permission,
} from '@workspace/platform/permissions';

export interface PermissionSeedRow {
  readonly key: Permission;
  readonly name: string;
  readonly description: string | null;
  readonly domain: string;
}

export interface RoleSeedRow {
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
}

export interface RolePermissionSeedRow {
  readonly roleKey: string;
  readonly permissionKey: Permission;
}

function permissionLabel(key: Permission): string {
  const [, resource = '', action = ''] = key.split('.');
  const words = [resource.replace(/-/g, ' '), action.replace(/-/g, ' ')]
    .join(' ')
    .trim();
  return words.length > 0
    ? words.replace(/\b\w/g, (char) => char.toUpperCase())
    : key;
}

function permissionDomain(key: Permission): string {
  const [domain = 'other'] = key.split('.');
  return domain;
}

/** Canonical permission catalogue rows derived from the platform registry. */
export const PERMISSION_SEED: readonly PermissionSeedRow[] = Object.freeze(
  ALL_PERMISSIONS.map((key) => ({
    key,
    name: permissionLabel(key),
    description: null,
    domain: permissionDomain(key),
  })),
);

/** System roles seeded alongside permissions during foundation migration. */
export const ROLE_SEED: readonly RoleSeedRow[] = Object.freeze([
  {
    key: 'super_admin',
    name: 'Platform Administrator',
    description: 'Full platform governance across all tenants',
    isSystem: true,
  },
  {
    key: 'platform_admin',
    name: 'Platform Administrator (scoped)',
    description: 'Platform operator administration without cross-tenant reads',
    isSystem: true,
  },
  {
    key: 'organization_admin',
    name: 'Organization Administrator',
    description: 'Full administration within a single organisation',
    isSystem: true,
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Team and delivery oversight within an organisation',
    isSystem: true,
  },
  {
    key: 'consultant',
    name: 'Consultant',
    description: 'Delivery and fieldwork for assigned clients',
    isSystem: true,
  },
  {
    key: 'operations_manager',
    name: 'Operations Manager',
    description: 'Scheduling, assignments, and operational oversight',
    isSystem: true,
  },
  {
    key: 'trainer',
    name: 'Trainer',
    description: 'Training delivery and course facilitation',
    isSystem: true,
  },
  {
    key: 'auditor',
    name: 'Auditor',
    description: 'Read-heavy consultancy audit access',
    isSystem: true,
  },
  {
    key: 'staff',
    name: 'Staff',
    description: 'General staff portal access',
    isSystem: true,
  },
  {
    key: 'finance',
    name: 'Finance',
    description: 'Finance and invoicing operations',
    isSystem: true,
  },
  {
    key: 'read_only',
    name: 'Read-only',
    description: 'View-only access for reporting and oversight',
    isSystem: true,
  },
  {
    key: 'client_user',
    name: 'Client',
    description: 'Client portal access for a single organisation',
    isSystem: true,
  },
  {
    key: 'learner',
    name: 'Learner',
    description: 'Learning portal enrolment and certificate access',
    isSystem: true,
  },
  {
    key: 'compliance_manager',
    name: 'Compliance Manager',
    description: 'Client compliance workspace administration',
    isSystem: true,
  },
  {
    key: 'training_manager',
    name: 'Training Manager',
    description: 'Client training workspace administration',
    isSystem: true,
  },
  {
    key: 'hr_manager',
    name: 'HR Manager',
    description: 'Client HR and people records access',
    isSystem: true,
  },
  {
    key: 'viewer',
    name: 'Viewer',
    description: 'Read-only client portal access',
    isSystem: true,
  },
  {
    key: 'external_contractor',
    name: 'External Contractor',
    description: 'Limited client portal access for contractors',
    isSystem: true,
  },
  {
    key: 'department_manager',
    name: 'Department Manager',
    description: 'Department-scoped client portal access',
    isSystem: true,
  },
  {
    key: 'site_manager',
    name: 'Site Manager',
    description: 'Site-scoped client portal access',
    isSystem: true,
  },
]);

const CONSULTANT_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.ENQUIRY_READ,
  PERMISSIONS.ENQUIRY_MANAGE,
  PERMISSIONS.LEAD_READ,
  PERMISSIONS.LEAD_MANAGE,
  PERMISSIONS.CLIENT_READ,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.DOCUMENT_READ,
  PERMISSIONS.AUDIT_READ,
  PERMISSIONS.AUDIT_CREATE,
  PERMISSIONS.AUDIT_UPDATE,
  PERMISSIONS.AUDIT_ASSIGN,
  PERMISSIONS.AUDIT_CONDUCT,
  PERMISSIONS.CHECKLIST_MANAGE,
  PERMISSIONS.EVIDENCE_UPLOAD,
  PERMISSIONS.INSPECTION_READ,
  PERMISSIONS.INSPECTION_CREATE,
  PERMISSIONS.INSPECTION_UPDATE,
  PERMISSIONS.INSPECTION_CONDUCT,
  PERMISSIONS.COMPLIANCE_READ,
  PERMISSIONS.CAPA_READ,
  PERMISSIONS.CAPA_CREATE,
  PERMISSIONS.CAPA_UPDATE,
  PERMISSIONS.CAPA_ASSIGN,
  PERMISSIONS.CAPA_VERIFY,
  PERMISSIONS.LEGAL_REGISTER_READ,
  PERMISSIONS.REGULATORY_READ,
  PERMISSIONS.CONTROL_READ,
  PERMISSIONS.RISK_ASSESSMENT_READ,
  PERMISSIONS.RISK_ASSESSMENT_MANAGE,
  PERMISSIONS.INCIDENT_READ,
  PERMISSIONS.INCIDENT_MANAGE,
  PERMISSIONS.CONTENT_READ,
  PERMISSIONS.REPORT_READ,
];

const OPERATIONS_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.ENQUIRY_READ,
  PERMISSIONS.ENQUIRY_MANAGE,
  PERMISSIONS.LEAD_READ,
  PERMISSIONS.LEAD_MANAGE,
  PERMISSIONS.CLIENT_READ,
  PERMISSIONS.CLIENT_MANAGE,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.PROJECT_MANAGE,
  PERMISSIONS.ASSIGNMENT_MANAGE,
  PERMISSIONS.SCHEDULE_MANAGE,
  PERMISSIONS.APPROVAL_ACTION,
  PERMISSIONS.INVOICE_READ_ALL,
];

const CLIENT_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.PORTAL_ACCESS,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.DOCUMENT_READ,
  PERMISSIONS.INVOICE_READ_OWN,
  PERMISSIONS.CERTIFICATE_READ,
  PERMISSIONS.TICKET_MANAGE,
  PERMISSIONS.AUDIT_READ,
  PERMISSIONS.INSPECTION_READ,
  PERMISSIONS.COMPLIANCE_READ,
  PERMISSIONS.CAPA_READ,
  PERMISSIONS.LEGAL_REGISTER_READ,
  PERMISSIONS.INCIDENT_READ,
  PERMISSIONS.RISK_ASSESSMENT_READ,
  PERMISSIONS.COURSE_READ,
  PERMISSIONS.LEARNING_ACCESS,
];

const COMPLIANCE_MANAGER_PERMISSIONS: readonly Permission[] = [
  ...CLIENT_PERMISSIONS,
  PERMISSIONS.INCIDENT_MANAGE,
  PERMISSIONS.RISK_ASSESSMENT_MANAGE,
  PERMISSIONS.CLIENT_USER_MANAGE,
  PERMISSIONS.COMPLIANCE_READ,
  PERMISSIONS.COMPLIANCE_MANAGE,
  PERMISSIONS.LEGAL_REGISTER_READ,
  PERMISSIONS.LEGAL_REGISTER_MANAGE,
  PERMISSIONS.REGULATORY_READ,
  PERMISSIONS.CONTROL_READ,
  PERMISSIONS.INSPECTION_READ,
  PERMISSIONS.CAPA_CREATE,
  PERMISSIONS.CAPA_UPDATE,
  PERMISSIONS.CAPA_VERIFY,
  PERMISSIONS.CAPA_APPROVE,
  PERMISSIONS.CAPA_CLOSE,
  PERMISSIONS.CAPA_ESCALATE,
  PERMISSIONS.CAPA_ASSIGN,
];

const TRAINING_MANAGER_CLIENT_PERMISSIONS: readonly Permission[] = [
  ...CLIENT_PERMISSIONS,
  PERMISSIONS.ENROLMENT_MANAGE,
  PERMISSIONS.CERTIFICATE_ISSUE,
];

const VIEWER_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.PORTAL_ACCESS,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.DOCUMENT_READ,
  PERMISSIONS.CERTIFICATE_READ,
  PERMISSIONS.AUDIT_READ,
  PERMISSIONS.INSPECTION_READ,
  PERMISSIONS.COMPLIANCE_READ,
  PERMISSIONS.CAPA_READ,
  PERMISSIONS.LEGAL_REGISTER_READ,
  PERMISSIONS.INCIDENT_READ,
  PERMISSIONS.RISK_ASSESSMENT_READ,
  PERMISSIONS.COURSE_READ,
];

const LEARNER_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.LEARNING_ACCESS,
  PERMISSIONS.COURSE_READ,
  PERMISSIONS.CERTIFICATE_READ,
];

const READ_ONLY_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.CLIENT_READ,
  PERMISSIONS.ENQUIRY_READ,
  PERMISSIONS.LEAD_READ,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.DOCUMENT_READ,
  PERMISSIONS.AUDIT_READ,
  PERMISSIONS.INSPECTION_READ,
  PERMISSIONS.COMPLIANCE_READ,
  PERMISSIONS.CAPA_READ,
  PERMISSIONS.LEGAL_REGISTER_READ,
  PERMISSIONS.INCIDENT_READ,
  PERMISSIONS.RISK_ASSESSMENT_READ,
  PERMISSIONS.INVOICE_READ_ALL,
  PERMISSIONS.CONTENT_READ,
  PERMISSIONS.REPORT_READ,
  PERMISSIONS.ROLE_READ,
  PERMISSIONS.PERMISSION_READ,
];

const MANAGER_PERMISSIONS: readonly Permission[] = [
  ...CONSULTANT_PERMISSIONS,
  PERMISSIONS.CLIENT_MANAGE,
  PERMISSIONS.PROJECT_MANAGE,
  PERMISSIONS.ASSIGNMENT_MANAGE,
  PERMISSIONS.LEAD_MANAGE,
  PERMISSIONS.USER_READ,
  PERMISSIONS.AUDIT_APPROVE,
  PERMISSIONS.AUDIT_CLOSE,
  PERMISSIONS.AUDIT_TEMPLATE_MANAGE,
  PERMISSIONS.COMPLIANCE_MANAGE,
  PERMISSIONS.LEGAL_REGISTER_MANAGE,
  PERMISSIONS.REGULATORY_MANAGE,
  PERMISSIONS.CONTROL_MANAGE,
  PERMISSIONS.CAPA_APPROVE,
  PERMISSIONS.CAPA_CLOSE,
  PERMISSIONS.CAPA_ESCALATE,
  PERMISSIONS.REPORT_MANAGE,
  PERMISSIONS.REPORT_EXPORT,
  PERMISSIONS.DASHBOARD_PERSONALIZE,
];

const ORG_ADMIN_PERMISSIONS: readonly Permission[] = [
  ...MANAGER_PERMISSIONS,
  PERMISSIONS.USER_MANAGE,
  PERMISSIONS.ROLE_READ,
  PERMISSIONS.ROLE_MANAGE,
  PERMISSIONS.PERMISSION_READ,
  PERMISSIONS.CLIENT_USER_MANAGE,
  PERMISSIONS.ADMIN_ACCESS,
];

const TRAINER_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.COURSE_READ,
  PERMISSIONS.COURSE_AUTHOR,
  PERMISSIONS.ASSESSMENT_MARK,
  PERMISSIONS.CERTIFICATE_READ,
  PERMISSIONS.CERTIFICATE_ISSUE,
  PERMISSIONS.ENROLMENT_MANAGE,
  PERMISSIONS.LEARNING_ACCESS,
];

const AUDITOR_PERMISSIONS: readonly Permission[] = [
  ...READ_ONLY_PERMISSIONS,
  PERMISSIONS.AUDIT_CONDUCT,
  PERMISSIONS.AUDIT_READ,
  PERMISSIONS.AUDIT_CREATE,
  PERMISSIONS.AUDIT_UPDATE,
  PERMISSIONS.AUDIT_ASSIGN,
  PERMISSIONS.CHECKLIST_MANAGE,
  PERMISSIONS.EVIDENCE_UPLOAD,
  PERMISSIONS.AUDIT_APPROVE,
  PERMISSIONS.AUDIT_CLOSE,
  PERMISSIONS.AUDIT_EXPORT,
  PERMISSIONS.INSPECTION_READ,
  PERMISSIONS.INSPECTION_CREATE,
  PERMISSIONS.INSPECTION_UPDATE,
  PERMISSIONS.COMPLIANCE_READ,
  PERMISSIONS.CAPA_READ,
  PERMISSIONS.CAPA_CREATE,
  PERMISSIONS.CAPA_UPDATE,
  PERMISSIONS.CAPA_VERIFY,
  PERMISSIONS.LEGAL_REGISTER_READ,
  PERMISSIONS.CONTROL_READ,
];

const STAFF_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.CLIENT_READ,
  PERMISSIONS.ENQUIRY_READ,
  PERMISSIONS.LEAD_READ,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.DOCUMENT_READ,
  PERMISSIONS.CONTENT_READ,
];

const FINANCE_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.INVOICE_READ_ALL,
  PERMISSIONS.INVOICE_MANAGE,
  PERMISSIONS.PAYMENT_MANAGE,
  PERMISSIONS.CLIENT_READ,
  PERMISSIONS.PROJECT_READ,
];

const PLATFORM_ADMIN_PERMISSIONS: readonly Permission[] = ALL_PERMISSIONS.filter(
  (permission) => permission !== PERMISSIONS.TENANT_VIEW_ALL,
);

function rolePermissionRows(
  roleKey: string,
  permissions: readonly Permission[],
): readonly RolePermissionSeedRow[] {
  return permissions.map((permissionKey) => ({ roleKey, permissionKey }));
}

/** Role-to-permission bundles composed from the permission catalogue. */
export const ROLE_PERMISSION_SEED: readonly RolePermissionSeedRow[] =
  Object.freeze([
    ...rolePermissionRows('super_admin', ALL_PERMISSIONS),
    ...rolePermissionRows('platform_admin', PLATFORM_ADMIN_PERMISSIONS),
    ...rolePermissionRows('organization_admin', ORG_ADMIN_PERMISSIONS),
    ...rolePermissionRows('manager', MANAGER_PERMISSIONS),
    ...rolePermissionRows('consultant', CONSULTANT_PERMISSIONS),
    ...rolePermissionRows('operations_manager', OPERATIONS_PERMISSIONS),
    ...rolePermissionRows('trainer', TRAINER_PERMISSIONS),
    ...rolePermissionRows('auditor', AUDITOR_PERMISSIONS),
    ...rolePermissionRows('staff', STAFF_PERMISSIONS),
    ...rolePermissionRows('finance', FINANCE_PERMISSIONS),
    ...rolePermissionRows('read_only', READ_ONLY_PERMISSIONS),
    ...rolePermissionRows('client_user', CLIENT_PERMISSIONS),
    ...rolePermissionRows('learner', LEARNER_PERMISSIONS),
    ...rolePermissionRows('compliance_manager', COMPLIANCE_MANAGER_PERMISSIONS),
    ...rolePermissionRows('training_manager', TRAINING_MANAGER_CLIENT_PERMISSIONS),
    ...rolePermissionRows('hr_manager', [
      ...CLIENT_PERMISSIONS,
      PERMISSIONS.HR_RECORD_READ,
      PERMISSIONS.USER_READ,
    ]),
    ...rolePermissionRows('viewer', VIEWER_PERMISSIONS),
    ...rolePermissionRows('external_contractor', [
      PERMISSIONS.PORTAL_ACCESS,
      PERMISSIONS.PROJECT_READ,
      PERMISSIONS.DOCUMENT_READ,
    ]),
    ...rolePermissionRows('department_manager', CLIENT_PERMISSIONS),
    ...rolePermissionRows('site_manager', CLIENT_PERMISSIONS),
  ]);
