-- Milestone 2.8 Part 2 — Dashboard platform, widgets, and user layouts

CREATE TYPE "dashboard_widget_type" AS ENUM(
  'metric',
  'trend',
  'table',
  'chart',
  'heatmap',
  'benchmark'
);

CREATE TABLE IF NOT EXISTS "dashboard_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid REFERENCES "organizations"("id") ON DELETE CASCADE,
  "dashboard_key" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "domain" "reporting_domain",
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "dashboard_definitions_org_key_uidx"
  ON "dashboard_definitions" (
    COALESCE("organization_id", '00000000-0000-4000-8000-000000000000'::uuid),
    "dashboard_key"
  );

CREATE TABLE IF NOT EXISTS "dashboard_widgets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "dashboard_id" uuid NOT NULL REFERENCES "dashboard_definitions"("id") ON DELETE CASCADE,
  "widget_key" text NOT NULL,
  "widget_type" "dashboard_widget_type" NOT NULL,
  "title" text NOT NULL,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "default_order" integer DEFAULT 0 NOT NULL,
  "col_span" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "dashboard_widgets_dashboard_key_uidx"
  ON "dashboard_widgets" ("dashboard_id", "widget_key");

CREATE TABLE IF NOT EXISTS "user_dashboard_layouts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "dashboard_key" text NOT NULL,
  "layout" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_dashboard_layouts_org_user_key_uidx"
  ON "user_dashboard_layouts" ("organization_id", "user_id", "dashboard_key");

-- System dashboards (organization_id NULL = available to all tenants)
INSERT INTO "dashboard_definitions" ("id", "organization_id", "dashboard_key", "title", "description", "domain", "is_default")
VALUES
  (
    '00000000-0000-4000-8000-000000000901',
    NULL,
    'executive',
    'Executive Overview',
    'Cross-platform KPI rollup and domain performance',
    'platform',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000902',
    NULL,
    'compliance',
    'Compliance Analytics',
    'Compliance score, findings, and completion metrics',
    'compliance',
    false
  ),
  (
    '00000000-0000-4000-8000-000000000903',
    NULL,
    'audit',
    'Audit Analytics',
    'Audit completion, findings, and overdue tracking',
    'audit',
    false
  ),
  (
    '00000000-0000-4000-8000-000000000904',
    NULL,
    'crm',
    'CRM Pipeline',
    'Lead pipeline, conversion, and response metrics',
    'crm',
    false
  ),
  (
    '00000000-0000-4000-8000-000000000905',
    NULL,
    'learning',
    'Training Analytics',
    'Training completion and learner engagement',
    'learning',
    false
  ),
  (
    '00000000-0000-4000-8000-000000000906',
    NULL,
    'risk',
    'Risk Summary',
    'Residual risk heat map and assessment summary',
    'compliance',
    false
  )
ON CONFLICT DO NOTHING;

