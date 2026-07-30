-- Milestone 2.6 Part 2B.2 — Enterprise Risk Management & Hazard Registers

CREATE TYPE "risk_assessment_status" AS ENUM(
  'draft',
  'active',
  'under_review',
  'approved',
  'archived'
);

CREATE TYPE "risk_assessment_type" AS ENUM(
  'general',
  'workplace',
  'project',
  'activity',
  'bowtie'
);

CREATE TYPE "hazard_category" AS ENUM(
  'physical',
  'chemical',
  'biological',
  'ergonomic',
  'psychosocial',
  'environmental',
  'other'
);

CREATE TYPE "hazard_status" AS ENUM(
  'identified',
  'assessed',
  'controlled',
  'monitored',
  'closed'
);

CREATE TYPE "risk_treatment_type" AS ENUM(
  'eliminate',
  'substitute',
  'engineer',
  'administrative',
  'ppe',
  'transfer'
);

CREATE TYPE "risk_treatment_status" AS ENUM(
  'planned',
  'in_progress',
  'completed',
  'verified'
);

CREATE TYPE "risk_review_outcome" AS ENUM(
  'acceptable',
  'requires_action',
  'escalate'
);

CREATE TYPE "bowtie_element_type" AS ENUM(
  'threat',
  'top_event',
  'consequence',
  'preventive_barrier',
  'recovery_barrier'
);

CREATE TABLE IF NOT EXISTS "risk_matrix_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "likelihood_levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "severity_levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "rating_thresholds" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "risk_assessments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "assessment_number" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "assessment_type" "risk_assessment_type" DEFAULT 'workplace' NOT NULL,
  "status" "risk_assessment_status" DEFAULT 'draft' NOT NULL,
  "site" text,
  "department" text,
  "activity" text,
  "matrix_config_id" uuid,
  "inherent_likelihood" integer,
  "inherent_severity" integer,
  "inherent_score" integer,
  "inherent_rating" text,
  "residual_likelihood" integer,
  "residual_severity" integer,
  "residual_score" integer,
  "residual_rating" text,
  "owner_id" uuid,
  "assigned_to" uuid,
  "review_due_date" timestamp with time zone,
  "approved_at" timestamp with time zone,
  "approved_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by" uuid,
  "updated_by" uuid,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "hazard_register" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "hazard_number" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "category" "hazard_category" DEFAULT 'physical' NOT NULL,
  "status" "hazard_status" DEFAULT 'identified' NOT NULL,
  "risk_assessment_id" uuid,
  "location" text,
  "activity" text,
  "existing_controls" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "inherent_likelihood" integer,
  "inherent_severity" integer,
  "inherent_score" integer,
  "inherent_rating" text,
  "residual_likelihood" integer,
  "residual_severity" integer,
  "residual_score" integer,
  "residual_rating" text,
  "owner_id" uuid,
  "review_due_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by" uuid,
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "risk_treatment_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "risk_assessment_id" uuid,
  "hazard_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "treatment_type" "risk_treatment_type" DEFAULT 'administrative' NOT NULL,
  "status" "risk_treatment_status" DEFAULT 'planned' NOT NULL,
  "owner_id" uuid,
  "due_date" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "effectiveness_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "risk_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "risk_assessment_id" uuid NOT NULL,
  "review_date" timestamp with time zone DEFAULT now() NOT NULL,
  "reviewed_by" uuid,
  "outcome" "risk_review_outcome" DEFAULT 'acceptable' NOT NULL,
  "notes" text,
  "next_review_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "risk_bowtie_elements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "risk_assessment_id" uuid NOT NULL,
  "element_type" "bowtie_element_type" NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "linked_element_id" uuid,
  "effectiveness" text,
  "position" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "risk_matrix_configs" ADD CONSTRAINT "risk_matrix_configs_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_matrix_fk" FOREIGN KEY ("matrix_config_id") REFERENCES "public"."risk_matrix_configs"("id") ON DELETE set null;
