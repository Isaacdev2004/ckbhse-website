-- Milestone 2.8 Part 3B/3C — Report export jobs and schedules

CREATE TYPE "report_export_format" AS ENUM('csv', 'xlsx', 'pdf');

CREATE TYPE "report_export_status" AS ENUM('pending', 'processing', 'ready', 'failed');

CREATE TYPE "report_schedule_cadence" AS ENUM('daily', 'weekly', 'monthly');

CREATE TABLE IF NOT EXISTS "report_export_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "report_key" text NOT NULL,
  "format" "report_export_format" NOT NULL DEFAULT 'csv',
  "status" "report_export_status" NOT NULL DEFAULT 'pending',
  "file_key" text,
  "error_message" text,
  "requested_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "report_export_jobs_org_idx"
  ON "report_export_jobs" ("organization_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "report_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "schedule_key" text NOT NULL,
  "report_key" text NOT NULL,
  "title" text NOT NULL,
  "cadence" "report_schedule_cadence" NOT NULL DEFAULT 'weekly',
  "time_utc" text NOT NULL DEFAULT '08:00',
  "format" "report_export_format" NOT NULL DEFAULT 'pdf',
  "recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "last_run_at" timestamp with time zone,
  "next_run_at" timestamp with time zone,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "report_schedules_org_key_uidx"
  ON "report_schedules" ("organization_id", "schedule_key");

CREATE INDEX IF NOT EXISTS "report_schedules_due_idx"
  ON "report_schedules" ("enabled", "next_run_at");

INSERT INTO "report_schedules" (
  "id",
  "organization_id",
  "schedule_key",
  "report_key",
  "title",
  "cadence",
  "time_utc",
  "format",
  "recipients",
  "enabled",
  "next_run_at"
)
VALUES (
  '00000000-0000-4000-8000-000000000b01',
  '00000000-0000-4000-8000-000000000002',
  'weekly-executive-pdf',
  'executive-rollup',
  'Weekly Executive PDF',
  'weekly',
  '08:00',
  'pdf',
  '["consultant@ckbhse.co.uk"]'::jsonb,
  true,
  now() + interval '7 days'
)
ON CONFLICT DO NOTHING;
