-- Milestone 2.6 Part 2 — Inspection Management, Compliance Workspace & Regulatory Framework

CREATE TYPE "inspection_status" AS ENUM(
  'draft',
  'scheduled',
  'in_progress',
  'completed',
  'failed',
  'passed',
  'cancelled',
  'overdue'
);

CREATE TYPE "inspection_frequency" AS ENUM(
  'unscheduled',
  'reactive',
  'preventive',
  'daily',
  'weekly',
  'monthly',
  'annual',
  'follow_up',
  'spot'
);

CREATE TYPE "legal_obligation_status" AS ENUM(
  'active',
  'pending_review',
  'superseded',
  'archived'
);

CREATE TYPE "regulatory_category" AS ENUM(
  'hse',
  'iso',
  'environmental',
  'fire_safety',
  'construction',
  'manufacturing',
  'healthcare',
  'education',
  'public_sector'
);

CREATE TYPE "control_type" AS ENUM(
  'preventive',
  'detective',
  'corrective',
  'administrative',
  'engineering',
  'operational'
);

CREATE TYPE "control_status" AS ENUM(
  'active',
  'inactive',
  'under_review',
  'ineffective'
);

CREATE TYPE "compliance_calendar_event_type" AS ENUM(
  'audit',
  'inspection',
  'certification_renewal',
  'training_expiry',
  'legal_review',
  'policy_review',
  'risk_review',
  'equipment_inspection',
  'permit_renewal'
);

CREATE TABLE IF NOT EXISTS "inspection_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_system" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "inspections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "inspection_type_id" uuid,
  "name" text NOT NULL,
  "site" text,
  "department" text,
  "inspector_id" uuid,
  "frequency" "inspection_frequency" DEFAULT 'unscheduled' NOT NULL,
  "status" "inspection_status" DEFAULT 'draft' NOT NULL,
  "score" integer,
  "scheduled_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by" uuid,
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "inspection_findings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "inspection_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "severity" "finding_severity" DEFAULT 'minor' NOT NULL,
  "status" "finding_status" DEFAULT 'open' NOT NULL,
  "category" text,
  "due_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "inspection_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "inspection_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "finding_id" uuid,
  "storage_key" text,
  "file_name" text,
  "notes" text,
  "captured_by" uuid,
  "captured_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "inspection_checklist_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "inspection_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "item_key" text NOT NULL,
  "prompt" text NOT NULL,
  "response_value" text,
  "response_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "score" integer,
  "comment" text,
  "responded_by" uuid,
  "responded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "legal_register_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "regulation" text NOT NULL,
  "legislation" text,
  "jurisdiction" text,
  "category" text,
  "authority" text,
  "effective_date" timestamp with time zone,
  "review_date" timestamp with time zone,
  "status" "legal_obligation_status" DEFAULT 'active' NOT NULL,
  "responsible_person_id" uuid,
  "applicable_sites" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "related_risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "related_controls" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "related_audits" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "regulatory_register_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "category" "regulatory_category" NOT NULL,
  "version" text,
  "effective_date" timestamp with time zone,
  "superseded_date" timestamp with time zone,
  "change_log" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "compliance_status" text DEFAULT 'compliant' NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "iso_frameworks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "version" text,
  "is_system" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "iso_clauses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "framework_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "clause_number" text NOT NULL,
  "title" text NOT NULL,
  "requirement" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "compliance_controls" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "control_type" "control_type" NOT NULL,
  "status" "control_status" DEFAULT 'active' NOT NULL,
  "owner_id" uuid,
  "frequency" text,
  "effectiveness" text,
  "last_tested_at" timestamp with time zone,
  "related_risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "related_audits" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "documents" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "compliance_score_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "scope" text NOT NULL,
  "weights" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "formula" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "compliance_calendar_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "event_type" "compliance_calendar_event_type" NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone,
  "source_type" text,
  "source_id" uuid,
  "site" text,
  "department" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "inspection_types" ADD CONSTRAINT "inspection_types_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspection_type_id_fk" FOREIGN KEY ("inspection_type_id") REFERENCES "public"."inspection_types"("id") ON DELETE set null;
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspection_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE cascade;
ALTER TABLE "inspection_evidence" ADD CONSTRAINT "inspection_evidence_inspection_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE cascade;
ALTER TABLE "inspection_checklist_responses" ADD CONSTRAINT "inspection_checklist_responses_inspection_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE cascade;
ALTER TABLE "legal_register_entries" ADD CONSTRAINT "legal_register_entries_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "regulatory_register_entries" ADD CONSTRAINT "regulatory_register_entries_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "iso_frameworks" ADD CONSTRAINT "iso_frameworks_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "iso_clauses" ADD CONSTRAINT "iso_clauses_framework_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."iso_frameworks"("id") ON DELETE cascade;
ALTER TABLE "compliance_controls" ADD CONSTRAINT "compliance_controls_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "compliance_score_configs" ADD CONSTRAINT "compliance_score_configs_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "compliance_calendar_events" ADD CONSTRAINT "compliance_calendar_events_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;