INSERT INTO "dashboard_widgets" ("id", "dashboard_id", "widget_key", "widget_type", "title", "config", "default_order", "col_span")
VALUES
  ('00000000-0000-4000-8000-000000000911', '00000000-0000-4000-8000-000000000901', 'overall_score', 'metric', 'Overall Score', '{"dataBinding":"executive:overallScore"}'::jsonb, 0, 1),
  ('00000000-0000-4000-8000-000000000912', '00000000-0000-4000-8000-000000000901', 'domain_scores', 'chart', 'Domain Performance', '{"dataBinding":"executive:domains","chartType":"bar"}'::jsonb, 1, 2),
  ('00000000-0000-4000-8000-000000000913', '00000000-0000-4000-8000-000000000901', 'kpi_highlights', 'table', 'Key Movements', '{"dataBinding":"executive:highlights"}'::jsonb, 2, 2),
  ('00000000-0000-4000-8000-000000000914', '00000000-0000-4000-8000-000000000901', 'compliance_score', 'benchmark', 'Compliance Score', '{"dataBinding":"kpi:compliance.score","target":80}'::jsonb, 3, 1),
  ('00000000-0000-4000-8000-000000000915', '00000000-0000-4000-8000-000000000901', 'audit_findings', 'metric', 'Open Audit Findings', '{"dataBinding":"kpi:audit.open_findings"}'::jsonb, 4, 1),
  ('00000000-0000-4000-8000-000000000916', '00000000-0000-4000-8000-000000000901', 'training_completion', 'metric', 'Training Completion', '{"dataBinding":"kpi:learning.completion_rate"}'::jsonb, 5, 1),
  ('00000000-0000-4000-8000-000000000917', '00000000-0000-4000-8000-000000000901', 'crm_pipeline', 'metric', 'Open Leads', '{"dataBinding":"kpi:crm.open_leads"}'::jsonb, 6, 1),
  ('00000000-0000-4000-8000-000000000918', '00000000-0000-4000-8000-000000000901', 'risk_heatmap', 'heatmap', 'Risk Heat Map', '{"dataBinding":"risk:heatmap"}'::jsonb, 7, 2),

  ('00000000-0000-4000-8000-000000000921', '00000000-0000-4000-8000-000000000902', 'compliance_score', 'benchmark', 'Compliance Score', '{"dataBinding":"kpi:compliance.score","target":85}'::jsonb, 0, 1),
  ('00000000-0000-4000-8000-000000000922', '00000000-0000-4000-8000-000000000902', 'compliance_trend', 'trend', 'Compliance Trend', '{"dataBinding":"kpi-trend:compliance.score"}'::jsonb, 1, 2),
  ('00000000-0000-4000-8000-000000000923', '00000000-0000-4000-8000-000000000902', 'compliance_kpis', 'table', 'Compliance KPIs', '{"dataBinding":"kpis:compliance"}'::jsonb, 2, 2),

  ('00000000-0000-4000-8000-000000000931', '00000000-0000-4000-8000-000000000903', 'audit_completion', 'metric', 'Audit Completion Rate', '{"dataBinding":"kpi:audit.completion_rate"}'::jsonb, 0, 1),
  ('00000000-0000-4000-8000-000000000932', '00000000-0000-4000-8000-000000000903', 'audit_findings', 'metric', 'Open Findings', '{"dataBinding":"kpi:audit.open_findings"}'::jsonb, 1, 1),
  ('00000000-0000-4000-8000-000000000933', '00000000-0000-4000-8000-000000000903', 'audit_overdue', 'metric', 'Overdue Audits', '{"dataBinding":"kpi:audit.overdue"}'::jsonb, 2, 1),
  ('00000000-0000-4000-8000-000000000934', '00000000-0000-4000-8000-000000000903', 'audit_kpis', 'table', 'Audit KPIs', '{"dataBinding":"kpis:audit"}'::jsonb, 3, 2),

  ('00000000-0000-4000-8000-000000000941', '00000000-0000-4000-8000-000000000904', 'open_leads', 'metric', 'Open Leads', '{"dataBinding":"kpi:crm.open_leads"}'::jsonb, 0, 1),
  ('00000000-0000-4000-8000-000000000942', '00000000-0000-4000-8000-000000000904', 'conversion_rate', 'benchmark', 'Conversion Rate', '{"dataBinding":"kpi:crm.conversion_rate","target":25}'::jsonb, 1, 1),
  ('00000000-0000-4000-8000-000000000943', '00000000-0000-4000-8000-000000000904', 'crm_kpis', 'table', 'CRM KPIs', '{"dataBinding":"kpis:crm"}'::jsonb, 2, 2),

  ('00000000-0000-4000-8000-000000000951', '00000000-0000-4000-8000-000000000905', 'completion_rate', 'benchmark', 'Completion Rate', '{"dataBinding":"kpi:learning.completion_rate","target":90}'::jsonb, 0, 1),
  ('00000000-0000-4000-8000-000000000952', '00000000-0000-4000-8000-000000000905', 'learning_trend', 'trend', 'Completion Trend', '{"dataBinding":"kpi-trend:learning.completion_rate"}'::jsonb, 1, 2),
  ('00000000-0000-4000-8000-000000000953', '00000000-0000-4000-8000-000000000905', 'learning_kpis', 'table', 'Learning KPIs', '{"dataBinding":"kpis:learning"}'::jsonb, 2, 2),

  ('00000000-0000-4000-8000-000000000961', '00000000-0000-4000-8000-000000000906', 'risk_heatmap', 'heatmap', 'Residual Risk Heat Map', '{"dataBinding":"risk:heatmap"}'::jsonb, 0, 2),
  ('00000000-0000-4000-8000-000000000962', '00000000-0000-4000-8000-000000000906', 'open_findings', 'metric', 'Open Compliance Findings', '{"dataBinding":"kpi:compliance.open_findings"}'::jsonb, 1, 1)
ON CONFLICT DO NOTHING;
