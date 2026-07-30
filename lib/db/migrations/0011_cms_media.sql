-- Milestone 2.7 Part 3 — CMS media library

CREATE TABLE IF NOT EXISTS "cms_media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL,
  "filename" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" bigint NOT NULL,
  "alt_text" text,
  "caption" text,
  "storage_key" text NOT NULL,
  "public_url" text NOT NULL,
  "usage_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "cms_media_assets_key_uidx" ON "cms_media_assets" ("key");
CREATE INDEX IF NOT EXISTS "cms_media_assets_mime_type_idx" ON "cms_media_assets" ("mime_type");

INSERT INTO "feature_flags" ("id", "key", "enabled", "description", "organization_id")
VALUES (
  '00000000-0000-4000-8000-000000000701',
  'cms.database_content',
  false,
  'Serve public website content from CMS database snapshots instead of file-only mode',
  NULL
) ON CONFLICT DO NOTHING;
