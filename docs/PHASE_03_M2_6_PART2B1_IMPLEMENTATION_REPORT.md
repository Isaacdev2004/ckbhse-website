# Phase 03 — Milestone 2.6 Part 2B.1 — CAPA Management Platform

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.6 Part 2B.1 delivers an enterprise **Corrective and Preventive Action (CAPA)** engine with full workflow support: RCA, verification, approval, escalation, notifications, dashboards, staff and client portals, and compliance dashboard integration.

**Verification:** typecheck pass, **485 tests** passing (baseline 457 + 28 new).

---

## Delivered Capabilities

### CAPA Engine
- Corrective and preventive action records with org-scoped numbering (`CAPA-YYYY-NNN`)
- Workflow: `draft → open → in_progress → pending_verification → pending_approval → approved → closed` (+ `cancelled`, `overdue`)
- Root cause analysis (five whys, fishbone, fault tree, barrier analysis)
- Effectiveness verification with pass/fail routing
- Multi-level approval and close workflow
- Escalation with notification records
- Links to audit findings, inspection findings, and incidents

### Dashboards & KPIs
- Staff CAPA dashboard: totals, open, verification pending, closed, closure rate, overdue rate
- Client portal CAPA dashboard (read-only)
- Compliance workspace widget `capaCompletion` now driven by real CAPA closure counts

### Portals
| Route | Purpose |
|-------|---------|
| `/staff/capa/dashboard` | Staff KPI dashboard |
| `/staff/capa` | CAPA list |
| `/staff/capa/new` | Create CAPA |
| `/staff/capa/:id` | Detail with verification/approval/escalation counts |
| `/staff/capa/:id/rca` | Root cause analysis editor |
| `/portal/capa` | Client CAPA list |
| `/portal/capa/dashboard` | Client dashboard |
| `/portal/capa/:id` | Client detail (read-only) |

---

## Architecture

```
Staff/Client Portals → /api/v1/capa/*, /api/v1/portal/capa/*
        ↓
CapaService (createCapaServices)
        ↓
CapaRepository → DrizzleCapaStore → 0007_capa.sql
        ↕
ComplianceService.getDashboard() ← capaCompletion from CapaRepository.dashboardCounts()
```

### Database (`0007_capa.sql`)
- `capa_records` — main CAPA entity
- `capa_root_cause_analyses`
- `capa_verifications`
- `capa_approvals`
- `capa_escalations`
- `capa_notifications`
- Demo seed: Acme `CAPA-2026-001` with RCA

### Permissions
| Permission | Roles |
|------------|-------|
| `CAPA_READ` | consultant, auditor, manager, client, viewer, compliance_manager |
| `CAPA_CREATE/UPDATE/VERIFY/ASSIGN` | consultant, auditor, compliance_manager |
| `CAPA_APPROVE/CLOSE/ESCALATE` | manager, compliance_manager |

---

## API Endpoints

### Staff (`/api/v1/capa`)
- `GET /dashboard` — KPI dashboard
- `GET /` — list (optional `?status=`)
- `POST /` — create
- `GET /:capaId` — detail with RCA, verifications, approvals, escalations, notifications
- `PATCH /:capaId` — update
- `PUT /:capaId/rca` — save RCA
- `GET /:capaId/rca` — get RCA
- `POST /:capaId/submit-verification`
- `POST /:capaId/verify`
- `POST /:capaId/approve`
- `POST /:capaId/close`
- `POST /:capaId/escalate`

### Client Portal (`/api/v1/portal/capa`)
- `GET /dashboard`
- `GET /`
- `GET /:capaId`

---

## Files Added / Modified

| Layer | Key files |
|-------|-----------|
| Migration | `lib/db/migrations/0007_capa.sql` |
| Schema | `lib/db/src/schema/capa.ts` |
| Domain | `lib/domain/src/capa/index.ts` |
| Data | `lib/data/src/stores/drizzle-capa.store.ts`, `repositories/capa.repository.ts` |
| Services | `lib/services/src/capa/index.ts` |
| API | `artifacts/api-server/src/routes/v1/capa.ts`, portal capa routes |
| Staff UI | `artifacts/staff-portal/src/pages/capa/*` |
| Client UI | `artifacts/client-portal/src/pages/capa/*` |
| OpenAPI | `lib/api-spec/openapi.yaml` (capa tag + paths) |
| Tests | `capa.service.test.ts`, `capa.test.ts`, domain `capa.test.ts` |

---

## Test Coverage

| Suite | New tests |
|-------|-----------|
| `CapaService` | 12 (create, workflow, dashboard, portal filter, RCA) |
| API auth (`capa.test.ts`) | 10 route guards |
| Domain types | 3 |
| Compliance dashboard | 1 (`capaCompletion`) |
| Portal routes | 2 |
| Permissions catalogue | 2 assertions |

**Total:** 485 tests passing.

---

## Demo Data

- Org: `00000000-0000-4000-8000-000000000002` (Acme)
- Seed CAPA: `CAPA-2026-001` (corrective, open) with RCA summary

---

## Next Steps (Part 2B sequence)

| Part | Scope |
|------|-------|
| **2B.2** | Risk & Hazard Registers |
| **2B.3** | Compliance Analytics & Regulatory Intelligence |
| **2B.4** | OpenAPI/Orval sync, full integration, 500+ tests, final M2.6 report |

---

## Notes

- Notification delivery is recorded in DB (`capa_notifications`); email/push dispatch is a placeholder for a future worker.
- Legacy `organization_actions` portal actions remain; new CAPA uses dedicated `capa_records` table.
- Local DB testing requires Docker/Postgres; route tests accept `[401, 503]` when services are unconfigured.
