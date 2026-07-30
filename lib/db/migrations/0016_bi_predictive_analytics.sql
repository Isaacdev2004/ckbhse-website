-- Milestone 2.8 Part 4 — BI integration, benchmarking, predictive analytics

CREATE TYPE "reporting_bi_export_status" AS ENUM('pending', 'processing', 'ready', 'failed');

CREATE TYPE "reporting_bi_export_type" AS ENUM('full', 'incremental');

CREATE TYPE "reporting_forecast_confidence" AS ENUM('low', 'medium', 'high');

CREATE TYPE "reporting_subscription_channel" AS ENUM('email', 'in_app');

CREATE TYPE "reporting_threshold_operator" AS ENUM('lt', 'lte', 'gt', 'gte');

CREATE TABLE IF NOT EXISTS "reporting_bi_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "connection_key" text NOT NULL,
  "provider" text NOT NULL DEFAULT 'power_bi',
  "workspace_id" text NOT NULL,
  "dataset_name" text NOT NULL,
  "dataset_key" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "last_sync_at" timestamp with time zone,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_bi_connections_org_key_uidx"
  ON "reporting_bi_connections" ("organization_id", "connection_key");

CREATE TABLE IF NOT EXISTS "reporting_bi_exports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "connection_key" text NOT NULL,
  "dataset_key" text NOT NULL,
  "export_type" "reporting_bi_export_type" NOT NULL DEFAULT 'full',
  "status" "reporting_bi_export_status" NOT NULL DEFAULT 'pending',
  "file_key" text,
  "row_count" integer DEFAULT 0 NOT NULL,
  "watermark" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "error_message" text,
  "requested_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "reporting_bi_exports_org_idx"
  ON "reporting_bi_exports" ("organization_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "reporting_benchmark_cohorts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cohort_key" text NOT NULL,
  "label" text NOT NULL,
  "industry" text,
  "description" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_benchmark_cohorts_key_uidx"
  ON "reporting_benchmark_cohorts" ("cohort_key");

CREATE TABLE IF NOT EXISTS "reporting_benchmark_metrics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cohort_key" text NOT NULL,
  "domain" "reporting_domain" NOT NULL,
  "kpi_key" text NOT NULL,
  "percentile_25" numeric(18, 4) NOT NULL,
  "percentile_50" numeric(18, 4) NOT NULL,
  "percentile_75" numeric(18, 4) NOT NULL,
  "sample_size" integer NOT NULL DEFAULT 0,
  "snapshot_period" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_benchmark_metrics_cohort_kpi_period_uidx"
  ON "reporting_benchmark_metrics" ("cohort_key", "kpi_key", "snapshot_period");

CREATE TABLE IF NOT EXISTS "reporting_forecasts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "kpi_key" text NOT NULL,
  "domain" "reporting_domain" NOT NULL,
  "snapshot_period" text NOT NULL,
  "forecast_period" text NOT NULL,
  "projected_value" numeric(18, 4) NOT NULL,
  "confidence" "reporting_forecast_confidence" NOT NULL DEFAULT 'medium',
  "method" text NOT NULL DEFAULT 'linear_regression_stub',
  "risk_of_breach" boolean DEFAULT false NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_forecasts_org_kpi_period_uidx"
  ON "reporting_forecasts" ("organization_id", "kpi_key", "forecast_period");

CREATE TABLE IF NOT EXISTS "reporting_kpi_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subscription_key" text NOT NULL,
  "kpi_key" text NOT NULL,
  "domain" "reporting_domain" NOT NULL,
  "threshold_operator" "reporting_threshold_operator" NOT NULL,
  "threshold_value" numeric(18, 4) NOT NULL,
  "channel" "reporting_subscription_channel" NOT NULL DEFAULT 'in_app',
  "enabled" boolean DEFAULT true NOT NULL,
  "last_triggered_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_kpi_subscriptions_org_user_key_uidx"
  ON "reporting_kpi_subscriptions" ("organization_id", "user_id", "subscription_key");

INSERT INTO "reporting_view_registry" ("id", "view_key", "description", "refresh_status")
VALUES
  (
    '00000000-0000-4000-8000-000000000816',
    'bi_exports',
    'Power BI dataset export jobs',
    'idle'
  ),
  (
    '00000000-0000-4000-8000-000000000817',
    'benchmark_metrics',
    'Anonymised cross-tenant benchmark aggregates',
    'idle'
  ),
  (
    '00000000-0000-4000-8000-000000000818',
    'forecasts',
    'Predictive forecast stubs',
    'idle'
  );

INSERT INTO "reporting_benchmark_cohorts" (
  "id",
  "cohort_key",
  "label",
  "industry",
  "description"
)
VALUES (
  '00000000-0000-4000-8000-000000000820',
  'uk-hseq-mid-market',
  'UK HSEQ Mid-Market',
  'cross-sector',
  'Anonymised benchmark cohort for UK mid-market HSEQ programmes'
);

INSERT INTO "reporting_benchmark_metrics" (
  "id",
  "cohort_key",
  "domain",
  "kpi_key",
  "percentile_25",
  "percentile_50",
  "percentile_75",
  "sample_size",
  "snapshot_period"
)
VALUES
  (
    '00000000-0000-4000-8000-000000000821',
    'uk-hseq-mid-market',
    'compliance',
    'compliance.score',
    72,
    78,
    85,
    48,
    '2026-07'
  ),
  (
    '00000000-0000-4000-8000-000000000822',
    'uk-hseq-mid-market',
    'learning',
    'learning.completion_rate',
    78,
    86,
    92,
    48,
    '2026-07'
  ),
  (
    '00000000-0000-4000-8000-000000000823',
    'uk-hseq-mid-market',
    'crm',
    'crm.conversion_rate',
    18,
    24,
    31,
    48,
    '2026-07'
  );

INSERT INTO "reporting_bi_connections" (
  "id",
  "organization_id",
  "connection_key",
  "workspace_id",
  "dataset_name",
  "dataset_key",
  "enabled",
  "metadata"
)
VALUES (
  '00000000-0000-4000-8000-000000000830',
  '00000000-0000-4000-8000-000000000002',
  'acme-executive',
  'ckbhse-demo-workspace',
  'Acme Executive KPIs',
  'acme-executive-kpis',
  true,
  '{"refreshMode":"incremental","tables":["kpi_snapshots","executive_summary"]}'::jsonb
);