ALTER TABLE "hazard_register" ADD CONSTRAINT "hazard_register_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "hazard_register" ADD CONSTRAINT "hazard_register_assessment_fk" FOREIGN KEY ("risk_assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE set null;
ALTER TABLE "risk_treatment_plans" ADD CONSTRAINT "risk_treatment_plans_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "risk_treatment_plans" ADD CONSTRAINT "risk_treatment_plans_assessment_fk" FOREIGN KEY ("risk_assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE cascade;
ALTER TABLE "risk_treatment_plans" ADD CONSTRAINT "risk_treatment_plans_hazard_fk" FOREIGN KEY ("hazard_id") REFERENCES "public"."hazard_register"("id") ON DELETE cascade;
ALTER TABLE "risk_reviews" ADD CONSTRAINT "risk_reviews_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "risk_reviews" ADD CONSTRAINT "risk_reviews_assessment_fk" FOREIGN KEY ("risk_assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE cascade;
ALTER TABLE "risk_bowtie_elements" ADD CONSTRAINT "risk_bowtie_elements_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade;
ALTER TABLE "risk_bowtie_elements" ADD CONSTRAINT "risk_bowtie_elements_assessment_fk" FOREIGN KEY ("risk_assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE cascade;

CREATE UNIQUE INDEX IF NOT EXISTS "risk_assessments_number_org_idx" ON "risk_assessments" ("organization_id", "assessment_number");
CREATE INDEX IF NOT EXISTS "risk_assessments_org_idx" ON "risk_assessments" ("organization_id");
CREATE INDEX IF NOT EXISTS "risk_assessments_status_idx" ON "risk_assessments" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "hazard_register_number_org_idx" ON "hazard_register" ("organization_id", "hazard_number");
CREATE INDEX IF NOT EXISTS "hazard_register_org_idx" ON "hazard_register" ("organization_id");
CREATE INDEX IF NOT EXISTS "hazard_register_assessment_idx" ON "hazard_register" ("risk_assessment_id");

INSERT INTO risk_matrix_configs (id, organization_id, name, likelihood_levels, severity_levels, rating_thresholds, is_default) VALUES
  (
    '00000000-0000-4000-8000-000000000801',
    '00000000-0000-4000-8000-000000000002',
    'Standard 5×5 Matrix',
    '[{"value":1,"label":"Rare"},{"value":2,"label":"Unlikely"},{"value":3,"label":"Possible"},{"value":4,"label":"Likely"},{"value":5,"label":"Almost Certain"}]'::jsonb,
    '[{"value":1,"label":"Negligible"},{"value":2,"label":"Minor"},{"value":3,"label":"Moderate"},{"value":4,"label":"Major"},{"value":5,"label":"Catastrophic"}]'::jsonb,
    '[{"min":1,"max":4,"rating":"low","color":"green"},{"min":5,"max":9,"rating":"medium","color":"yellow"},{"min":10,"max":15,"rating":"high","color":"orange"},{"min":16,"max":25,"rating":"critical","color":"red"}]'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO risk_assessments (id, organization_id, assessment_number, title, description, assessment_type, status, site, department, activity, matrix_config_id, inherent_likelihood, inherent_severity, inherent_score, inherent_rating, residual_likelihood, residual_severity, residual_score, residual_rating, review_due_date) VALUES
  (
    '00000000-0000-4000-8000-000000000802',
    '00000000-0000-4000-8000-000000000002',
    'RA-2026-001',
    'Warehouse Manual Handling',
    'Assessment of manual handling risks in the main warehouse',
    'workplace',
    'active',
    'Head Office',
    'Operations',
    'Goods receipt and dispatch',
    '00000000-0000-4000-8000-000000000801',
    4, 3, 12, 'high',
    2, 2, 4, 'low',
    now() + interval '90 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO hazard_register (id, organization_id, hazard_number, title, description, category, status, risk_assessment_id, location, inherent_likelihood, inherent_severity, inherent_score, inherent_rating, residual_likelihood, residual_severity, residual_score, residual_rating, existing_controls) VALUES
  (
    '00000000-0000-4000-8000-000000000803',
    '00000000-0000-4000-8000-000000000002',
    'HZ-2026-001',
    'Heavy load lifting',
    'Workers lifting loads exceeding recommended limits without mechanical aids',
    'ergonomic',
    'controlled',
    '00000000-0000-4000-8000-000000000802',
    'Warehouse bay 3',
    4, 4, 16, 'critical',
    2, 3, 6, 'medium',
    '["Manual handling training", "Weight limit signage"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO risk_treatment_plans (id, organization_id, risk_assessment_id, hazard_id, title, treatment_type, status, due_date) VALUES
  (
    '00000000-0000-4000-8000-000000000804',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000802',
    '00000000-0000-4000-8000-000000000803',
    'Install pallet trucks on all bays',
    'engineer',
    'in_progress',
    now() + interval '45 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO risk_reviews (organization_id, risk_assessment_id, outcome, notes, next_review_date) VALUES
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000802',
    'requires_action',
    'Residual risk acceptable once pallet trucks deployed',
    now() + interval '90 days'
  )
ON CONFLICT DO NOTHING;

INSERT INTO risk_bowtie_elements (organization_id, risk_assessment_id, element_type, title, description) VALUES
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000802',
    'top_event',
    'Musculoskeletal injury from manual handling',
    'Worker sustains back or shoulder injury during load lifting'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000802',
    'preventive_barrier',
    'Mechanical handling aids',
    'Pallet trucks and trollies available at each bay'
  )
ON CONFLICT DO NOTHING;
