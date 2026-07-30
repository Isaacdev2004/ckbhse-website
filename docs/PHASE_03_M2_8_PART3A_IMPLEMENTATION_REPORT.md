# Phase 03 — Milestone 2.8 Part 3A Implementation Report

**Report Builder — Definitions CRUD & Execution Engine**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after M2.8 Part 2:** 577 tests  
**After M2.8 Part 3A:** 582 tests passing, typecheck pass

---

## Summary

Part 3A delivers the report builder foundation on top of the Part 1 `report_definitions` table: full CRUD for saved reports, a JSON-based definition spec, runtime execution against KPI snapshots and executive summary data, seeded demo reports, and `/api/v1/reporting/reports/*` API routes.

Export (Part 3B) and scheduling (Part 3C) build on this execution engine.

---

## Delivered

### Database (`0014_report_builder.sql`)

Seeded org-scoped demo reports for Acme:

| Report key | Source | Purpose |
|------------|--------|---------|
| `compliance-kpi-summary` | KPI | Compliance domain KPI table |
| `executive-rollup` | Executive | Domain score rollup |
| `crm-pipeline` | KPI | CRM pipeline metrics |

### Domain (`lib/domain/reporting`)

- `ReportDefinitionSpec` — `sourceType`, `columns`, `filters`
- `ReportDefinitionDetail`, `CreateReportDefinitionInput`, `UpdateReportDefinitionInput`
- `ReportExecutionResult` — columns, rows, rowCount, executedAt

### Report builder service

| Method | Permission | Purpose |
|--------|------------|---------|
| `listReports` | `reporting.report.read` | List saved definitions |
| `getReport` | read | Full definition detail |
| `createReport` | `reporting.report.manage` | Create definition |
| `updateReport` | manage | Update definition |
| `deleteReport` | manage | Delete definition |
| `runReport` | read | Execute and return tabular data |

**Source types:**
- `kpi` — filters by domain, KPI keys, snapshot period; columns from KPI snapshots
- `executive` — domain scores or highlight KPIs from executive summary

### API (`/api/v1/reporting/reports/*`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/reports` | List reports |
| POST | `/reports` | Create report |
| GET | `/reports/{reportKey}` | Get detail |
| PATCH | `/reports/{reportKey}` | Update |
| DELETE | `/reports/{reportKey}` | Delete |
| POST | `/reports/{reportKey}/run` | Execute report |

Existing `GET /definitions` remains as a summary alias from Part 1.

---

## Architecture

```
POST /reports/{key}/run
        ↓
ReportBuilderService.runReport
        ↓
ReportingService.listKpis / getExecutiveSummary
        ↓
ReportingRepository → KPI snapshots (Part 1)
```

---

## Deferred to M2.8 Part 3B & 3C

| Slice | Scope |
|-------|--------|
| **3B** | PDF/Excel export pipeline, `report_export_jobs`, download endpoints |
| **3C** | `report_schedules`, delivery jobs, staff portal builder UI |

---

## Verification checklist

- [x] Migration seeds + store/repository CRUD
- [x] ReportBuilderService + KPI/executive execution
- [x] `/api/v1/reporting/reports/*` routes + auth tests
- [x] OpenAPI paths + Orval codegen
- [x] Unit tests for builder service
- [x] 582 tests passing
- [x] Typecheck pass

**Milestone 2.8 Part 3A: COMPLETE**

**Next:** M2.8 Part 3B — PDF/Excel Export Pipeline