CREATE INDEX IF NOT EXISTS "inspections_org_idx" ON "inspections" ("organization_id");
CREATE INDEX IF NOT EXISTS "inspections_status_idx" ON "inspections" ("status");
CREATE INDEX IF NOT EXISTS "inspections_scheduled_at_idx" ON "inspections" ("scheduled_at");
CREATE INDEX IF NOT EXISTS "legal_register_org_idx" ON "legal_register_entries" ("organization_id");
CREATE INDEX IF NOT EXISTS "regulatory_register_org_idx" ON "regulatory_register_entries" ("organization_id");
CREATE INDEX IF NOT EXISTS "compliance_controls_org_idx" ON "compliance_controls" ("organization_id");
CREATE INDEX IF NOT EXISTS "compliance_calendar_org_idx" ON "compliance_calendar_events" ("organization_id");
CREATE INDEX IF NOT EXISTS "compliance_calendar_starts_at_idx" ON "compliance_calendar_events" ("starts_at");

-- System inspection types
INSERT INTO inspection_types (id, organization_id, key, name, description, is_system) VALUES
  ('00000000-0000-4000-8000-000000000a01', NULL, 'workplace_inspection', 'Workplace Inspection', 'General workplace safety inspection', true),
  ('00000000-0000-4000-8000-000000000a02', NULL, 'site_inspection', 'Site Inspection', 'Construction or operational site inspection', true),
  ('00000000-0000-4000-8000-000000000a03', NULL, 'fire_safety_inspection', 'Fire Safety Inspection', 'Fire safety compliance inspection', true),
  ('00000000-0000-4000-8000-000000000a04', NULL, 'equipment_inspection', 'Equipment Inspection', 'Plant and equipment inspection', true),
  ('00000000-0000-4000-8000-000000000a05', NULL, 'vehicle_inspection', 'Vehicle Inspection', 'Fleet vehicle safety inspection', true),
  ('00000000-0000-4000-8000-000000000a06', NULL, 'environmental_inspection', 'Environmental Inspection', 'Environmental compliance inspection', true),
  ('00000000-0000-4000-8000-000000000a07', NULL, 'behavioural_safety', 'Behavioural Safety Observation', 'Behavioural safety observation', true),
  ('00000000-0000-4000-8000-000000000a08', NULL, 'contractor_inspection', 'Contractor Inspection', 'Contractor compliance inspection', true)
ON CONFLICT (id) DO NOTHING;

-- ISO frameworks
INSERT INTO iso_frameworks (id, organization_id, key, name, version, is_system) VALUES
  ('00000000-0000-4000-8000-000000000b01', NULL, 'iso_45001', 'ISO 45001', '2018', true),
  ('00000000-0000-4000-8000-000000000b02', NULL, 'iso_9001', 'ISO 9001', '2015', true),
  ('00000000-0000-4000-8000-000000000b03', NULL, 'iso_14001', 'ISO 14001', '2015', true)
ON CONFLICT (id) DO NOTHING;

-- New permissions
INSERT INTO permissions (id, key, name, description, domain) VALUES
  (gen_random_uuid(), 'consultancy.inspection.read', 'Inspection Read', 'View inspections', 'consultancy'),
  (gen_random_uuid(), 'consultancy.inspection.create', 'Inspection Create', 'Create inspections', 'consultancy'),
  (gen_random_uuid(), 'consultancy.inspection.update', 'Inspection Update', 'Update inspections', 'consultancy'),
  (gen_random_uuid(), 'consultancy.compliance.read', 'Compliance Read', 'View compliance workspace', 'consultancy'),
  (gen_random_uuid(), 'consultancy.compliance.manage', 'Compliance Manage', 'Manage compliance registers', 'consultancy'),
  (gen_random_uuid(), 'consultancy.legal-register.read', 'Legal Register Read', 'View legal register', 'consultancy'),
  (gen_random_uuid(), 'consultancy.legal-register.manage', 'Legal Register Manage', 'Manage legal register', 'consultancy'),
  (gen_random_uuid(), 'consultancy.regulatory.read', 'Regulatory Read', 'View regulatory register', 'consultancy'),
  (gen_random_uuid(), 'consultancy.regulatory.manage', 'Regulatory Manage', 'Manage regulatory register', 'consultancy'),
  (gen_random_uuid(), 'consultancy.control.read', 'Control Read', 'View control register', 'consultancy'),
  (gen_random_uuid(), 'consultancy.control.manage', 'Control Manage', 'Manage controls', 'consultancy')
ON CONFLICT (key) DO NOTHING;

-- Demo data for Acme
INSERT INTO inspections (id, organization_id, inspection_type_id, name, site, department, frequency, status, scheduled_at, score) VALUES
  ('00000000-0000-4000-8000-000000000c01', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000a01', 'Weekly Workplace Inspection', 'Head Office', 'Operations', 'weekly', 'scheduled', now() + interval '2 days', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_register_entries (id, organization_id, regulation, legislation, jurisdiction, category, authority, status, review_date) VALUES
  ('00000000-0000-4000-8000-000000000d01', '00000000-0000-4000-8000-000000000002', 'Management of Health and Safety at Work Regulations 1999', 'UK Health and Safety at Work Act 1974', 'United Kingdom', 'HSE', 'HSE', 'active', now() + interval '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_controls (id, organization_id, name, description, control_type, status, frequency) VALUES
  ('00000000-0000-4000-8000-000000000e01', '00000000-0000-4000-8000-000000000002', 'Monthly fire alarm test', 'Test fire alarm system monthly', 'preventive', 'active', 'monthly')
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_score_configs (id, organization_id, name, scope, weights) VALUES
  ('00000000-0000-4000-8000-000000000f01', '00000000-0000-4000-8000-000000000002', 'Organisation Score', 'organization', '{"audit":30,"inspection":25,"training":20,"legal":15,"controls":10}'::jsonb)
ON CONFLICT (id) DO NOTHING;
