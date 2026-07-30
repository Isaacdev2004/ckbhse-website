-- Milestone 2.7 Part 2 — CMS foundation (versioned public content)

CREATE TYPE "cms_content_type" AS ENUM(
  'site_config',
  'home',
  'hub',
  'corporate',
  'service',
  'industry',
  'course',
  'resource',
  'case_study',
  'testimonial',
  'client_success',
  'legal',
  'contact',
  'careers'
);

CREATE TYPE "cms_entry_status" AS ENUM(
  'draft',
  'scheduled',
  'published',
  'archived'
);

CREATE TABLE IF NOT EXISTS "cms_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "content_type" "cms_content_type" NOT NULL,
  "slug" text NOT NULL,
  "path" text NOT NULL,
  "title" text NOT NULL,
  "status" "cms_entry_status" DEFAULT 'draft' NOT NULL,
  "locale" text DEFAULT 'en-GB' NOT NULL,
  "category" text,
  "segment" text,
  "seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "review_due_at" timestamp with time zone,
  "scheduled_at" timestamp with time zone,
  "published_at" timestamp with time zone,
  "current_version_id" uuid,
  "published_version_id" uuid,
  "requires_client_approval" boolean DEFAULT false NOT NULL,
  "client_approved_at" timestamp with time zone,
  "client_approved_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "cms_entries_path_locale_uidx"
  ON "cms_entries" ("path", "locale");

CREATE TABLE IF NOT EXISTS "cms_entry_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entry_id" uuid NOT NULL REFERENCES "cms_entries"("id") ON DELETE CASCADE,
  "version_number" integer NOT NULL,
  "payload" jsonb NOT NULL,
  "change_summary" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "cms_entry_versions_entry_version_uidx" UNIQUE ("entry_id", "version_number")
);

ALTER TABLE "cms_entries"
  ADD CONSTRAINT "cms_entries_current_version_fkey"
  FOREIGN KEY ("current_version_id") REFERENCES "cms_entry_versions"("id") ON DELETE SET NULL;

ALTER TABLE "cms_entries"
  ADD CONSTRAINT "cms_entries_published_version_fkey"
  FOREIGN KEY ("published_version_id") REFERENCES "cms_entry_versions"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "cms_entries_content_type_idx" ON "cms_entries" ("content_type");
CREATE INDEX IF NOT EXISTS "cms_entries_status_idx" ON "cms_entries" ("status");
CREATE INDEX IF NOT EXISTS "cms_entry_versions_entry_id_idx" ON "cms_entry_versions" ("entry_id");
