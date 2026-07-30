import {
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

export const capaTypeEnum = pgEnum('capa_type', ['corrective', 'preventive']);

export const capaStatusEnum = pgEnum('capa_status', [
  'draft', 'open', 'in_progress', 'pending_verification', 'pending_approval',
  'approved', 'closed', 'cancelled', 'overdue',
]);

export const capaPriorityEnum = pgEnum('capa_priority', ['low', 'medium', 'high', 'critical']);

export const rcaMethodEnum = pgEnum('rca_method', [
  'five_whys', 'fishbone', 'fault_tree', 'barrier_analysis', 'other',
]);

export const verificationResultEnum = pgEnum('verification_result', [
  'pending', 'effective', 'ineffective', 'partial',
]);

export const capaRecords = pgTable(
  'capa_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    capaNumber: text('capa_number').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    capaType: capaTypeEnum('capa_type').notNull(),
    status: capaStatusEnum('status').notNull().default('draft'),
    priority: capaPriorityEnum('priority').notNull().default('medium'),
    sourceType: text('source_type'),
    sourceId: uuid('source_id'),
    auditFindingId: uuid('audit_finding_id'),
    inspectionFindingId: uuid('inspection_finding_id'),
    incidentId: uuid('incident_id'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
    site: text('site'),
    department: text('department'),
    ...timestampColumns,
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    version: integer('version').notNull().default(1),
  },
  (t) => [
    index('capa_records_org_idx').on(t.organizationId),
    index('capa_records_status_idx').on(t.status),
    index('capa_records_due_date_idx').on(t.dueDate),
  ],
);

export const capaRootCauseAnalyses = pgTable('capa_root_cause_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  capaId: uuid('capa_id').notNull().references(() => capaRecords.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  method: rcaMethodEnum('method').notNull().default('five_whys'),
  summary: text('summary'),
  rootCauses: jsonb('root_causes').notNull().default([]),
  contributingFactors: jsonb('contributing_factors').notNull().default([]),
  analysisData: jsonb('analysis_data').notNull().default({}),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  completedBy: uuid('completed_by'),
  ...timestampColumns,
});

export const capaVerifications = pgTable('capa_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  capaId: uuid('capa_id').notNull().references(() => capaRecords.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  result: verificationResultEnum('result').notNull().default('pending'),
  notes: text('notes'),
  evidence: jsonb('evidence').notNull().default([]),
  verifiedBy: uuid('verified_by'),
  verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'date' }),
  ...timestampColumns,
});

export const capaApprovals = pgTable('capa_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  capaId: uuid('capa_id').notNull().references(() => capaRecords.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  approvalLevel: integer('approval_level').notNull().default(1),
  status: text('status').notNull().default('pending'),
  comments: text('comments'),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
  ...timestampColumns,
});

export const capaEscalations = pgTable('capa_escalations', {
  id: uuid('id').primaryKey().defaultRandom(),
  capaId: uuid('capa_id').notNull().references(() => capaRecords.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  escalationLevel: integer('escalation_level').notNull().default(1),
  reason: text('reason').notNull(),
  escalatedTo: uuid('escalated_to'),
  escalatedAt: timestamp('escalated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
  createdBy: uuid('created_by'),
  createdAt: timestampColumns.createdAt,
});

export const capaNotifications = pgTable('capa_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  capaId: uuid('capa_id').notNull().references(() => capaRecords.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  notificationType: text('notification_type').notNull(),
  recipientId: uuid('recipient_id'),
  subject: text('subject').notNull(),
  body: text('body'),
  sentAt: timestamp('sent_at', { withTimezone: true, mode: 'date' }),
  deliveryStatus: text('delivery_status').notNull().default('pending'),
  createdAt: timestampColumns.createdAt,
});
