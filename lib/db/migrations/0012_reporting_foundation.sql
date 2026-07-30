-- Milestone 2.8 Part 1 — Reporting architecture & KPI engine foundation

CREATE TYPE "reporting_domain" AS ENUM(
  'compliance',
  'audit',
  'crm',
  'learning',
  'financial',
  'platform'
);

CREATE TYPE "reporting_kpi_unit" AS ENUM(
  'percent',
  'count',
  'score',
  'hours',
  'currency',
  'ratio'
);

CREATE TYPE "reporting_view_refresh_status" AS ENUM(
  'idle',
  'running',
  'failed'
);

CREATE TABLE IF NOT EXISTS "reporting_kpi_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "snapshot_period" text NOT NULL,
  "domain" "reporting_domain" NOT NULL,
  "kpi_key" text NOT NULL,
  "label" text NOT NULL,
  "value_numeric" numeric(18, 4) NOT NULL,
  "unit" "reporting_kpi_unit" NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_kpi_snapshots_org_period_domain_key_uidx"
  ON "reporting_kpi_snapshots" ("organization_id", "snapshot_period", "domain", "kpi_key");

CREATE INDEX IF NOT EXISTS "reporting_kpi_snapshots_org_period_idx"
  ON "reporting_kpi_snapshots" ("organization_id", "snapshot_period");

CREATE TABLE IF NOT EXISTS "reporting_view_registry" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "view_key" text NOT NULL,
  "description" text,
  "last_refreshed_at" timestamp with time zone,
  "refresh_status" "reporting_view_refresh_status" DEFAULT 'idle' NOT NULL,
  "row_count" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporting_view_registry_view_key_uidx"
  ON "reporting_view_registry" ("view_key");

CREATE TABLE IF NOT EXISTS "report_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "report_key" text NOT NULL,
  "title" text NOT NULL,
  "domain" "reporting_domain" NOT NULL,
  "definition" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "report_definitions_org_key_uidx"
  ON "report_definitions" ("organization_id", "report_key");

INSERT INTO "reporting_view_registry" ("id", "view_key", "description", "refresh_status")
VALUES
  (
    '00000000-0000-4000-8000-000000000801',
    'kpi_snapshots',
    'Cross-domain KPI snapshot aggregate',
    'idle'
  ),
  (
    '00000000-0000-4000-8000-000000000802',
    'executive_summary',
    'Executive rollup across compliance, audit, CRM, learning',
    'idle'
  )
ON CONFLICT DO NOTHING;
