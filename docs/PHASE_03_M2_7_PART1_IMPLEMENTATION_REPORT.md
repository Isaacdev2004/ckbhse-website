# Phase 03 — Milestone 2.7 Part 1 — Administration Foundation

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.7 Part 1 delivers the **administration foundation**: platform governance APIs under `/api/v1/admin/*`, a new `artifacts/admin-portal` SPA at `/admin/` (port **5185**), OpenAPI/Orval hooks for all admin surfaces, and RBAC-gated cross-tenant read paths for organizations, users, roles, permissions, audit logs, feature flags, and system metadata.

CMS, media library, SEO admin, and content migration from `lib/content` are **deferred to later M2.7 parts** per the enterprise roadmap.

**Verification:** typecheck pass, **537 tests** passing (523 baseline + 12 admin/coverage guards + 2 `AdminService` unit tests).

---

## Delivered Capabilities

### Domain & Data Layer
- `@workspace/domain/admin` — dashboard, org/user/role/permission summaries, audit log entries, feature flag rows
- `DrizzleAdminStore` — cross-tenant counts, directory queries, audit log search, feature flag listing
- `AdminRepository` — RBAC gates using existing permissions (`ADMIN_ACCESS`, `TENANT_VIEW_ALL`, `USER_READ`, `ROLE_READ`, `PERMISSION_READ`, `AUDIT_LOG_READ`, `FEATURE_FLAG_MANAGE`, `SYSTEM_READ`)

### Service Layer
- `AdminService` — dashboard, directory listings, audit search, feature flag updates, authenticated system health/version
- Wired into `createServices()` as `services.admin`

### API Routes (`/api/v1/admin`)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard` | Platform KPI counts |
| GET | `/organizations` | Tenant directory |
| GET | `/users` | User search (`?keyword=`) |
| GET | `/roles` | Role catalogue |
| GET | `/permissions` | Permission matrix |
| GET | `/audit-logs` | Audit explorer (filterable) |
| GET | `/feature-flags` | Global flags |
| PATCH | `/feature-flags/:key` | Toggle/update flag |
| GET | `/system/health` | Authenticated health snapshot |
| GET | `/system/version` | Build/version metadata |

### Admin Portal (`artifacts/admin-portal`)
- Base path `/admin/`, dev port **5185**
- Dark admin shell with permission-gated routes
- Pages: dashboard, organizations, users, roles, permissions, audit log, feature flags, system
- Generated React Query hooks from `@workspace/api-client-react`

### OpenAPI & Codegen
- Extended `lib/api-spec/openapi.yaml` with `admin` tag and typed schemas (`AdminDashboardData`, `PlatformAuditLogEntry`, etc.)
- Regenerated `@workspace/api-client-react` and `@workspace/api-zod`
- OpenAPI coverage guards for M2.7 admin paths in `openapi-coverage.test.ts`

---

## Demo Access

| Role | Email | Password | Org ID |
|------|-------|----------|--------|
| Platform admin | `admin@ckbhse.co.uk` | `StaffDev123!` | `00000000-0000-4000-8000-000000000001` |

**Local dev:**

```bash
# API (if not already running)
pnpm --filter @workspace/api-server run dev

# Admin portal
pnpm --filter @workspace/admin-portal run dev
# → http://localhost:5185/admin/
```

---

## Architecture Notes

- Presentation → Services → Repositories → Store → DB (unchanged)
- No new permissions added — reuses platform RBAC seed from M2.3 auth
- No new DB migration — uses existing `organizations`, `users`, `roles`, `permissions`, `audit_logs`, `feature_flags`, `outbox` tables
- Super Admin separation: admin portal requires `ADMIN_ACCESS`; cross-tenant views require `TENANT_VIEW_ALL`

---

## Files Added / Changed (Key)

| Area | Files |
|------|-------|
| Domain | `lib/domain/src/admin/index.ts`, exports in `package.json` / `src/index.ts` |
| Data | `lib/data/src/stores/drizzle-admin.store.ts`, `repositories/admin.repository.ts`, exports |
| Services | `lib/services/src/admin/*`, wired in `lib/services/src/index.ts` |
| API | `artifacts/api-server/src/routes/v1/admin.ts`, `admin.test.ts`, mount in `index.ts` |
| OpenAPI | `lib/api-spec/openapi.yaml`, regenerated clients |
| Portal | `artifacts/admin-portal/**` (new SPA) |
| Tests | `admin.service.test.ts`, `admin.test.ts`, `openapi-coverage.test.ts` |

---

## Deferred to M2.7 Part 2+

1. CMS content migration from `lib/content` to database-backed pages
2. Media library and SEO administration
3. Training administration surfaces
4. Cross-tenant oversight UI polish (filters, pagination, detail drawers)
5. User/role assignment write APIs (Part 1 is read-heavy + feature flag toggle)

---

## Verification Checklist

- [x] Admin domain types exported
- [x] Admin repository + store queries
- [x] AdminService with RBAC
- [x] `/api/v1/admin/*` routes mounted
- [x] Admin route auth tests
- [x] OpenAPI admin paths + Orval codegen
- [x] `artifacts/admin-portal` scaffold with generated hooks
- [x] 537 tests passing
- [x] Typecheck and builds pass

**Milestone 2.7 Part 1: COMPLETE**

**Next:** M2.7 Part 2 — CMS foundation and content migration planning
