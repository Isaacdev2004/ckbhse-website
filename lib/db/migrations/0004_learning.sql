-- Milestone 2.5 — Enterprise Learning Management System (LMS)

CREATE TYPE "enrollment_status" AS ENUM(
  'pending_approval',
  'active',
  'waitlisted',
  'cancelled',
  'completed',
  'expired'
);

CREATE TYPE "enrollment_source" AS ENUM(
  'self',
  'manager',
  'administrator',
  'automatic',
  'mandatory',
  'bulk',
  'invitation'
);

CREATE TYPE "progress_status" AS ENUM(
  'not_started',
  'started',
  'in_progress',
  'completed',
  'failed',
  'expired',
  'renewal_required',
  'abandoned'
);

CREATE TYPE "session_delivery" AS ENUM(
  'instructor_led',
  'virtual',
  'classroom',
  'on_site',
  'hybrid',
  'self_paced'
);

CREATE TYPE "session_status" AS ENUM(
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE "attendance_status" AS ENUM(
  'registered',
  'present',
  'absent',
  'late',
  'cancelled',
  'completed'
);

CREATE TYPE "question_type" AS ENUM(
  'multiple_choice',
  'true_false',
  'short_answer',
  'long_answer',
  'file_upload'
);

CREATE TYPE "certificate_kind" AS ENUM(
  'course',
  'cpd',
  'compliance',
  'attendance'
);

CREATE TYPE "certificate_status" AS ENUM(
  'issued',
  'expired',
  'revoked',
  'renewal_required'
);

CREATE TABLE IF NOT EXISTS "learning_pathways" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "estimated_hours" integer DEFAULT 0 NOT NULL,
  "certification_name" text,
  "cpd_hours" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "learning_pathway_courses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pathway_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_mandatory" boolean DEFAULT true NOT NULL,
  "prerequisite_course_slug" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "training_enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "pathway_id" uuid,
  "status" "enrollment_status" DEFAULT 'active' NOT NULL,
  "source" "enrollment_source" DEFAULT 'self' NOT NULL,
  "is_mandatory" boolean DEFAULT false NOT NULL,
  "assigned_by" uuid,
  "department" text,
  "site" text,
  "approved_at" timestamp with time zone,
  "enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "training_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "enrollment_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "status" "progress_status" DEFAULT 'not_started' NOT NULL,
  "completion_percent" integer DEFAULT 0 NOT NULL,
  "time_spent_minutes" integer DEFAULT 0 NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "last_activity_at" timestamp with time zone,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "bookmarked" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "course_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "trainer_id" uuid,
  "title" text NOT NULL,
  "delivery" "session_delivery" DEFAULT 'virtual' NOT NULL,
  "status" "session_status" DEFAULT 'scheduled' NOT NULL,
  "location" text,
  "meeting_url" text,
  "capacity" integer DEFAULT 20 NOT NULL,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "resources" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "course_attendance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "enrollment_id" uuid,
  "status" "attendance_status" DEFAULT 'registered' NOT NULL,
  "attendance_percent" integer DEFAULT 0 NOT NULL,
  "trainer_notes" text,
  "evidence_url" text,
  "checked_in_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "course_assessments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "passing_score" integer DEFAULT 70 NOT NULL,
  "max_attempts" integer DEFAULT 3 NOT NULL,
  "time_limit_minutes" integer,
  "randomize_questions" boolean DEFAULT false NOT NULL,
  "review_mode" boolean DEFAULT true NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessment_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "assessment_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "question_type" "question_type" NOT NULL,
  "prompt" text NOT NULL,
  "options" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "correct_answer" text,
  "points" integer DEFAULT 1 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessment_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "assessment_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "enrollment_id" uuid,
  "attempt_number" integer DEFAULT 1 NOT NULL,
  "score" integer,
  "passed" boolean,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "submitted_at" timestamp with time zone,
  "time_spent_seconds" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessment_answers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "attempt_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "answer" text,
  "is_correct" boolean,
  "points_awarded" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "course_certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "enrollment_id" uuid,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "certificate_number" text NOT NULL,
  "kind" "certificate_kind" DEFAULT 'course' NOT NULL,
  "status" "certificate_status" DEFAULT 'issued' NOT NULL,
  "issued_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone,
  "verification_code" text,
  "download_url" text,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "cpd_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "course_category" text,
  "course_slug" text,
  "category" text NOT NULL,
  "hours" numeric(6, 2) NOT NULL,
  "earned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "renewal_due_at" timestamp with time zone,
  "certificate_id" uuid,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trainer_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "trainer_id" uuid NOT NULL,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "is_primary" boolean DEFAULT true NOT NULL,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "course_feedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "course_category" text NOT NULL,
  "course_slug" text NOT NULL,
  "enrollment_id" uuid,
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "learning_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "notification_type" text NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "action_path" text,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "learning_transcripts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "generated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Foreign keys
ALTER TABLE "learning_pathways" ADD CONSTRAINT "learning_pathways_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "learning_pathway_courses" ADD CONSTRAINT "learning_pathway_courses_pathway_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."learning_pathways"("id") ON DELETE cascade;
ALTER TABLE "learning_pathway_courses" ADD CONSTRAINT "learning_pathway_courses_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_pathway_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."learning_pathways"("id") ON DELETE set null;
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."training_enrollments"("id") ON DELETE cascade;
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_trainer_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE set null;
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."course_sessions"("id") ON DELETE cascade;
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "course_assessments" ADD CONSTRAINT "course_assessments_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."course_assessments"("id") ON DELETE cascade;
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."course_assessments"("id") ON DELETE cascade;
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade;
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "cpd_records" ADD CONSTRAINT "cpd_records_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "cpd_records" ADD CONSTRAINT "cpd_records_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_trainer_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "learning_notifications" ADD CONSTRAINT "learning_notifications_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "learning_notifications" ADD CONSTRAINT "learning_notifications_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "learning_transcripts" ADD CONSTRAINT "learning_transcripts_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "learning_transcripts" ADD CONSTRAINT "learning_transcripts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;

-- Indexes
CREATE INDEX IF NOT EXISTS "learning_pathways_org_idx" ON "learning_pathways" ("organization_id");
CREATE INDEX IF NOT EXISTS "training_enrollments_org_user_idx" ON "training_enrollments" ("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "training_enrollments_course_idx" ON "training_enrollments" ("course_category", "course_slug");
CREATE INDEX IF NOT EXISTS "training_progress_enrollment_idx" ON "training_progress" ("enrollment_id");
CREATE INDEX IF NOT EXISTS "course_sessions_org_idx" ON "course_sessions" ("organization_id");
CREATE INDEX IF NOT EXISTS "course_attendance_session_idx" ON "course_attendance" ("session_id");
CREATE INDEX IF NOT EXISTS "course_assessments_org_idx" ON "course_assessments" ("organization_id");
CREATE INDEX IF NOT EXISTS "assessment_attempts_user_idx" ON "assessment_attempts" ("user_id", "assessment_id");
CREATE INDEX IF NOT EXISTS "course_certificates_org_user_idx" ON "course_certificates" ("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "cpd_records_org_user_idx" ON "cpd_records" ("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "trainer_assignments_trainer_idx" ON "trainer_assignments" ("trainer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "course_certificates_number_idx" ON "course_certificates" ("certificate_number");

-- Demo LMS seed (Acme Manufacturing)
INSERT INTO learning_pathways (id, organization_id, slug, title, description, estimated_hours, certification_name, cpd_hours) VALUES
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000002', 'health-safety-manager', 'Health & Safety Manager', 'Structured pathway for health and safety leadership', 120, 'Health & Safety Manager Certificate', 40),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000002', 'iso-lead-auditor', 'ISO Lead Auditor', 'Lead auditor competency pathway', 80, 'ISO Lead Auditor Certificate', 32),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000002', 'compliance-officer', 'Compliance Officer', 'Compliance and governance training journey', 60, 'Compliance Officer Certificate', 24)
ON CONFLICT (id) DO NOTHING;

INSERT INTO learning_pathway_courses (pathway_id, organization_id, course_category, course_slug, sort_order, is_mandatory) VALUES
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000002', 'health-safety', 'nebosh-general-certificate', 1, true),
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000002', 'health-safety', 'iosh-managing-safely', 2, true),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000002', 'iso-management', 'iso-9001-lead-auditor', 1, true),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000002', 'compliance-governance', 'compliance-fundamentals', 1, true)
ON CONFLICT DO NOTHING;

INSERT INTO training_enrollments (id, organization_id, user_id, course_category, course_slug, pathway_id, status, source, is_mandatory) VALUES
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', 'health-safety', 'iosh-managing-safely', '00000000-0000-4000-8000-000000000301', 'active', 'manager', true),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', 'health-safety', 'manual-handling', NULL, 'active', 'self', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO training_progress (enrollment_id, organization_id, user_id, status, completion_percent, time_spent_minutes, last_activity_at, started_at) VALUES
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', 'in_progress', 45, 180, now(), now() - interval '3 days'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', 'not_started', 0, 0, NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO course_sessions (id, organization_id, course_category, course_slug, title, delivery, status, location, meeting_url, capacity, starts_at, ends_at) VALUES
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000002', 'health-safety', 'iosh-managing-safely', 'IOSH Managing Safely — Cohort A', 'virtual', 'scheduled', NULL, 'https://meet.example.com/iosh-a', 25, now() + interval '7 days', now() + interval '7 days' + interval '8 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_attendance (session_id, organization_id, user_id, enrollment_id, status) VALUES
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000401', 'registered')
ON CONFLICT DO NOTHING;

INSERT INTO course_assessments (id, organization_id, course_category, course_slug, title, passing_score, max_attempts, time_limit_minutes) VALUES
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000002', 'health-safety', 'iosh-managing-safely', 'IOSH Managing Safely Final Assessment', 70, 3, 60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO assessment_questions (assessment_id, organization_id, question_type, prompt, options, correct_answer, points, sort_order) VALUES
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000002', 'multiple_choice', 'What is the primary purpose of a risk assessment?', '["Eliminate all hazards","Identify hazards and control risks","Reduce training costs","Meet ISO certification"]'::jsonb, 'Identify hazards and control risks', 1, 1),
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000002', 'true_false', 'PPE should be the first line of defence against hazards.', '[]'::jsonb, 'false', 1, 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_certificates (id, organization_id, user_id, enrollment_id, course_category, course_slug, certificate_number, kind, status, issued_at, expires_at, verification_code) VALUES
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', NULL, 'health-safety', 'fire-safety-awareness', 'CKBHSE-TRN-2025-0001', 'course', 'issued', now() - interval '6 months', now() + interval '6 months', 'VERIFY-0001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cpd_records (organization_id, user_id, course_category, course_slug, category, hours, earned_at) VALUES
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000020', 'health-safety', 'fire-safety-awareness', 'Health & Safety', 4.0, now() - interval '6 months')
ON CONFLICT DO NOTHING;
