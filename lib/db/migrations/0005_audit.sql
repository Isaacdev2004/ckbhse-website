-- Milestone 2.6 — Audit, Inspection & Compliance Management (Part 1)

CREATE TYPE "compliance_audit_status" AS ENUM(
  'draft',
  'scheduled',
  'assigned',
  'in_progress',
  'review',
  'approved',
  'published',
  'closed',
  'archived',
  'cancelled'
);

CREATE TYPE "audit_assignment_role" AS ENUM(
  'lead_auditor',
  'co_auditor',
  'observer',
  'technical_expert',
  'client_representative',
  'site_contact'
);

CREATE TYPE "checklist_item_type" AS ENUM(
  'pass_fail',
  'yes_no',
  'compliant_non_compliant',
  'numeric',
  'percentage',
  'rating',
  'free_text',
  'multiple_choice',
  'single_choice',
  'photo_upload',
  'document_upload',
  'signature',
  'gps_location',
  'date',
  'time'
);

CREATE TYPE "finding_severity" AS ENUM(
  'observation',
  'minor',
  'major',
  'critical'
);

CREATE TYPE "finding_status" AS ENUM(
  'open',
  'in_progress',
  'closed',
  'verified'
);

CREATE TYPE "scoring_model" AS ENUM(
  'percentage',
  'weighted',
  'pass_fail',
  'risk_weighted',
  'compliance_index'
);

