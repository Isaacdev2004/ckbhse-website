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
import { findingSeverityEnum, findingStatusEnum } from './audit.js';

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
};

export const inspectionStatusEnum = pgEnum('inspection_status', [
  'draft', 'scheduled', 'in_progress', 'completed', 'failed', 'passed', 'cancelled', 'overdue',
]);

export const inspectionFrequencyEnum = pgEnum('inspection_frequency', [
  'unscheduled', 'reactive', 'preventive', 'daily', 'weekly', 'monthly', 'annual', 'follow_up', 'spot',
]);

export const legalObligationStatusEnum = pgEnum('legal_obligation_status', [
  'active', 'pending_review', 'superseded', 'archived',
]);

export const regulatoryCategoryEnum = pgEnum('regulatory_category', [
  'hse', 'iso', 'environmental', 'fire_safety', 'construction', 'manufacturing', 'healthcare', 'education', 'public_sector',
]);

export const controlTypeEnum = pgEnum('control_type', [
  'preventive', 'detective', 'corrective', 'administrative', 'engineering', 'operational',
]);

export const controlStatusEnum = pgEnum('control_status', [
  'active', 'inactive', 'under_review', 'ineffective',
]);

export const complianceCalendarEventTypeEnum = pgEnum('compliance_calendar_event_type', [
  'audit', 'inspection', 'certification_renewal', 'training_expiry', 'legal_review',
  'policy_review', 'risk_review', 'equipment_inspection', 'permit_renewal',
]);

export const inspectionTypes = pgTable('inspection_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  ...timestampColumns,
});

export const inspections = pgTable(
  'inspections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    inspectionTypeId: uuid('inspection_type_id').references(() => inspectionTypes.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    site: text('site'),
    department: text('department'),
    inspectorId: uuid('inspector_id').references(() => users.id, { onDelete: 'set null' }),
    frequency: inspectionFrequencyEnum('frequency').notNull().default('unscheduled'),
    status: inspectionStatusEnum('status').notNull().default('draft'),
    score: integer('score'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    notes: text('notes'),
    ...timestampColumns,
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (t) => [
    index('inspections_org_idx').on(t.organizationId),
    index('inspections_status_idx').on(t.status),
    index('inspections_scheduled_at_idx').on(t.scheduledAt),
  ],
);

export const inspectionFindings = pgTable('inspection_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  severity: findingSeverityEnum('severity').notNull().default('minor'),
  status: findingStatusEnum('status').notNull().default('open'),
  category: text('category'),
  dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
  ...timestampColumns,
});

export const inspectionEvidence = pgTable('inspection_evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  findingId: uuid('finding_id'),
  storageKey: text('storage_key'),
  fileName: text('file_name'),
  notes: text('notes'),
  capturedBy: uuid('captured_by'),
  capturedAt: timestamp('captured_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  createdAt: timestampColumns.createdAt,
});

export const inspectionChecklistResponses = pgTable('inspection_checklist_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  itemKey: text('item_key').notNull(),
  prompt: text('prompt').notNull(),
  responseValue: text('response_value'),
  responseData: jsonb('response_data').notNull().default({}),
  score: integer('score'),
  comment: text('comment'),
  respondedBy: uuid('responded_by'),
  respondedAt: timestamp('responded_at', { withTimezone: true, mode: 'date' }),
  ...timestampColumns,
});

export const legalRegisterEntries = pgTable(
  'legal_register_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    regulation: text('regulation').notNull(),
    legislation: text('legislation'),
    jurisdiction: text('jurisdiction'),
    category: text('category'),
    authority: text('authority'),
    effectiveDate: timestamp('effective_date', { withTimezone: true, mode: 'date' }),
    reviewDate: timestamp('review_date', { withTimezone: true, mode: 'date' }),
    status: legalObligationStatusEnum('status').notNull().default('active'),
    responsiblePersonId: uuid('responsible_person_id'),
    applicableSites: jsonb('applicable_sites').notNull().default([]),
    relatedRisks: jsonb('related_risks').notNull().default([]),
    relatedControls: jsonb('related_controls').notNull().default([]),
    relatedAudits: jsonb('related_audits').notNull().default([]),
    evidence: jsonb('evidence').notNull().default([]),
    notes: text('notes'),
    ...timestampColumns,
  },
  (t) => [index('legal_register_org_idx').on(t.organizationId)],
);

export const regulatoryRegisterEntries = pgTable(
  'regulatory_register_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: regulatoryCategoryEnum('category').notNull(),
    version: text('version'),
    effectiveDate: timestamp('effective_date', { withTimezone: true, mode: 'date' }),
    supersededDate: timestamp('superseded_date', { withTimezone: true, mode: 'date' }),
    changeLog: jsonb('change_log').notNull().default([]),
    complianceStatus: text('compliance_status').notNull().default('compliant'),
    description: text('description'),
    ...timestampColumns,
  },
  (t) => [index('regulatory_register_org_idx').on(t.organizationId)],
);

export const isoFrameworks = pgTable('iso_frameworks', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  name: text('name').notNull(),
  version: text('version'),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  ...timestampColumns,
});

export const isoClauses = pgTable('iso_clauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  frameworkId: uuid('framework_id').notNull().references(() => isoFrameworks.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  clauseNumber: text('clause_number').notNull(),
  title: text('title').notNull(),
  requirement: text('requirement'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestampColumns,
});

export const complianceControls = pgTable(
  'compliance_controls',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    controlType: controlTypeEnum('control_type').notNull(),
    status: controlStatusEnum('status').notNull().default('active'),
    ownerId: uuid('owner_id'),
    frequency: text('frequency'),
    effectiveness: text('effectiveness'),
    lastTestedAt: timestamp('last_tested_at', { withTimezone: true, mode: 'date' }),
    relatedRisks: jsonb('related_risks').notNull().default([]),
    relatedAudits: jsonb('related_audits').notNull().default([]),
    evidence: jsonb('evidence').notNull().default([]),
    documents: jsonb('documents').notNull().default([]),
    ...timestampColumns,
  },
  (t) => [index('compliance_controls_org_idx').on(t.organizationId)],
);

export const complianceScoreConfigs = pgTable('compliance_score_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  scope: text('scope').notNull(),
  weights: jsonb('weights').notNull().default({}),
  formula: jsonb('formula').notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
  ...timestampColumns,
});

export const complianceCalendarEvents = pgTable(
  'compliance_calendar_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    eventType: complianceCalendarEventTypeEnum('event_type').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    startsAt: timestamp('starts_at', { withTimezone: true, mode: 'date' }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true, mode: 'date' }),
    sourceType: text('source_type'),
    sourceId: uuid('source_id'),
    site: text('site'),
    department: text('department'),
    ...timestampColumns,
  },
  (t) => [
    index('compliance_calendar_org_idx').on(t.organizationId),
    index('compliance_calendar_starts_at_idx').on(t.startsAt),
  ],
);
