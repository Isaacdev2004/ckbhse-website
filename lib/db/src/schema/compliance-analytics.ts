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

export const regulatoryAlertSeverityEnum = pgEnum('regulatory_alert_severity', [
  'info', 'warning', 'critical',
]);

export const regulatoryAlertStatusEnum = pgEnum('regulatory_alert_status', [
  'open', 'acknowledged', 'resolved',
]);

export const complianceExportFormatEnum = pgEnum('compliance_export_format', [
  'csv', 'json', 'xlsx',
]);

export const complianceExportStatusEnum = pgEnum('compliance_export_status', [
  'pending', 'processing', 'ready', 'failed',
]);

export const complianceKpiSnapshots = pgTable(
  'compliance_kpi_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    snapshotMonth: text('snapshot_month').notNull(),
    complianceScore: integer('compliance_score').notNull().default(0),
    auditCompletion: integer('audit_completion').notNull().default(0),
    inspectionCompletion: integer('inspection_completion').notNull().default(0),
    capaCompletion: integer('capa_completion').notNull().default(0),
    trainingCompletion: integer('training_completion').notNull().default(0),
    controlEffectiveness: integer('control_effectiveness').notNull().default(0),
    openFindings: integer('open_findings').notNull().default(0),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (t) => [index('compliance_kpi_snapshots_org_month_idx').on(t.organizationId, t.snapshotMonth)],
);

export const regulatoryAlerts = pgTable(
  'regulatory_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    alertType: text('alert_type').notNull(),
    severity: regulatoryAlertSeverityEnum('severity').notNull().default('info'),
    sourceRegulationId: uuid('source_regulation_id'),
    status: regulatoryAlertStatusEnum('status').notNull().default('open'),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true, mode: 'date' }),
    acknowledgedBy: uuid('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (t) => [index('regulatory_alerts_org_status_idx').on(t.organizationId, t.status)],
);

export const complianceExportJobs = pgTable(
  'compliance_export_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    exportType: text('export_type').notNull(),
    format: complianceExportFormatEnum('format').notNull().default('json'),
    status: complianceExportStatusEnum('status').notNull().default('pending'),
    fileKey: text('file_key'),
    parameters: jsonb('parameters').notNull().default({}),
    requestedBy: uuid('requested_by'),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (t) => [index('compliance_export_jobs_org_idx').on(t.organizationId)],
);
