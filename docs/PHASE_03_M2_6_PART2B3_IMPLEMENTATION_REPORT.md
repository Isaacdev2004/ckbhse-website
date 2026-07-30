# Phase 03 — Milestone 2.6 Part 2B.3 — Compliance Analytics & Regulatory Intelligence

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.6 Part 2B.3 delivers **Compliance Analytics & Regulatory Intelligence**: executive dashboards, a KPI snapshot engine, compliance trend history, regulatory monitoring with alerts, ISO framework coverage views, control effectiveness analytics, cross-domain performance metrics, BI-ready export jobs, and automated compliance calendar sync from the legal register.

**Verification:** typecheck pass, **521 tests** passing (baseline 506 + 15 new).

---

## Delivered Capabilities

### Executive Analytics
- Organisation compliance score with month-over-month trend direction and delta
- Widget KPIs: audit, inspection, CAPA, training completion; control effectiveness; open findings and alerts
- 12-month monthly compliance trend series from KPI snapshots

### KPI Engine
- `compliance_kpi_snapshots` table with upsert-by-month semantics
- `POST /analytics/snapshot` records current-month KPIs from live dashboard data
- `GET /analytics/kpis` and `/analytics/trends` for BI and charting

### Regulatory Intelligence
- Regulatory monitoring stats (total, compliant, review required, non-compliant)
- `regulatory_alerts` inbox with severity, type, and acknowledge workflow
- Demo seed: ISO 45001 amendment alert + legal review alert for Acme

### ISO & Controls
- ISO framework coverage dashboard with clause listing
- Control effectiveness breakdown (total, effective, partially effective, ineffective, rate)

### Performance Analytics
- Cross-domain performance view: audits, inspections, CAPA, controls, compliance score

### BI Export Architecture
- `compliance_export_jobs` metadata table
- Create/list export jobs with format (`csv`, `json`, `xlsx`) and file key completion

### Calendar Automation
- `POST /analytics/calendar/sync` auto-creates compliance calendar events from legal register review dates

---

## Architecture

```
Staff/Client Portals → /api/v1/compliance/analytics/*, /api/v1/portal/compliance/analytics/*
        ↓
ComplianceAnalyticsService + ComplianceScoreService
        ↓
ComplianceAnalyticsRepository → DrizzleComplianceStore → 0009_compliance_analytics.sql
```

### Database (`0009_compliance_analytics.sql`)
| Table | Purpose |
|-------|---------|
| `compliance_kpi_snapshots` | Monthly KPI history (6-month Acme seed) |
| `regulatory_alerts` | Regulatory monitoring alerts |
| `compliance_export_jobs` | BI export job metadata |

Demo seed: 6 KPI snapshots, 2 regulatory alerts, 1 regulatory register amendment entry.

### Permissions (existing — no new permissions)
- `consultancy.compliance.read` — executive, KPIs, trends, ISO, performance, exports list
- `consultancy.compliance.manage` — snapshot, export create, calendar sync
- `consultancy.regulatory.read` — regulatory monitoring, alerts list
- `consultancy.regulatory.manage` — acknowledge alerts
- `consultancy.control.read` — control effectiveness analytics

---

## API Endpoints

### Staff (`/api/v1/compliance/analytics`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/executive` | Executive dashboard |
| GET | `/kpis` | KPI engine + history |
| GET | `/trends` | Compliance trend series |
| GET | `/regulatory` | Regulatory monitoring + alerts |
| GET | `/iso` | ISO framework coverage |
| GET | `/controls` | Control effectiveness |
| GET | `/performance` | Cross-domain performance |
| GET | `/alerts` | Alert inbox (optional status filter) |
| POST | `/alerts/:alertId/acknowledge` | Acknowledge alert |
| GET/POST | `/exports` | List/create BI export jobs |
| POST | `/calendar/sync` | Sync calendar from legal register |
| POST | `/snapshot` | Record current-month KPI snapshot |

### Client Portal (`/api/v1/portal/compliance/analytics`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/executive` | Read-only executive dashboard |
| GET | `/regulatory` | Read-only regulatory monitoring |
| GET | `/alerts` | Open alerts only |

Portal `/compliance` response now includes embedded `analytics` executive summary.

---

## Portal Routes

| Staff | Client |
|-------|--------|
| `/compliance/analytics` | `/compliance/analytics` |
| `/compliance/analytics/regulatory` | — |
| `/compliance/analytics/performance` | — |
| `/compliance/analytics/exports` | — |

Staff compliance workspace links to analytics; client compliance workspace links to read-only analytics.

---

## Key Files

| Layer | Path |
|-------|------|
| Migration | `lib/db/migrations/0009_compliance_analytics.sql` |
| Schema | `lib/db/src/schema/compliance-analytics.ts` |
| Domain | `lib/domain/src/compliance-analytics/index.ts` |
| Store | `lib/data/src/stores/drizzle-compliance.store.ts` (analytics methods) |
| Repository | `lib/data/src/repositories/compliance.repository.ts` (`ComplianceAnalyticsRepository`) |
| Service | `lib/services/src/compliance/analytics.ts` |
| API | `artifacts/api-server/src/routes/v1/compliance.ts` |
| Portal API | `artifacts/api-server/src/routes/v1/portal.ts` |
| Staff UI | `artifacts/staff-portal/src/pages/compliance/analytics/*` |
| Client UI | `artifacts/client-portal/src/pages/compliance-analytics.tsx` |
| OpenAPI | `lib/api-spec/openapi.yaml` (analytics paths) |

---

## Test Coverage

| Suite | New tests |
|-------|-----------|
| `analytics.service.test.ts` | 5 (executive, regulatory, snapshot, calendar sync, export) |
| `compliance.service.test.ts` | 1 (dashboard analytics widgets) |
| API auth | 9 analytics route guards |

**Total:** 521 tests (was 506).

---

## Demo Access

| Role | Email | Password |
|------|-------|----------|
| Staff | `consultant@ckbhse.co.uk` | `StaffDev123!` |
| Client | `client@acme.example.com` | `StaffDev123!` |

Acme org: `00000000-0000-4000-8000-000000000002`

Staff: `/compliance/analytics` — executive KPIs, regulatory alerts, performance, BI exports.  
Client: `/compliance/analytics` — read-only executive view and open alerts.

---

## Next Step

**M2.6 Part 2B.4** — OpenAPI/Orval client generation, full integration polish, final M2.6 report, M2.7 handover.
