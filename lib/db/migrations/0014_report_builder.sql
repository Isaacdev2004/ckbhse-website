-- Milestone 2.8 Part 3A — Report builder seeds

INSERT INTO "report_definitions" (
  "id",
  "organization_id",
  "report_key",
  "title",
  "domain",
  "definition",
  "created_by"
)
VALUES
  (
    '00000000-0000-4000-8000-000000000a01',
    '00000000-0000-4000-8000-000000000002',
    'compliance-kpi-summary',
    'Compliance KPI Summary',
    'compliance',
    '{"sourceType":"kpi","filters":{"domain":"compliance"},"columns":["key","label","value","unit","trendDirection","trendDelta"]}'::jsonb,
    NULL
  ),
  (
    '00000000-0000-4000-8000-000000000a02',
    '00000000-0000-4000-8000-000000000002',
    'executive-rollup',
    'Executive Rollup',
    'platform',
    '{"sourceType":"executive","columns":["domain","score","kpiCount"]}'::jsonb,
    NULL
  ),
  (
    '00000000-0000-4000-8000-000000000a03',
    '00000000-0000-4000-8000-000000000002',
    'crm-pipeline',
    'CRM Pipeline Report',
    'crm',
    '{"sourceType":"kpi","filters":{"domain":"crm","kpiKeys":["crm.open_leads","crm.conversion_rate","crm.avg_response_minutes"]},"columns":["label","value","unit","trendDelta"]}'::jsonb,
    NULL
  )
ON CONFLICT DO NOTHING;
