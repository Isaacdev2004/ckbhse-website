# Phase 03 — Milestone 2.6 Part 2B.4 — OpenAPI/Orval Integration

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.6 Part 2B.4 completes **contract-first integration** for audit, inspection, compliance, CAPA, risk, and analytics domains. The OpenAPI spec is extended with portal M2.6 routes and shared schemas; Orval regenerates React Query hooks and Zod validators; staff and client portals migrate key dashboards to generated hooks; CI client-sync remains green.

**Verification:** typecheck pass, **523 tests** passing (521 + 2 OpenAPI coverage guards).

---

## Delivered Capabilities

### OpenAPI Contract
- Extended `lib/api-spec/openapi.yaml` with:
  - Portal compliance workspace + analytics (`/v1/portal/compliance/*`)
  - Portal audit, inspection, CAPA, and risk detail routes
  - Staff alert acknowledgement (`POST /v1/compliance/analytics/alerts/{alertId}/acknowledge`)
- Shared schemas:
  - `ComplianceExecutiveDashboard`
  - `PortalComplianceResponse`
  - `RegulatoryAlertListResponse`

### Orval Codegen
- Regenerated `@workspace/api-client-react` — React Query hooks for all M2.6 staff/portal endpoints
- Regenerated `@workspace/api-zod` — runtime validators aligned with contract
- **Zod v3 compatibility:** `override.zod.version: 3` in `orval.config.ts` (fixes Orval 8.23 `looseObject` vs Zod 3.25)
- Fixed `@workspace/api-zod` barrel export (removed duplicate `export * from './generated/types'`)

### Portal Integration (Generated Hooks)
Staff portal pages now use `@workspace/api-client-react`:

| Page | Hook(s) |
|------|---------|
| `/compliance` | `useComplianceWorkspace`, `useComplianceDashboard` |
| `/compliance/analytics` | `useComplianceAnalyticsExecutive` |
| `/compliance/analytics/regulatory` | `useComplianceAnalyticsRegulatory`, `useAcknowledgeComplianceAnalyticsAlert` |
| `/compliance/analytics/performance` | `useComplianceAnalyticsPerformance` |
| `/compliance/analytics/exports` | `useComplianceAnalyticsExports`, `useCreateComplianceAnalyticsExport` |
| `/capa/dashboard` | `useCapaDashboard` |
| `/risk-assessments/dashboard` | `useRiskAssessmentDashboard` |

Client portal pages:

| Page | Hook(s) |
|------|---------|
| `/compliance` | `usePortalCompliance` |
| `/compliance/analytics` | `usePortalComplianceAnalyticsExecutive`, `usePortalComplianceAnalyticsAlerts` |
| `/capa/dashboard` | `usePortalCapaDashboard` |
| `/risk-assessments/dashboard` | `usePortalRiskDashboard` |

Manual `complianceFetch` / `portalFetch` helpers remain for list/detail sub-pages not yet migrated (incremental adoption pattern).

### Contract Guards
- `artifacts/api-server/src/openapi-coverage.test.ts` — asserts core M2.6 paths and schemas exist in OpenAPI
- Existing `contract.test.ts` — error code taxonomy lockstep
- CI step: `pnpm --filter @workspace/api-spec run codegen` + git diff check

---

## Codegen Workflow

```bash
pnpm --filter @workspace/api-spec run codegen
```

Generates:
- `lib/api-client-react/src/generated/api.ts` — fetch functions + React Query hooks
- `lib/api-zod/src/generated/api.ts` — Zod request/response validators

Configuration: `lib/api-spec/orval.config.ts`

---

## Architecture

```
openapi.yaml (source of truth)
        ↓  orval codegen
api-client-react (hooks)  +  api-zod (validators)
        ↓
staff-portal / client-portal pages
        ↓
/api/v1/* Express routes → Services → Repositories
```

---

## Key Files

| Path | Change |
|------|--------|
| `lib/api-spec/openapi.yaml` | Portal M2.6 paths + shared schemas |
| `lib/api-spec/orval.config.ts` | Zod v3 pin |
| `lib/api-zod/src/index.ts` | Duplicate export fix |
| `lib/api-client-react/src/generated/*` | Regenerated hooks |
| `lib/api-zod/src/generated/*` | Regenerated validators |
| `artifacts/api-server/src/openapi-coverage.test.ts` | Route coverage guard |
| `artifacts/staff-portal/src/pages/compliance/**` | Generated hook migration |
| `artifacts/staff-portal/src/pages/capa/dashboard.tsx` | Generated hook migration |
| `artifacts/staff-portal/src/pages/risk-assessments/dashboard.tsx` | Generated hook migration |
| `artifacts/client-portal/src/pages/compliance*.tsx` | Generated hook migration |
| `artifacts/client-portal/src/pages/capa/dashboard.tsx` | Generated hook migration |
| `artifacts/client-portal/src/pages/risk-assessments/dashboard.tsx` | Generated hook migration |

---

## Test Coverage

| Suite | New tests |
|-------|-----------|
| `openapi-coverage.test.ts` | 2 (M2.6 path + schema guards) |

**Total:** 523 tests.

---

## Remaining Incremental Work (Post M2.6)

1. Add typed response schemas for CAPA/risk/audit dashboard payloads (currently `type: object` → hooks return loose types)
2. Migrate remaining list/detail pages from manual fetch helpers to generated hooks
3. Wire Zod validators on API routes for M2.6 POST/PATCH bodies
4. Split OpenAPI monolith by domain module (Document 06 recommendation)

---

## Next Step

**M2.7** — per enterprise delivery roadmap (next business platform milestone).

See [`PHASE_03_M2_6_FINAL_IMPLEMENTATION_REPORT.md`](PHASE_03_M2_6_FINAL_IMPLEMENTATION_REPORT.md) for the complete M2.6 summary.
