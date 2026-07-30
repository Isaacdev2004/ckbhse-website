-- Milestone 2.6 Part 2B.3 — Compliance Analytics & Regulatory Intelligence

CREATE TYPE "regulatory_alert_severity" AS ENUM('info', 'warning', 'critical');

CREATE TYPE "regulatory_alert_status" AS ENUM('open', 'acknowledged', 'resolved');

CREATE TYPE "compliance_export_format" AS ENUM('csv', 'json', 'xlsx');

CREATE TYPE "compliance_export_status" AS ENUM('pending', 'processing', 'ready', 'failed');

CREATE TABLE IF NOT EXISTS "compliance_kpi_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "snapshot_month" text NOT NULL,
  "compliance_score" integer DEFAULT 0 NOT NULL,
  "audit_completion" integer DEFAULT 0 NOT NULL,
  "inspection_completion" integer DEFAULT 0 NOT NULL,
  "capa_completion" integer DEFAULT 0 NOT NULL,
  "training_completion" integer DEFAULT 0 NOT NULL,
  "control_effectiveness" integer DEFAULT 0 NOT NULL,
  "open_findings" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "regulatory_alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "alert_type" text NOT NULL,
  "severity" "regulatory_alert_severity" DEFAULT 'info' NOT NULL,
  "source_regulation_id" uuid,
  "status" "regulatory_alert_status" DEFAULT 'open' NOT NULL,
  "acknowledged_at" timestamp with time zone,
  "acknowledged_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "compliance_export_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "export_type" text NOT NULL,
  "format" "compliance_export_format" DEFAULT 'json' NOT NULL,
  "status" "compliance_export_status" DEFAULT 'pending' NOT NULL,
  "file_key" text,
  "parameters" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "requested_by" uuid,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "compliance_kpi_snapshots" ADD CONSTRAINT "compliance_kpi_snapshots_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "regulatory_alerts" ADD CONSTRAINT "regulatory_alerts_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "compliance_export_jobs" ADD CONSTRAINT "compliance_export_jobs_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;

CREATE UNIQUE INDEX IF NOT EXISTS "compliance_kpi_snapshots_org_month_idx" ON "compliance_kpi_snapshots" ("organization_id", "snapshot_month");
CREATE INDEX IF NOT EXISTS "regulatory_alerts_org_status_idx" ON "regulatory_alerts" ("organization_id", "status");
CREATE INDEX IF NOT EXISTS "compliance_export_jobs_org_idx" ON "compliance_export_jobs" ("organization_id");

-- Demo regulatory register entry for Acme
INSERT INTO regulatory_register_entries (id, organization_id, name, category, version, compliance_status, description) VALUES
  (
    '00000000-0000-4000-8000-000000000901',
    '00000000-0000-4000-8000-000000000002',
    'ISO 45001:2018 Amendment',
    'iso',
    '2018-A1',
    'review_required',
    'ISO 45001 amendment requires updated risk assessment documentation'
  )
ON CONFLICT (id) DO NOTHING;

-- KPI snapshots (last 6 months trend for Acme)
INSERT INTO compliance_kpi_snapshots (organization_id, snapshot_month, compliance_score, audit_completion, inspection_completion, capa_completion, training_completion, control_effectiveness, open_findings) VALUES
  ('00000000-0000-4000-8000-000000000002', '2026-02', 72, 60, 55, 40, 70, 80, 8),
  ('00000000-0000-4000-8000-000000000002', '2026-03', 74, 65, 58, 45, 72, 82, 7),
  ('00000000-0000-4000-8000-000000000002', '2026-04', 76, 70, 62, 50, 73, 83, 6),
  ('00000000-0000-4000-8000-000000000002', '2026-05', 78, 75, 68, 55, 74, 85, 5),
  ('00000000-0000-4000-8000-000000000002', '2026-06', 80, 78, 72, 60, 75, 86, 4),
  ('00000000-0000-4000-8000-000000000002', '2026-07', 82, 80, 75, 65, 75, 88, 3)
ON CONFLICT (organization_id, snapshot_month) DO NOTHING;

INSERT INTO regulatory_alerts (id, organization_id, title, description, alert_type, severity, source_regulation_id, status) VALUES
  (
    '00000000-0000-4000-8000-000000000902',
    '00000000-0000-4000-8000-000000000002',
    'ISO 45001 amendment review required',
    'Updated ISO 45001 guidance requires review of occupational health risk assessments by Q3 2026',
    'regulatory_change',
    'warning',
    '00000000-0000-4000-8000-000000000901',
    'open'
  ),
  (
    '00000000-0000-4000-8000-000000000903',
    '00000000-0000-4000-8000-000000000002',
    'Legal register review due',
    'Management of Health and Safety at Work Regulations review due within 90 days',
    'legal_review',
    'info',
    NULL,
    'open'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_calendar_events (organization_id, event_type, title, description, starts_at, source_type) VALUES
  (
    '00000000-0000-4000-8000-000000000002',
    'legal_review',
    'MHSAWR 1999 annual review',
    'Scheduled legal register review',
    now() + interval '60 days',
    'legal_register'
  )
ON CONFLICT DO NOTHING;