CREATE TABLE IF NOT EXISTS "audit_types" (
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

CREATE TABLE IF NOT EXISTS "audit_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "audit_type_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "version" integer DEFAULT 1 NOT NULL,
  "scoring_model" "scoring_model" DEFAULT 'percentage' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by" uuid,
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "audit_template_sections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "template_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_template_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "section_id" uuid NOT NULL,
  "template_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "item_type" "checklist_item_type" NOT NULL,
  "prompt" text NOT NULL,
  "guidance" text,
  "reference" text,
  "options" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_required" boolean DEFAULT true NOT NULL,
  "requires_evidence" boolean DEFAULT false NOT NULL,
  "requires_comment" boolean DEFAULT false NOT NULL,
  "weight" integer DEFAULT 1 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "conditional_logic" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "compliance_audits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "audit_type_id" uuid,
  "template_id" uuid,
  "template_version" integer,
  "name" text NOT NULL,
  "site" text,
  "department" text,
  "standard" text,
  "scope" text,
  "objectives" text,
  "criteria" text,
  "lead_auditor_id" uuid,
  "planned_start" timestamp with time zone,
  "planned_end" timestamp with time zone,
  "actual_start" timestamp with time zone,
  "actual_end" timestamp with time zone,
  "duration_hours" integer,
  "frequency" text,
  "recurrence_rule" jsonb,
  "risk_rating" text,
  "priority" text DEFAULT 'medium' NOT NULL,
  "status" "compliance_audit_status" DEFAULT 'draft' NOT NULL,
  "score" integer,
  "scoring_model" "scoring_model" DEFAULT 'percentage' NOT NULL,
  "approved_at" timestamp with time zone,
  "approved_by" uuid,
  "published_at" timestamp with time zone,
  "closed_at" timestamp with time zone,
  "is_immutable" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "audit_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" "audit_assignment_role" NOT NULL,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_checklist_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "template_item_id" uuid NOT NULL,
  "response_value" text,
  "response_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "score" integer,
  "comment" text,
  "responded_by" uuid,
  "responded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_findings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "severity" "finding_severity" DEFAULT 'minor' NOT NULL,
  "status" "finding_status" DEFAULT 'open' NOT NULL,
  "category" text,
  "clause_reference" text,
  "department" text,
  "site" text,
  "raised_by" uuid,
  "assigned_to" uuid,
  "due_date" timestamp with time zone,
  "closed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "audit_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "finding_id" uuid,
  "checklist_response_id" uuid,
  "storage_key" text,
  "mime_type" text,
  "file_name" text,
  "notes" text,
  "gps_coordinates" jsonb,
  "captured_by" uuid,
  "captured_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "report_type" text NOT NULL,
  "title" text NOT NULL,
  "summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "storage_key" text,
  "generated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "generated_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "revision_number" integer NOT NULL,
  "snapshot" jsonb NOT NULL,
  "changed_by" uuid,
  "change_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "audit_types" ADD CONSTRAINT "audit_types_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "audit_templates" ADD CONSTRAINT "audit_templates_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "audit_templates" ADD CONSTRAINT "audit_templates_audit_type_id_fk" FOREIGN KEY ("audit_type_id") REFERENCES "public"."audit_types"("id") ON DELETE set null;
ALTER TABLE "audit_template_sections" ADD CONSTRAINT "audit_template_sections_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."audit_templates"("id") ON DELETE cascade;
ALTER TABLE "audit_template_sections" ADD CONSTRAINT "audit_template_sections_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "audit_template_items" ADD CONSTRAINT "audit_template_items_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."audit_template_sections"("id") ON DELETE cascade;
ALTER TABLE "audit_template_items" ADD CONSTRAINT "audit_template_items_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."audit_templates"("id") ON DELETE cascade;
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_audit_type_id_fk" FOREIGN KEY ("audit_type_id") REFERENCES "public"."audit_types"("id") ON DELETE set null;
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."audit_templates"("id") ON DELETE set null;
ALTER TABLE "audit_assignments" ADD CONSTRAINT "audit_assignments_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE cascade;
ALTER TABLE "audit_checklist_responses" ADD CONSTRAINT "audit_checklist_responses_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE cascade;
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE cascade;
ALTER TABLE "audit_evidence" ADD CONSTRAINT "audit_evidence_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE cascade;
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE cascade;
ALTER TABLE "audit_revisions" ADD CONSTRAINT "audit_revisions_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE cascade;

CREATE INDEX IF NOT EXISTS "compliance_audits_org_idx" ON "compliance_audits" ("organization_id");
CREATE INDEX IF NOT EXISTS "compliance_audits_status_idx" ON "compliance_audits" ("status");
CREATE INDEX IF NOT EXISTS "compliance_audits_planned_start_idx" ON "compliance_audits" ("planned_start");
CREATE INDEX IF NOT EXISTS "audit_findings_audit_idx" ON "audit_findings" ("audit_id");
CREATE INDEX IF NOT EXISTS "audit_templates_org_idx" ON "audit_templates" ("organization_id");

-- System audit types
INSERT INTO audit_types (id, organization_id, key, name, description, is_system) VALUES
  ('00000000-0000-4000-8000-000000000801', NULL, 'internal_audit', 'Internal Audit', 'Internal management system audit', true),
  ('00000000-0000-4000-8000-000000000802', NULL, 'external_audit', 'External Audit', 'Third-party certification audit', true),
  ('00000000-0000-4000-8000-000000000803', NULL, 'supplier_audit', 'Supplier Audit', 'Supplier compliance audit', true),
  ('00000000-0000-4000-8000-000000000804', NULL, 'site_inspection', 'Site Inspection', 'On-site safety inspection', true),
  ('00000000-0000-4000-8000-000000000805', NULL, 'iso_45001_audit', 'ISO 45001 Audit', 'Occupational health and safety management audit', true),
  ('00000000-0000-4000-8000-000000000806', NULL, 'iso_9001_audit', 'ISO 9001 Audit', 'Quality management system audit', true),
  ('00000000-0000-4000-8000-000000000807', NULL, 'iso_14001_audit', 'ISO 14001 Audit', 'Environmental management system audit', true),
  ('00000000-0000-4000-8000-000000000808', NULL, 'fire_safety_inspection', 'Fire Safety Inspection', 'Fire safety compliance inspection', true),
  ('00000000-0000-4000-8000-000000000809', NULL, 'cdm_audit', 'CDM Audit', 'Construction design and management audit', true)
ON CONFLICT (id) DO NOTHING;

-- New audit permissions
INSERT INTO permissions (id, key, name, description, domain) VALUES
  (gen_random_uuid(), 'consultancy.audit.create', 'Audit Create', 'Create compliance audits', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit.update', 'Audit Update', 'Update compliance audits', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit.delete', 'Audit Delete', 'Delete compliance audits', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit.assign', 'Audit Assign', 'Assign audit team members', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit.approve', 'Audit Approve', 'Approve audit reports', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit.close', 'Audit Close', 'Close audits', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit.export', 'Audit Export', 'Export audit data', 'consultancy'),
  (gen_random_uuid(), 'consultancy.audit-template.manage', 'Audit Template Manage', 'Manage audit templates', 'consultancy'),
  (gen_random_uuid(), 'consultancy.checklist.manage', 'Checklist Manage', 'Manage audit checklists', 'consultancy'),
  (gen_random_uuid(), 'consultancy.evidence.upload', 'Evidence Upload', 'Upload audit evidence', 'consultancy')
ON CONFLICT (key) DO NOTHING;

-- Demo audit for Acme Manufacturing
INSERT INTO compliance_audits (id, organization_id, audit_type_id, name, site, department, standard, scope, status, planned_start, planned_end, priority, risk_rating) VALUES
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000805', 'ISO 45001 Surveillance Audit', 'Head Office', 'Operations', 'ISO 45001:2018', 'OH&S management system', 'scheduled', now() + interval '14 days', now() + interval '16 days', 'high', 'moderate')
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_findings (audit_id, organization_id, title, description, severity, status, category) VALUES
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000002', 'Incomplete risk assessment register', 'Three departments missing updated risk assessments', 'major', 'open', 'Risk Management')
ON CONFLICT DO NOTHING;
