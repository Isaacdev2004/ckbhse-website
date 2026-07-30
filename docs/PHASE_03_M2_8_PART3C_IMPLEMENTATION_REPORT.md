# Phase 03 — Milestone 2.8 Part 3C Implementation Report

**Report Scheduling & Staff Portal Builder UI**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after M2.8 Part 3A:** 582 tests  
**After M2.8 Part 3B/3C:** 588 tests passing, typecheck pass

---

## Summary

Part 3C delivers automated report scheduling and the staff portal reporting builder hub: schedule CRUD, due-schedule delivery via export pipeline, background job registration, and portal pages for saved reports, exports, and schedules.

---

## Delivered

### Database (`0015_report_export_scheduling.sql`)

| Table | Purpose |
|-------|---------|
| `report_schedules` | Cadence, format, recipients, next run |

Seeded demo schedule: `weekly-executive-pdf` for Acme.

### Schedule service

| Method | Purpose |
|--------|---------|
| `listSchedules` / CRUD | Schedule management |
| `runDueSchedules` | Process due schedules → export jobs |
| `computeNextRunAt` | Daily / weekly / monthly next-run calculation |

**Background job:** `reporting.schedule.deliver` (org-scoped, registered alongside KPI refresh)

### Staff portal

| Route | Purpose |
|-------|---------|
| `/reporting/reports` | List reports, run, export CSV/PDF |
| `/reporting/reports/new` | Create KPI report definition |
| `/reporting/reports/:reportKey` | Report detail + run preview |
| `/reporting/schedules` | View schedules, run due deliveries |

Reporting hub nav updated with **Reports** and **Schedules** tabs.

### API

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/schedules` | List / create |
| GET/PATCH/DELETE | `/schedules/{scheduleKey}` | CRUD |
| POST | `/schedules/run-due` | Manual delivery trigger |

---

## Architecture

```
POST /schedules/run-due
        ↓
ReportScheduleService.runDueSchedules
        ↓
ReportExportService.createExport (per due schedule)
        ↓
StorageProvider + report_export_jobs
```

Portal uses Orval hooks: `useReportingListReports`, `useReportingCreateExport`, `useReportingListSchedules`, etc.

---

## Verification

- [x] Schedule CRUD + due delivery
- [x] Job registration `reporting.schedule.deliver`
- [x] Staff portal reports + schedules UI
- [x] OpenAPI paths + Orval hooks
- [x] 588 tests passing, typecheck pass

**Milestone 2.8 Part 3 (3A + 3B + 3C): COMPLETE**

**Next:** M2.8 Part 4 — Business Intelligence Integration & Predictive Analytics
