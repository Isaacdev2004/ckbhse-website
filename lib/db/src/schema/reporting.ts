import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { organizations, users } from './foundation.js';

export const reportingDomainEnum = pgEnum('reporting_domain', [
  'compliance',
  'audit',
  'crm',
  'learning',
  'financial',
  'platform',
]);

export const reportingKpiUnitEnum = pgEnum('reporting_kpi_unit', [
  'percent',
  'count',
  'score',
  'hours',
  'currency',
  'ratio',
]);

export const reportingViewRefreshStatusEnum = pgEnum('reporting_view_refresh_status', [
  'idle',
  'running',
  'failed',
]);

export const reportingKpiSnapshots = pgTable(
  'reporting_kpi_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    snapshotPeriod: text('snapshot_period').notNull(),
    domain: reportingDomainEnum('domain').notNull(),
    kpiKey: text('kpi_key').notNull(),
    label: text('label').notNull(),
    valueNumeric: numeric('value_numeric', { precision: 18, scale: 4 }).notNull(),
    unit: reportingKpiUnitEnum('unit').notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('reporting_kpi_snapshots_org_period_domain_key_uidx').on(
      table.organizationId,
      table.snapshotPeriod,
      table.domain,
      table.kpiKey,
    ),
    index('reporting_kpi_snapshots_org_period_idx').on(
      table.organizationId,
      table.snapshotPeriod,
    ),
  ],
);

export const reportingViewRegistry = pgTable(
  'reporting_view_registry',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    viewKey: text('view_key').notNull(),
    description: text('description'),
    lastRefreshedAt: timestamp('last_refreshed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    refreshStatus: reportingViewRefreshStatusEnum('refresh_status')
      .notNull()
      .default('idle'),
    rowCount: integer('row_count').notNull().default(0),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex('reporting_view_registry_view_key_uidx').on(table.viewKey)],
);

export const reportDefinitions = pgTable(
  'report_definitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    reportKey: text('report_key').notNull(),
    title: text('title').notNull(),
    domain: reportingDomainEnum('domain').notNull(),
    definition: jsonb('definition').notNull().default({}),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('report_definitions_org_key_uidx').on(
      table.organizationId,
      table.reportKey,
    ),
  ],
);

export const dashboardWidgetTypeEnum = pgEnum('dashboard_widget_type', [
  'metric',
  'trend',
  'table',
  'chart',
  'heatmap',
  'benchmark',
]);

export const dashboardDefinitions = pgTable(
  'dashboard_definitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    dashboardKey: text('dashboard_key').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    domain: reportingDomainEnum('domain'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
);

export const dashboardWidgets = pgTable(
  'dashboard_widgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dashboardId: uuid('dashboard_id')
      .notNull()
      .references(() => dashboardDefinitions.id, { onDelete: 'cascade' }),
    widgetKey: text('widget_key').notNull(),
    widgetType: dashboardWidgetTypeEnum('widget_type').notNull(),
    title: text('title').notNull(),
    config: jsonb('config').notNull().default({}),
    defaultOrder: integer('default_order').notNull().default(0),
    colSpan: integer('col_span').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('dashboard_widgets_dashboard_key_uidx').on(
      table.dashboardId,
      table.widgetKey,
    ),
  ],
);

export const userDashboardLayouts = pgTable(
  'user_dashboard_layouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dashboardKey: text('dashboard_key').notNull(),
    layout: jsonb('layout').notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('user_dashboard_layouts_org_user_key_uidx').on(
      table.organizationId,
      table.userId,
      table.dashboardKey,
    ),
  ],
);

export const reportExportFormatEnum = pgEnum('report_export_format', [
  'csv',
  'xlsx',
  'pdf',
]);

export const reportExportStatusEnum = pgEnum('report_export_status', [
  'pending',
  'processing',
  'ready',
  'failed',
]);

export const reportScheduleCadenceEnum = pgEnum('report_schedule_cadence', [
  'daily',
  'weekly',
  'monthly',
]);

