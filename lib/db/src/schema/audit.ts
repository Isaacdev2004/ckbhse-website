import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { organizations, users } from './foundation.js';

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
};

const versionColumn = { version: integer('version').notNull().default(1) };

export const complianceAuditStatusEnum = pgEnum('compliance_audit_status', [
  'draft', 'scheduled', 'assigned', 'in_progress', 'review', 'approved',
  'published', 'closed', 'archived', 'cancelled',
]);

export const auditAssignmentRoleEnum = pgEnum('audit_assignment_role', [
  'lead_auditor', 'co_auditor', 'observer', 'technical_expert',
  'client_representative', 'site_contact',
]);

export const checklistItemTypeEnum = pgEnum('checklist_item_type', [
  'pass_fail', 'yes_no', 'compliant_non_compliant', 'numeric', 'percentage',
  'rating', 'free_text', 'multiple_choice', 'single_choice', 'photo_upload',
  'document_upload', 'signature', 'gps_location', 'date', 'time',
]);

export const findingSeverityEnum = pgEnum('finding_severity', [
  'observation', 'minor', 'major', 'critical',
]);

export const findingStatusEnum = pgEnum('finding_status', [
  'open', 'in_progress', 'closed', 'verified',
]);

export const scoringModelEnum = pgEnum('scoring_model', [
  'percentage', 'weighted', 'pass_fail', 'risk_weighted', 'compliance_index',
]);

export const auditTypes = pgTable('audit_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  ...timestampColumns,
});

export const auditTemplates = pgTable(
  'audit_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    auditTypeId: uuid('audit_type_id').references(() => auditTypes.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    description: text('description'),
    version: integer('version').notNull().default(1),
    scoringModel: scoringModelEnum('scoring_model').notNull().default('percentage'),
    isActive: boolean('is_active').notNull().default(true),
    ...timestampColumns,
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (t) => [index('audit_templates_org_idx').on(t.organizationId)],
);

export const auditTemplateSections = pgTable('audit_template_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => auditTemplates.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestampColumns,
});

export const auditTemplateItems = pgTable('audit_template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sectionId: uuid('section_id').notNull().references(() => auditTemplateSections.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').notNull().references(() => auditTemplates.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  itemType: checklistItemTypeEnum('item_type').notNull(),
  prompt: text('prompt').notNull(),
  guidance: text('guidance'),
  reference: text('reference'),
  options: jsonb('options').notNull().default([]),
  isRequired: boolean('is_required').notNull().default(true),
  requiresEvidence: boolean('requires_evidence').notNull().default(false),
  requiresComment: boolean('requires_comment').notNull().default(false),
  weight: integer('weight').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  conditionalLogic: jsonb('conditional_logic'),
  ...timestampColumns,
});

export const complianceAudits = pgTable(
  'compliance_audits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    auditTypeId: uuid('audit_type_id').references(() => auditTypes.id, { onDelete: 'set null' }),
    templateId: uuid('template_id').references(() => auditTemplates.id, { onDelete: 'set null' }),
    templateVersion: integer('template_version'),
    name: text('name').notNull(),
    site: text('site'),
    department: text('department'),
    standard: text('standard'),
    scope: text('scope'),
    objectives: text('objectives'),
    criteria: text('criteria'),
    leadAuditorId: uuid('lead_auditor_id').references(() => users.id, { onDelete: 'set null' }),
    plannedStart: timestamp('planned_start', { withTimezone: true, mode: 'date' }),
    plannedEnd: timestamp('planned_end', { withTimezone: true, mode: 'date' }),
    actualStart: timestamp('actual_start', { withTimezone: true, mode: 'date' }),
    actualEnd: timestamp('actual_end', { withTimezone: true, mode: 'date' }),
    durationHours: integer('duration_hours'),
    frequency: text('frequency'),
    recurrenceRule: jsonb('recurrence_rule'),
    riskRating: text('risk_rating'),
    priority: text('priority').notNull().default('medium'),
    status: complianceAuditStatusEnum('status').notNull().default('draft'),
    score: integer('score'),
    scoringModel: scoringModelEnum('scoring_model').notNull().default('percentage'),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
    approvedBy: uuid('approved_by'),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
    isImmutable: boolean('is_immutable').notNull().default(false),
    ...timestampColumns,
    ...versionColumn,
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (t) => [
    index('compliance_audits_org_idx').on(t.organizationId),
    index('compliance_audits_status_idx').on(t.status),
    index('compliance_audits_planned_start_idx').on(t.plannedStart),
  ],
);

export const auditAssignments = pgTable('audit_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id').notNull().references(() => complianceAudits.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: auditAssignmentRoleEnum('role').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  ...timestampColumns,
});

export const auditChecklistResponses = pgTable('audit_checklist_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id').notNull().references(() => complianceAudits.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  templateItemId: uuid('template_item_id').notNull(),
  responseValue: text('response_value'),
  responseData: jsonb('response_data').notNull().default({}),
  score: integer('score'),
  comment: text('comment'),
  respondedBy: uuid('responded_by'),
  respondedAt: timestamp('responded_at', { withTimezone: true, mode: 'date' }),
  ...timestampColumns,
});

export const auditFindings = pgTable(
  'audit_findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    auditId: uuid('audit_id').notNull().references(() => complianceAudits.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    severity: findingSeverityEnum('severity').notNull().default('minor'),
    status: findingStatusEnum('status').notNull().default('open'),
    category: text('category'),
    clauseReference: text('clause_reference'),
    department: text('department'),
    site: text('site'),
    raisedBy: uuid('raised_by'),
    assignedTo: uuid('assigned_to'),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [index('audit_findings_audit_idx').on(t.auditId)],
);

export const auditEvidence = pgTable('audit_evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id').notNull().references(() => complianceAudits.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  findingId: uuid('finding_id'),
  checklistResponseId: uuid('checklist_response_id'),
  storageKey: text('storage_key'),
  mimeType: text('mime_type'),
  fileName: text('file_name'),
  notes: text('notes'),
  gpsCoordinates: jsonb('gps_coordinates'),
  capturedBy: uuid('captured_by'),
  capturedAt: timestamp('captured_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  ...timestampColumns,
});

export const auditReports = pgTable('audit_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id').notNull().references(() => complianceAudits.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  reportType: text('report_type').notNull(),
  title: text('title').notNull(),
  summary: jsonb('summary').notNull().default({}),
  storageKey: text('storage_key'),
  generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  generatedBy: uuid('generated_by'),
  ...timestampColumns,
});

export const auditRevisions = pgTable('audit_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id').notNull().references(() => complianceAudits.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  changedBy: uuid('changed_by'),
  changeReason: text('change_reason'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});
