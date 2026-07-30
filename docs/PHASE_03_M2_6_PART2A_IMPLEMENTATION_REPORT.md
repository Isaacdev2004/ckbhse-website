# Phase 03 — Milestone 2.6 Part 2A — Inspection Management & Compliance Workspace

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.6 Part 2A extends the audit platform with a full **Inspection Management** system and a centralized **Compliance Workspace** covering legal registers, regulatory management, ISO frameworks, control registers, configurable scoring, and a unified compliance calendar.

**Verification:** typecheck pass, **457+ tests** passing.

---

## Delivered Capabilities

### Inspection Management
- Configurable inspection types (8 system seeds)
- Scheduled, reactive, preventive, daily/weekly/monthly/annual, follow-up, spot inspections
- Checklist, findings, evidence per inspection
- Staff dashboard with today/upcoming views
- Client portal read access to inspections

### Compliance Workspace
- Aggregated workspace: compliance score, open audits/inspections, findings, legal obligations, controls, certifications
- Compliance dashboard widgets and trend placeholders
- Configurable score engine (`compliance_score_configs` with JSON weights)
- ISO 45001, 9001, 14001 framework seeds

### Registers
- **Legal Register** — regulations, jurisdiction, review dates, linked controls/audits
- **Regulatory Register** — HSE, ISO, environmental, fire, construction categories
- **Control Register** — preventive/detective/corrective controls with effectiveness tracking
- **Compliance Calendar** — audit, inspection, renewal, review event types

---

## Architecture

```
Staff/Client Portals → /api/v1/inspections/*, /api/v1/compliance/*
        ↓
InspectionService, ComplianceService, ComplianceScoreService, LegalRegisterService, …
        ↓
6 Repositories → DrizzleComplianceStore → 0006_compliance.sql
        ↕
AuditRepository (Part 1) for workspace aggregation
```

---

## New Permissions

- `INSPECTION_READ`, `INSPECTION_CREATE`, `INSPECTION_UPDATE`
- `COMPLIANCE_READ`, `COMPLIANCE_MANAGE`
- `LEGAL_REGISTER_READ`, `LEGAL_REGISTER_MANAGE`
- `REGULATORY_READ`, `REGULATORY_MANAGE`
- `CONTROL_READ`, `CONTROL_MANAGE`

---

## Routes

### Staff Portal
| Route | Purpose |
|-------|---------|
| `/staff/inspections` | Inspection list |
| `/staff/inspections/dashboard` | KPI dashboard |
| `/staff/inspections/new` | Create inspection |
| `/staff/inspections/:id` | Detail |
| `/staff/inspections/:id/checklist` | Checklist |
| `/staff/inspections/:id/findings` | Findings |
| `/staff/inspections/:id/evidence` | Evidence |
| `/staff/inspections/calendar` | Calendar |
| `/staff/compliance` | Compliance workspace |

### Client Portal
| Route | Purpose |
|-------|---------|
| `/portal/inspections` | Inspection list |
| `/portal/inspections/:id` | Detail |
| `/portal/inspections/calendar` | Calendar |
| `/portal/inspections/history` | History |
| `/portal/compliance` | Enhanced compliance workspace |

---

## API Endpoints

### `/api/v1/inspections`
Dashboard, calendar, types, CRUD, checklist, findings, evidence

### `/api/v1/compliance`
Dashboard, workspace, calendar, score, legal-register, regulations, controls, ISO frameworks

### `/api/v1/portal`
Extended `/compliance`, `/inspections/*` for client access

---

## Database (`0006_compliance.sql`)

13 new tables including `inspections`, `inspection_findings`, `legal_register_entries`, `regulatory_register_entries`, `iso_frameworks`, `iso_clauses`, `compliance_controls`, `compliance_score_configs`, `compliance_calendar_events`

---

## Deferred (Part 2B)
- CAPA linkage and completion tracking
- Full trend chart data pipelines
- Risk register integration
- Document attachment upload for legal register
