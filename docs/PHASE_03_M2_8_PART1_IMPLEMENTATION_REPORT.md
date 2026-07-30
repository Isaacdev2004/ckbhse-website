# Phase 03 — Milestone 2.8 Part 1 Implementation Report

**Reporting Architecture & KPI Engine**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after M2.7 Part 3:** 557 tests  
**After M2.8 Part 1:** 570 tests passing, typecheck pass

---

## Summary

Part 1 establishes the horizontal reporting platform spine: a code-first KPI registry, cross-domain KPI providers, snapshot storage, executive summary API, materialized view registry, and background job registration for KPI refresh.

Domain-specific analytics from M2.6 (compliance), M2.3 (CRM), and M2.4 (learning) are unified through provider adapters rather than rewritten.

---

## Delivered

### Database (`0012_reporting_foundation.sql`)

| Table | Purpose |
|-------|---------|
| `reporting_kpi_snapshots` | Org-scoped KPI values by period/domain/key |
| `reporting_view_registry` | Materialized view refresh metadata |
| `report_definitions` | Saved report definition foundation (Part 3+) |

Seeded view registry rows: `kpi_snapshots`, `executive_summary`.

### Domain (`lib/domain/reporting`)

- `KpiDefinition`, `KpiReading`, `KpiSnapshotSummary`
- `ExecutiveSummaryData`, `ReportingViewStatus`, `ReportDefinitionSummary`

### KPI engine

- **Registry** — 16 code-first KPI definitions across 5 domains
- **Providers** — `ComplianceKpiProvider`, `AuditKpiProvider`, `CrmKpiProvider`, `LearningKpiProvider`, `FinancialKpiProvider` (placeholder)
- **`KpiEngineService`** — collects readings, upserts snapshots, updates view registry
- **`ReportingService`** — executive summary, KPI listing with trends, view registry, definitions

### Permissions

| Permission | Purpose |
|------------|---------|
| `reporting.report.read` | View KPIs and executive summary |
| `reporting.report.manage` | Refresh snapshots |
| `reporting.report.export` | Export (Part 3) |
| `reporting.dashboard.personalize` | Dashboard layouts (Part 2) |

Seeded to consultant, read-only, manager, and compliance manager roles.

### API (`/api/v1/reporting/*`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/kpi-definitions` | KPI catalogue |
| GET | `/kpis` | Current period snapshots with trends |
| GET | `/executive-summary` | Cross-domain rollup |
| GET | `/views` | View registry status |
| GET | `/definitions` | Saved report definitions |
| POST | `/refresh` | Trigger KPI snapshot refresh |

### Background jobs

- Job name: `reporting.kpi.refresh`
- Registered in API container with permission re-resolution via `DatabasePermissionResolver`

---

## Architecture

```
Staff portal (Part 2) → /api/v1/reporting/*
        ↓
ReportingService / KpiEngineService
        ↓
KPI Providers → existing domain services/repos
        ↓
ReportingRepository → DrizzleReportingStore → PostgreSQL
```

Heavy aggregates remain snapshot-based; providers read scoped OLTP counts only.

---

## File map

| Area | Key paths |
|------|-----------|
| DB | `0012_reporting_foundation.sql`, `lib/db/src/schema/reporting.ts` |
| Domain | `lib/domain/src/reporting/index.ts` |
| Data | `drizzle-reporting.store.ts`, `reporting.repository.ts` |
| Services | `lib/services/src/reporting/*` (registry, providers, engine, jobs) |
| API | `artifacts/api-server/src/routes/v1/reporting.ts` |
| Container | Job registration in `container.ts` |

---

## Deferred to M2.8 Part 2+

1. Dashboard widget platform and chart UI (Part 2)
2. Custom report builder, PDF/Excel export, scheduling (Part 3)
3. Power BI integration layer (Part 4)
4. Predictive analytics and benchmarking (Part 4)
5. Staff portal `/reporting` hub pages (Part 2)

---

## Verification checklist

- [x] Migration + Drizzle schema
- [x] Domain reporting types
- [x] KPI registry + 5 domain providers
- [x] KpiEngineService + ReportingService
- [x] `/api/v1/reporting/*` routes + auth tests
- [x] Permissions seed + RBAC
- [x] `reporting.kpi.refresh` job registered
- [x] OpenAPI paths + Orval codegen
- [x] 570 tests passing
- [x] Typecheck pass

**Milestone 2.8 Part 1: COMPLETE**

**Next:** M2.8 Part 2 — Dashboard Platform & Analytics Widgets