export const reportExportJobs = pgTable(
  'report_export_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    reportKey: text('report_key').notNull(),
    format: reportExportFormatEnum('format').notNull().default('csv'),
    status: reportExportStatusEnum('status').notNull().default('pending'),
    fileKey: text('file_key'),
    errorMessage: text('error_message'),
    requestedBy: uuid('requested_by').references(() => users.id, { onDelete: 'set null' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('report_export_jobs_org_idx').on(table.organizationId, table.createdAt),
  ],
);

export const reportSchedules = pgTable(
  'report_schedules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    scheduleKey: text('schedule_key').notNull(),
    reportKey: text('report_key').notNull(),
    title: text('title').notNull(),
    cadence: reportScheduleCadenceEnum('cadence').notNull().default('weekly'),
    timeUtc: text('time_utc').notNull().default('08:00'),
    format: reportExportFormatEnum('format').notNull().default('pdf'),
    recipients: jsonb('recipients').notNull().default([]),
    enabled: boolean('enabled').notNull().default(true),
    lastRunAt: timestamp('last_run_at', { withTimezone: true, mode: 'date' }),
    nextRunAt: timestamp('next_run_at', { withTimezone: true, mode: 'date' }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('report_schedules_org_key_uidx').on(
      table.organizationId,
      table.scheduleKey,
    ),
    index('report_schedules_due_idx').on(table.enabled, table.nextRunAt),
  ],
);

export const reportingBiExportStatusEnum = pgEnum('reporting_bi_export_status', [
  'pending',
  'processing',
  'ready',
  'failed',
]);

export const reportingBiExportTypeEnum = pgEnum('reporting_bi_export_type', [
  'full',
  'incremental',
]);

export const reportingForecastConfidenceEnum = pgEnum('reporting_forecast_confidence', [
  'low',
  'medium',
  'high',
]);

export const reportingSubscriptionChannelEnum = pgEnum('reporting_subscription_channel', [
  'email',
  'in_app',
]);

export const reportingThresholdOperatorEnum = pgEnum('reporting_threshold_operator', [
  'lt',
  'lte',
  'gt',
  'gte',
]);

export const reportingBiConnections = pgTable(
  'reporting_bi_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    connectionKey: text('connection_key').notNull(),
    provider: text('provider').notNull().default('power_bi'),
    workspaceId: text('workspace_id').notNull(),
    datasetName: text('dataset_name').notNull(),
    datasetKey: text('dataset_key').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true, mode: 'date' }),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('reporting_bi_connections_org_key_uidx').on(
      table.organizationId,
      table.connectionKey,
    ),
  ],
);

export const reportingBiExports = pgTable(
  'reporting_bi_exports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    connectionKey: text('connection_key').notNull(),
    datasetKey: text('dataset_key').notNull(),
    exportType: reportingBiExportTypeEnum('export_type').notNull().default('full'),
    status: reportingBiExportStatusEnum('status').notNull().default('pending'),
    fileKey: text('file_key'),
    rowCount: integer('row_count').notNull().default(0),
    watermark: jsonb('watermark').notNull().default({}),
    errorMessage: text('error_message'),
    requestedBy: uuid('requested_by').references(() => users.id, { onDelete: 'set null' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('reporting_bi_exports_org_idx').on(table.organizationId, table.createdAt),
  ],
);

export const reportingBenchmarkCohorts = pgTable(
  'reporting_benchmark_cohorts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cohortKey: text('cohort_key').notNull(),
    label: text('label').notNull(),
    industry: text('industry'),
    description: text('description'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex('reporting_benchmark_cohorts_key_uidx').on(table.cohortKey)],
);

export const reportingBenchmarkMetrics = pgTable(
  'reporting_benchmark_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cohortKey: text('cohort_key').notNull(),
    domain: reportingDomainEnum('domain').notNull(),
    kpiKey: text('kpi_key').notNull(),
    percentile25: numeric('percentile_25', { precision: 18, scale: 4 }).notNull(),
    percentile50: numeric('percentile_50', { precision: 18, scale: 4 }).notNull(),
    percentile75: numeric('percentile_75', { precision: 18, scale: 4 }).notNull(),
    sampleSize: integer('sample_size').notNull().default(0),
    snapshotPeriod: text('snapshot_period').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('reporting_benchmark_metrics_cohort_kpi_period_uidx').on(
      table.cohortKey,
      table.kpiKey,
      table.snapshotPeriod,
    ),
  ],
);

export const reportingForecasts = pgTable(
  'reporting_forecasts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    kpiKey: text('kpi_key').notNull(),
    domain: reportingDomainEnum('domain').notNull(),
    snapshotPeriod: text('snapshot_period').notNull(),
    forecastPeriod: text('forecast_period').notNull(),
    projectedValue: numeric('projected_value', { precision: 18, scale: 4 }).notNull(),
    confidence: reportingForecastConfidenceEnum('confidence').notNull().default('medium'),
    method: text('method').notNull().default('linear_regression_stub'),
    riskOfBreach: boolean('risk_of_breach').notNull().default(false),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('reporting_forecasts_org_kpi_period_uidx').on(
      table.organizationId,
      table.kpiKey,
      table.forecastPeriod,
    ),
  ],
);

export const reportingKpiSubscriptions = pgTable(
  'reporting_kpi_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionKey: text('subscription_key').notNull(),
    kpiKey: text('kpi_key').notNull(),
    domain: reportingDomainEnum('domain').notNull(),
    thresholdOperator: reportingThresholdOperatorEnum('threshold_operator').notNull(),
    thresholdValue: numeric('threshold_value', { precision: 18, scale: 4 }).notNull(),
    channel: reportingSubscriptionChannelEnum('channel').notNull().default('in_app'),
    enabled: boolean('enabled').notNull().default(true),
    lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('reporting_kpi_subscriptions_org_user_key_uidx').on(
      table.organizationId,
      table.userId,
      table.subscriptionKey,
    ),
  ],
);
