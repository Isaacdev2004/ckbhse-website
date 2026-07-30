# Phase 03 — Milestone 2.6 Part 2B.2 — Enterprise Risk Management & Hazard Registers

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.6 Part 2B.2 delivers an enterprise **Risk Register** and **Hazard Register** with a configurable 5×5 risk matrix, likelihood × severity scoring, residual risk tracking, treatment plans, review cycles, bow-tie foundation, heat maps, and staff/client dashboards.

**Verification:** typecheck pass, **506 tests** passing (baseline 485 + 21 new).

---

## Delivered Capabilities

### Enterprise Risk Register
- Org-scoped risk assessments (`RA-YYYY-NNN`) with workflow: `draft → active → under_review → approved → archived`
- Inherent and residual risk scoring (likelihood × severity)
- Dynamic risk matrix per organisation (configurable thresholds)
- Treatment plans linked to assessments and hazards
- Scheduled review records with outcomes
- Bow-tie element foundation (threats, top events, consequences, barriers)

### Hazard Register
- Standalone hazards (`HZ-YYYY-NNN`) or linked to assessments
- Category taxonomy (physical, chemical, biological, ergonomic, psychosocial, environmental)
- Existing controls tracking (JSON array)
- Inherent/residual scoring using the same matrix engine

### Analytics
- Staff dashboard: totals, high/critical count, hazards, open treatments, reduction rate, review compliance
- Residual risk **heat map** (aggregated L×S cells)
- Client portal read-only views

---

## Architecture

```
Staff/Client Portals → /api/v1/risk-assessments/*, /api/v1/portal/risk-assessments/*
        ↓
RiskService + matrix engine (buildRiskScore, aggregateHeatMap)
        ↓
RiskRepository → DrizzleRiskStore → 0008_risk.sql
```

### Database (`0008_risk.sql`)
| Table | Purpose |
|-------|---------|
| `risk_matrix_configs` | Dynamic 5×5 matrix, rating thresholds |
| `risk_assessments` | Enterprise risk register |
| `hazard_register` | Hazard entries |
| `risk_treatment_plans` | Treatment actions |
| `risk_reviews` | Review cycle records |
| `risk_bowtie_elements` | Bow-tie diagram foundation |

Demo seed: Acme `RA-2026-001`, `HZ-2026-001`, treatment plan, review, bow-tie elements.

### Permissions (existing)
- `consultancy.risk-assessment.read` — view registers, dashboards, heat maps
- `consultancy.risk-assessment.manage` — create/update, score, approve, treatments, reviews, bow-tie

---

## API Endpoints

### Staff (`/api/v1/risk-assessments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | KPI dashboard |
| GET | `/heatmap` | Residual risk heat map |
| GET | `/matrix` | Matrix configurations |
| GET/POST | `/hazards` | Hazard register |
| GET/POST | `/` | List/create assessments |
| GET/PATCH | `/:id` | Detail/update |
| POST | `/:id/score` | Score inherent/residual |
| POST | `/:id/approve` | Approve assessment |
| GET/POST | `/:id/treatments` | Treatment plans |
| GET/POST | `/:id/reviews` | Review records |
| GET/POST | `/:id/bowtie` | Bow-tie elements |

### Client Portal (`/api/v1/portal/risk-assessments`)
- `GET /dashboard`, `/heatmap`, `/`, `/:assessmentId`

---

## Portal Routes

| Staff | Client |
|-------|--------|
| `/risk-assessments/dashboard` | `/risk-assessments/dashboard` |
| `/risk-assessments` | `/risk-assessments` |
| `/risk-assessments/hazards` | — |
| `/risk-assessments/heatmap` | `/risk-assessments/heatmap` |
| `/risk-assessments/new` | — |
| `/risk-assessments/:id` | `/risk-assessments/:id` |
| `/risk-assessments/:id/bowtie` | — |

---

## Risk Matrix Engine

Default thresholds (5×5):
| Score | Rating |
|-------|--------|
| 1–4 | low |
| 5–9 | medium |
| 10–15 | high |
| 16–25 | critical |

```typescript
score = likelihood × severity
rating = resolveRiskRating(score, matrix.ratingThresholds)
```

---

## Test Coverage

| Suite | New tests |
|-------|-----------|
| `matrix.test.ts` | 4 (score, rating, heat map aggregation) |
| `RiskService` | 5 (create, dashboard, heat map, portal filter) |
| API auth | 7 route guards |
| Domain types | 2 |
| Portal routes | 3 |

**Total:** 506 tests passing.

---

## Next Steps (Part 2B sequence)

| Part | Scope |
|------|-------|
| **2B.3** | Compliance Analytics & Regulatory Intelligence |
| **2B.4** | OpenAPI/Orval, full integration, final M2.6 report, M2.7 handover |

---

## Notes

- Bow-tie is a **foundation** layer (element storage); visual diagram rendering is deferred to a future UI pass.
- Matrix configs are org-scoped; a default 5×5 matrix is seeded for Acme.
- Uses existing `RISK_ASSESSMENT_READ/MANAGE` permissions from `0002_auth.sql`.
