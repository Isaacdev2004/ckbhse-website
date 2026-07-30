# Phase 03 — Milestone 2.8 — Enterprise Reporting, Business Intelligence & Analytics Platform — Final Report

**Project:** CKBHSE Enterprise Digital Platform  
**Phase:** Phase 03 — Business Platform  
**Milestone:** M2.8 (Complete)  
**Date:** July 2026

---

## Executive Summary

Milestone 2.8 delivers a horizontal **Enterprise Reporting, Business Intelligence & Analytics Platform** unified across compliance, audit, CRM, learning, and financial domains. The work spans five delivery parts:

| Part | Scope | Tests (cumulative) |
|------|-------|-------------------|
| **Part 1** | Reporting architecture & KPI engine | 570 |
| **Part 2** | Dashboard platform & chart widgets | 577 |
| **Part 3A** | Report builder & execution | 582 |
| **Part 3B/3C** | Export pipeline & scheduling + portal UI | 588 |
| **Part 4** | BI integration & predictive analytics | 603 |
| **Part 5** | Testing, performance, security & final report | **628** |

**Verification:** typecheck pass, 628 tests, OpenAPI/Orval contract coverage, export guardrails enforced.

---

## Platform Capabilities

### KPI Engine & Executive Reporting (Part 1)
- Code-first KPI registry (16 KPIs, 5 domain providers)
- Org-scoped snapshot storage and trend computation
- Executive summary API and materialized view registry
- Background job: `reporting.kpi.refresh`

### Dashboard Platform (Part 2)
- Six widget types: metric, trend, table, chart, heatmap, benchmark
- Seeded executive + domain dashboards
- User layout personalization (`DASHBOARD_PERSONALIZE`)
- Staff portal `/reporting` hub with Recharts widgets

### Report Builder, Export & Scheduling (Part 3)
- Saved report definitions with KPI/executive sources
- CSV, XLSX, PDF export pipeline with tenant-scoped storage
- Scheduled delivery via `reporting.schedule.deliver`
- Portal pages: `/reporting/reports`, `/reporting/schedules`

### BI Integration & Predictive Analytics (Part 4)
- Power BI adapter (`@workspace/integrations-power-bi`) — dataset export API, incremental refresh manifests
- Organization benchmarking vs anonymised cohorts
- Trend analysis (moving averages, seasonality flags)
- Predictive forecast stubs with risk-of-breach scoring
- KPI threshold subscriptions with post-refresh evaluation
- Portal pages: `/reporting/insights`, `/reporting/benchmarks`, `/reporting/bi`

### Testing, Performance & Security (Part 5)
- Export row limits: 10,000 (reports), 50,000 (BI datasets)
- View refresh staleness helper (24-hour SLA)
- KPI refresh performance budget (30s SLA in tests)
- RBAC matrix tests (service + seed)
- Tenant isolation tests (repository org scoping)
- Expanded API auth coverage (GET + mutation routes)
- Orval hook coverage guard for staff portal reporting pages

---

## Architecture (Locked)

```
Presentation (staff-portal /reporting/*)
        ↓
API (/api/v1/reporting/*) — thin routes, RBAC
        ↓
Services (KPI engine, dashboards, reports, exports, BI, benchmarks, forecasts, subscriptions)
        ↓
ReportingRepository → DrizzleReportingStore → PostgreSQL
        ↓
Power BI adapter (lib/integrations/power-bi) — vendor boundary
```

| Rule | Status |
|------|--------|
| No SQL in routes | ✓ |
| Business logic in services | ✓ |
| Organization isolation | ✓ |
| RBAC via `requirePermission()` | ✓ |
| OpenAPI contract-first | ✓ |
| Power BI via export API (no vendor SDKs in services) | ✓ |
| Heavy aggregates via scheduled snapshots | ✓ |

---

## Database Migrations

| Migration | Domain |
|-----------|--------|
| `0012_reporting_foundation.sql` | KPI snapshots, view registry, report definitions |
| `0013_dashboard_platform.sql` | Dashboard definitions, widgets, user layouts |
| `0014_report_builder.sql` | Demo report definitions |
| `0015_report_export_scheduling.sql` | Export jobs, schedules |
| `0016_bi_predictive_analytics.sql` | BI connections/exports, benchmarks, forecasts, subscriptions |

---

## Permissions

