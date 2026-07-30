-- Milestone 2.4 — Client Portal & Organization Workspace

CREATE TYPE "project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE "document_status" AS ENUM('active', 'archived', 'expired');
CREATE TYPE "action_status" AS ENUM('open', 'in_progress', 'overdue', 'completed');
CREATE TYPE "action_priority" AS ENUM('low', 'medium', 'high', 'critical');
CREATE TYPE "incident_severity" AS ENUM('low', 'medium', 'high', 'critical');
CREATE TYPE "incident_status" AS ENUM('reported', 'investigating', 'corrective_action', 'closed');
CREATE TYPE "audit_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "support_ticket_status" AS ENUM('open', 'in_progress', 'awaiting_client', 'resolved', 'closed');
CREATE TYPE "support_ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');
CREATE TYPE "certificate_type" AS ENUM('iso', 'training', 'compliance', 'inspection', 'audit');
CREATE TYPE "organization_member_status" AS ENUM('invited', 'active', 'suspended', 'deactivated');
CREATE TYPE "activity_kind" AS ENUM('auth', 'project', 'document', 'training', 'audit', 'incident', 'message', 'support', 'profile', 'system');

CREATE TABLE IF NOT EXISTS "organization_profiles" (
  "organization_id" uuid PRIMARY KEY NOT NULL,
  "registration_number" text,
  "industry" text,
  "primary_contact_name" text,
  "primary_contact_email" text,
  "secondary_contacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "address" jsonb,
  "locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "account_tier" text,
  "subscription" text,
  "renewal_date" timestamp with time zone,
  "assigned_consultant_id" uuid,
  "primary_auditor_id" uuid,
  "training_manager_id" uuid,
  "compliance_manager_id" uuid,
  "logo_url" text,
  "accreditations" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "risk_profile" text,
  "health_score" integer,
  "compliance_score" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "department" text,
  "site" text,
  "status" "organization_member_status" DEFAULT 'active' NOT NULL,
  "invited_at" timestamp with time zone,
  "joined_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "organization_settings" (
  "organization_id" uuid PRIMARY KEY NOT NULL,
  "preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "notification_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "branding" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "timezone" text DEFAULT 'Europe/London' NOT NULL,
  "language" text DEFAULT 'en-GB' NOT NULL,
  "document_defaults" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "security_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" "project_status" DEFAULT 'planning' NOT NULL,
  "progress_percent" integer DEFAULT 0 NOT NULL,
  "start_date" timestamp with time zone,
  "end_date" timestamp with time zone,
  "consultant_id" uuid,
  "service_type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "project_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" "action_status" DEFAULT 'open' NOT NULL,
  "assignee_user_id" uuid,
  "due_date" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "project_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "author_user_id" uuid NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "folder_id" uuid,
  "name" text NOT NULL,
  "category" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "storage_key" text NOT NULL,
  "mime_type" text,
  "size_bytes" integer,
  "owner_user_id" uuid,
  "expires_at" timestamp with time zone,
  "status" "document_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "organization_document_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "document_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "version_number" integer NOT NULL,
  "storage_key" text NOT NULL,
  "uploaded_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "certificate_type" "certificate_type" NOT NULL,
  "issued_at" timestamp with time zone NOT NULL,
  "expires_at" timestamp with time zone,
  "verification_status" text DEFAULT 'valid' NOT NULL,
  "storage_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_actions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" "action_status" DEFAULT 'open' NOT NULL,
  "priority" "action_priority" DEFAULT 'medium' NOT NULL,
  "owner_user_id" uuid,
  "due_date" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "organization_incidents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "severity" "incident_severity" DEFAULT 'medium' NOT NULL,
  "status" "incident_status" DEFAULT 'reported' NOT NULL,
  "owner_user_id" uuid,
  "reported_at" timestamp with time zone DEFAULT now() NOT NULL,
  "closed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "organization_audits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "auditor_id" uuid,
  "scheduled_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  "status" "audit_status" DEFAULT 'scheduled' NOT NULL,
  "score" integer,
  "report_storage_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "subject" text NOT NULL,
  "category" text,
  "priority" "support_ticket_priority" DEFAULT 'medium' NOT NULL,
  "status" "support_ticket_status" DEFAULT 'open' NOT NULL,
  "requester_user_id" uuid NOT NULL,
  "assignee_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "support_ticket_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ticket_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "author_user_id" uuid NOT NULL,
  "body" text NOT NULL,
  "is_staff" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_message_threads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "subject" text NOT NULL,
  "last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "thread_id" uuid NOT NULL,
  "sender_user_id" uuid NOT NULL,
  "body" text NOT NULL,
  "is_internal" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "organization_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "kind" "activity_kind" NOT NULL,
  "summary" text NOT NULL,
  "entity_type" text,
  "entity_id" uuid,
  "actor_user_id" uuid,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "compliance_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "due_date" timestamp with time zone,
  "status" "action_status" DEFAULT 'open' NOT NULL,
  "register_type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

-- Foreign keys
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_organization_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."organization_projects"("id") ON DELETE cascade;
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_organization_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."organization_projects"("id") ON DELETE cascade;
ALTER TABLE "organization_documents" ADD CONSTRAINT "organization_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_document_versions" ADD CONSTRAINT "organization_document_versions_document_id_organization_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."organization_documents"("id") ON DELETE cascade;
ALTER TABLE "organization_certificates" ADD CONSTRAINT "organization_certificates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_actions" ADD CONSTRAINT "organization_actions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_incidents" ADD CONSTRAINT "organization_incidents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_audits" ADD CONSTRAINT "organization_audits_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade;
ALTER TABLE "organization_message_threads" ADD CONSTRAINT "organization_message_threads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "organization_messages" ADD CONSTRAINT "organization_messages_thread_id_organization_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."organization_message_threads"("id") ON DELETE cascade;
ALTER TABLE "organization_activities" ADD CONSTRAINT "organization_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;

-- Indexes
CREATE INDEX IF NOT EXISTS "organization_profiles_industry_idx" ON "organization_profiles" ("industry");
CREATE INDEX IF NOT EXISTS "organization_members_org_idx" ON "organization_members" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_projects_org_idx" ON "organization_projects" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_documents_org_idx" ON "organization_documents" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_certificates_org_idx" ON "organization_certificates" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_actions_org_idx" ON "organization_actions" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_incidents_org_idx" ON "organization_incidents" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_audits_org_idx" ON "organization_audits" ("organization_id");
CREATE INDEX IF NOT EXISTS "support_tickets_org_idx" ON "support_tickets" ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_activities_org_idx" ON "organization_activities" ("organization_id");
CREATE INDEX IF NOT EXISTS "compliance_tasks_org_idx" ON "compliance_tasks" ("organization_id");

-- Client portal roles
INSERT INTO roles (id, key, name, description, is_system) VALUES
  ('00000000-0000-4000-8000-000000000101', 'compliance_manager', 'Compliance Manager', 'Client compliance oversight', true),
  ('00000000-0000-4000-8000-000000000102', 'training_manager', 'Training Manager', 'Client training oversight', true),
  ('00000000-0000-4000-8000-000000000103', 'hr_manager', 'HR Manager', 'Client HR workspace access', true),
  ('00000000-0000-4000-8000-000000000104', 'viewer', 'Viewer', 'Read-only client portal access', true),
  ('00000000-0000-4000-8000-000000000105', 'external_contractor', 'External Contractor', 'Limited client portal access', true),
  ('00000000-0000-4000-8000-000000000106', 'department_manager', 'Department Manager', 'Department-scoped client access', true),
  ('00000000-0000-4000-8000-000000000107', 'site_manager', 'Site Manager', 'Site-scoped client access', true)
ON CONFLICT (key) DO NOTHING;

-- Demo client organisation seed
INSERT INTO organizations (id, name, slug, status, type) VALUES
  ('00000000-0000-4000-8000-000000000002', 'Acme Manufacturing Ltd', 'acme-manufacturing', 'active', 'client')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, first_name, last_name, status, password_hash, email_verified_at) VALUES
  ('00000000-0000-4000-8000-000000000020', 'client@acme.example.com', 'Alex', 'Morgan', 'active', '$argon2id$v=19$m=65536,p=4,t=3$/N18LYPQyHhe9GJd3/V4Kg$fmekorp4Kg0OnjDgsknvBJFjgSwAZYl69Catdiz/rYQ', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (id, user_id, role_id, organization_id) SELECT gen_random_uuid(), '00000000-0000-4000-8000-000000000020', r.id, '00000000-0000-4000-8000-000000000002'
FROM roles r WHERE r.key = 'organization_admin'
ON CONFLICT DO NOTHING;

INSERT INTO organization_profiles (organization_id, registration_number, industry, primary_contact_name, primary_contact_email, account_tier, subscription, compliance_score, health_score, risk_profile, accreditations) VALUES
  ('00000000-0000-4000-8000-000000000002', '12345678', 'Manufacturing', 'Alex Morgan', 'client@acme.example.com', 'Enterprise', 'Annual Compliance', 87, 92, 'moderate', '["ISO 45001","ISO 14001"]'::jsonb)
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO organization_settings (organization_id) VALUES ('00000000-0000-4000-8000-000000000002') ON CONFLICT DO NOTHING;

INSERT INTO organization_members (id, organization_id, user_id, department, site, status, joined_at) VALUES
  ('00000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', 'Operations', 'Head Office', 'active', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_projects (id, organization_id, name, description, status, progress_percent, service_type, start_date) VALUES
  ('00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000002', 'ISO 45001 Certification Support', 'End-to-end certification programme', 'active', 65, 'ISO Management', now() - interval '30 days'),
  ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000002', 'Health & Safety Audit 2026', 'Annual compliance audit', 'planning', 10, 'Consultancy Audit', now() + interval '14 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_documents (id, organization_id, name, category, storage_key, mime_type, size_bytes, status) VALUES
  ('00000000-0000-4000-8000-000000000050', '00000000-0000-4000-8000-000000000002', 'Health & Safety Policy 2026.pdf', 'Policies', 'org/acme/policies/hse-policy-2026.pdf', 'application/pdf', 245000, 'active'),
  ('00000000-0000-4000-8000-000000000051', '00000000-0000-4000-8000-000000000002', 'Risk Assessment Template.docx', 'Templates', 'org/acme/templates/risk-assessment.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 89000, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_certificates (id, organization_id, name, certificate_type, issued_at, expires_at, verification_status) VALUES
  ('00000000-0000-4000-8000-000000000060', '00000000-0000-4000-8000-000000000002', 'ISO 45001:2018', 'iso', now() - interval '180 days', now() + interval '185 days', 'valid'),
  ('00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000002', 'Fire Safety Training', 'training', now() - interval '90 days', now() + interval '275 days', 'valid')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_actions (id, organization_id, title, status, priority, due_date) VALUES
  ('00000000-0000-4000-8000-000000000070', '00000000-0000-4000-8000-000000000002', 'Update emergency evacuation plan', 'open', 'high', now() + interval '7 days'),
  ('00000000-0000-4000-8000-000000000071', '00000000-0000-4000-8000-000000000002', 'Complete quarterly safety inspection', 'in_progress', 'medium', now() + interval '14 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_audits (id, organization_id, title, scheduled_at, status) VALUES
  ('00000000-0000-4000-8000-000000000080', '00000000-0000-4000-8000-000000000002', 'Q3 Internal Audit', now() + interval '21 days', 'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_incidents (id, organization_id, title, severity, status, reported_at) VALUES
  ('00000000-0000-4000-8000-000000000090', '00000000-0000-4000-8000-000000000002', 'Minor slip in warehouse', 'low', 'investigating', now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO support_tickets (id, organization_id, subject, category, priority, status, requester_user_id) VALUES
  ('00000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000002', 'Question about audit preparation', 'Consultancy', 'medium', 'open', '00000000-0000-4000-8000-000000000020')
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_tasks (id, organization_id, title, register_type, due_date, status) VALUES
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000002', 'Review legal register', 'legal_register', now() + interval '30 days', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_activities (id, organization_id, kind, summary, entity_type, entity_id, actor_user_id) VALUES
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000002', 'project', 'ISO 45001 project updated to 65% complete', 'project', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000020'),
  ('00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000002', 'document', 'Health & Safety Policy uploaded', 'document', '00000000-0000-4000-8000-000000000050', '00000000-0000-4000-8000-000000000020')
ON CONFLICT (id) DO NOTHING;
