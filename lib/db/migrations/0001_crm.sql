-- Milestone 2.2 — CRM foundation tables and outbox worker columns

ALTER TYPE "outbox_status" ADD VALUE IF NOT EXISTS 'dead_letter';
--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN IF NOT EXISTS "next_attempt_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outbox_next_attempt_at_idx" ON "outbox" ("next_attempt_at");
--> statement-breakpoint

CREATE TYPE "lead_status" AS ENUM(
  'new',
  'acknowledged',
  'qualified',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
  'archived'
);
--> statement-breakpoint
CREATE TYPE "lead_priority" AS ENUM('low', 'normal', 'high', 'urgent');
--> statement-breakpoint
CREATE TYPE "lead_source" AS ENUM(
  'website',
  'referral',
  'phone',
  'email',
  'event',
  'partner',
  'other'
);
--> statement-breakpoint
CREATE TYPE "lead_activity_type" AS ENUM(
  'email_sent',
  'status_changed',
  'assignment',
  'phone_call',
  'meeting',
  'document_uploaded',
  'reminder',
  'note_added',
  'lead_created'
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "contact_request_id" uuid,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "company" text,
  "service_interest" text NOT NULL,
  "industry" text,
  "training_interest" text,
  "message" text,
  "status" "lead_status" DEFAULT 'new' NOT NULL,
  "priority" "lead_priority" DEFAULT 'normal' NOT NULL,
  "source" "lead_source" DEFAULT 'website' NOT NULL,
  "assigned_to_user_id" uuid,
  "score" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "leads_contact_request_unique" ON "leads" ("contact_request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_org_idx" ON "leads" ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_priority_idx" ON "leads" ("priority");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_assigned_idx" ON "leads" ("assigned_to_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads" ("created_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lead_sources_org_key_unique" ON "lead_sources" ("organization_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "activity_type" "lead_activity_type" NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "actor_user_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_activities_lead_idx" ON "lead_activities" ("lead_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "body" text NOT NULL,
  "is_internal" boolean DEFAULT true NOT NULL,
  "author_user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_notes_lead_idx" ON "lead_notes" ("lead_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "assigned_to_user_id" uuid NOT NULL,
  "assigned_by_user_id" uuid,
  "reason" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_assignments_lead_idx" ON "lead_assignments" ("lead_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "color" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lead_tags_org_name_unique" ON "lead_tags" ("organization_id", "name");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_tag_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lead_tag_links_unique" ON "lead_tag_links" ("lead_id", "tag_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_reminders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "title" text NOT NULL,
  "due_at" timestamp with time zone NOT NULL,
  "priority" "lead_priority" DEFAULT 'normal' NOT NULL,
  "completed_at" timestamp with time zone,
  "assigned_to_user_id" uuid,
  "is_recurring" boolean DEFAULT false NOT NULL,
  "recurrence_rule" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "updated_by" uuid
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_reminders_due_at_idx" ON "lead_reminders" ("due_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "score" integer NOT NULL,
  "factors" jsonb,
  "computed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_scores_lead_idx" ON "lead_scores" ("lead_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lead_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "from_status" "lead_status",
  "to_status" "lead_status" NOT NULL,
  "changed_by_user_id" uuid,
  "reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_status_history_lead_idx" ON "lead_status_history" ("lead_id");