| Permission | Purpose |
|------------|---------|
| `reporting.report.read` | View KPIs, dashboards, reports, benchmarks |
| `reporting.report.manage` | Refresh snapshots, manage reports/schedules/subscriptions |
| `reporting.report.export` | Export reports and BI datasets |
| `reporting.dashboard.personalize` | Save dashboard layouts |

Consultants receive read-only; managers receive manage, export, and personalize.

---

## API Surface (Summary)

Base: `/api/v1/reporting/*`

| Area | Key endpoints |
|------|---------------|
| KPIs | `/kpi-definitions`, `/kpis`, `/executive-summary`, `/refresh` |
| Dashboards | `/dashboards/*`, `/widgets/catalog` |
| Reports | `/reports/*`, `/reports/{key}/run`, `/reports/{key}/export` |
| Exports | `/exports/*` |
| Schedules | `/schedules/*`, `/schedules/run-due` |
| Power BI | `/bi/connections/*`, `/bi/exports/*` |
| Benchmarks | `/benchmarks/cohorts`, `/benchmarks/compare` |
| Analytics | `/trends/{kpiKey}`, `/forecasts/*` |
| Subscriptions | `/subscriptions/*`, `/subscriptions/evaluate` |

---

## Staff Portal Routes

| Route | Purpose |
|-------|---------|
| `/reporting` | Executive dashboard |
| `/reporting/compliance` … `/reporting/risk` | Domain dashboards |
| `/reporting/reports` | Report builder hub |
| `/reporting/schedules` | Scheduled delivery |
| `/reporting/insights` | Trends & forecasts |
| `/reporting/benchmarks` | Cohort comparison |
| `/reporting/bi` | Power BI integration |

All pages use Orval-generated React Query hooks from `@workspace/api-client-react`.

---

## Background Jobs

| Job | Purpose |
|-----|---------|
| `reporting.kpi.refresh` | Snapshot refresh + subscription evaluation |
| `reporting.schedule.deliver` | Due schedule export delivery |
| `reporting.subscription.evaluate` | Manual/triggered threshold checks |

---

## Guardrails (Part 5)

| Guardrail | Value |
|-----------|-------|
| Max report export rows | 10,000 |
| Max BI dataset rows | 50,000 |
| KPI refresh SLA (test budget) | 30 seconds |
| View refresh stale threshold | 24 hours |

Violations return `payload_too_large` (HTTP 413).

---

## Demo Access

- Platform admin: `admin@ckbhse.co.uk` / `StaffDev123!`
- Acme org: `00000000-0000-4000-8000-000000000002`

---

## Verification Checklist

- [x] Migrations `0012`–`0016` applied
- [x] KPI engine + 5 domain providers
- [x] Dashboard platform + personalization
- [x] Report builder + export + scheduling
- [x] Power BI integration layer
- [x] Benchmarking + trend + forecast foundation
- [x] KPI subscriptions
- [x] RBAC + tenant isolation tests
- [x] Performance budget tests
- [x] Export size limits
- [x] OpenAPI + Orval hook coverage
- [x] Staff portal reporting hub (11 routes)
- [x] 628 tests passing, typecheck pass

**Milestone 2.8: COMPLETE**

---

## Implementation Reports

| Part | Report |
|------|--------|
| 1 | `PHASE_03_M2_8_PART1_IMPLEMENTATION_REPORT.md` |
| 2 | `PHASE_03_M2_8_PART2_IMPLEMENTATION_REPORT.md` |
| 3A | `PHASE_03_M2_8_PART3A_IMPLEMENTATION_REPORT.md` |
| 3B | `PHASE_03_M2_8_PART3B_IMPLEMENTATION_REPORT.md` |
| 3C | `PHASE_03_M2_8_PART3C_IMPLEMENTATION_REPORT.md` |
| 4 | `PHASE_03_M2_8_PART4_IMPLEMENTATION_REPORT.md` |
| 5 | This document |

---

## Deferred / Future

- Real PDF rendering engine (headless browser) — current pipeline uses minimal PDF 1.4
- ML-based forecasting — Part 4 delivers linear-regression stubs only
- Email delivery for KPI subscriptions — channel model in place, dispatcher integration future
- Financial KPIs — placeholders until finance module (M2.x)
- Notification subscriptions for report delivery — schedules cover email via recipients JSON
