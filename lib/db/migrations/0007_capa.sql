-- Milestone 2.6 Part 2B.1 — CAPA Management Platform

CREATE TYPE "capa_type" AS ENUM('corrective', 'preventive');

CREATE TYPE "capa_status" AS ENUM(
  'draft',
  'open',
  'in_progress',
  'pending_verification',
  'pending_approval',
  'approved',
  'closed',
  'cancelled',
  'overdue'
);

CREATE TYPE "capa_priority" AS ENUM('low', 'medium', 'high', 'critical');

CREATE TYPE "rca_method" AS ENUM(
  'five_whys',
  'fishbone',
  'fault_tree',
  'barrier_analysis',
  'other'
);

CREATE TYPE "verification_result" AS ENUM('pending', 'effective', 'ineffective', 'partial');

CREATE TABLE IF NOT EXISTS "capa_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "capa_number" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "capa_type" "capa_type" NOT NULL,
  "status" "capa_status" DEFAULT 'draft' NOT NULL,
  "priority" "capa_priority" DEFAULT 'medium' NOT NULL,
  "source_type" text,
  "source_id" uuid,
  "audit_finding_id" uuid,
  "inspection_finding_id" uuid,
  "incident_id" uuid,
  "owner_id" uuid,
  "assigned_to" uuid,
  "due_date" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "closed_at" timestamp with time zone,
  "site" text,
  "department" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "capa_root_cause_analyses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "capa_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "method" "rca_method" DEFAULT 'five_whys' NOT NULL,
  "summary" text,
  "root_causes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "contributing_factors" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "analysis_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "completed_at" timestamp with time zone,
  "completed_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "capa_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "capa_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "result" "verification_result" DEFAULT 'pending' NOT NULL,
  "notes" text,
  "evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "verified_by" uuid,
  "verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "capa_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "capa_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "approval_level" integer DEFAULT 1 NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "comments" text,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "capa_escalations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "capa_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "escalation_level" integer DEFAULT 1 NOT NULL,
  "reason" text NOT NULL,
  "escalated_to" uuid,
  "escalated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "capa_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "capa_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "notification_type" text NOT NULL,
  "recipient_id" uuid,
  "subject" text NOT NULL,
  "body" text,
  "sent_at" timestamp with time zone,
  "delivery_status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "capa_root_cause_analyses" ADD CONSTRAINT "capa_rca_capa_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capa_records"("id") ON DELETE cascade;
ALTER TABLE "capa_verifications" ADD CONSTRAINT "capa_verifications_capa_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capa_records"("id") ON DELETE cascade;
ALTER TABLE "capa_approvals" ADD CONSTRAINT "capa_approvals_capa_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capa_records"("id") ON DELETE cascade;
ALTER TABLE "capa_escalations" ADD CONSTRAINT "capa_escalations_capa_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capa_records"("id") ON DELETE cascade;
ALTER TABLE "capa_notifications" ADD CONSTRAINT "capa_notifications_capa_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capa_records"("id") ON DELETE cascade;

CREATE UNIQUE INDEX IF NOT EXISTS "capa_records_number_org_idx" ON "capa_records" ("organization_id", "capa_number");
CREATE INDEX IF NOT EXISTS "capa_records_org_idx" ON "capa_records" ("organization_id");
CREATE INDEX IF NOT EXISTS "capa_records_status_idx" ON "capa_records" ("status");
CREATE INDEX IF NOT EXISTS "capa_records_due_date_idx" ON "capa_records" ("due_date");

INSERT INTO permissions (id, key, name, description, domain) VALUES
  (gen_random_uuid(), 'consultancy.capa.read', 'CAPA Read', 'View CAPA records', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.create', 'CAPA Create', 'Create CAPA records', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.update', 'CAPA Update', 'Update CAPA records', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.assign', 'CAPA Assign', 'Assign CAPA owners', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.approve', 'CAPA Approve', 'Approve CAPA closure', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.verify', 'CAPA Verify', 'Verify CAPA effectiveness', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.close', 'CAPA Close', 'Close CAPA records', 'consultancy'),
  (gen_random_uuid(), 'consultancy.capa.escalate', 'CAPA Escalate', 'Escalate overdue CAPA', 'consultancy')
ON CONFLICT (key) DO NOTHING;

INSERT INTO capa_records (id, organization_id, capa_number, title, description, capa_type, status, priority, source_type, due_date, site, department) VALUES
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000002', 'CAPA-2026-001', 'Update risk assessment register', 'Three departments missing updated risk assessments per ISO 45001 audit finding', 'corrective', 'open', 'high', 'audit_finding', now() + interval '30 days', 'Head Office', 'Operations')
ON CONFLICT (id) DO NOTHING;

INSERT INTO capa_root_cause_analyses (capa_id, organization_id, method, summary, root_causes) VALUES
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000002', 'five_whys', 'Incomplete review cycle for departmental risk assessments', '["No scheduled review reminder", "Unclear ownership"]'::jsonb)
ON CONFLICT DO NOTHING;
