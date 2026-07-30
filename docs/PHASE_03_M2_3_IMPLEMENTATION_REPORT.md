# Phase 03 — Milestone 2.3 (M2.3) Implementation Report

## Identity, Authentication & Role-Based Access Control (RBAC)

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 06 — Milestone 2.3 (Identity, Authentication & RBAC)  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone **2.3** replaces the temporary development authentication system (`X-Dev-*` headers) with a production-grade, session-based identity platform that plugs into the existing `AuthorizationContext`, repository layer, services, API routing, and Staff Portal without architectural redesign.

Delivered:

- **`lib/auth`** — concrete implementations: Argon2id password hashing, Drizzle session store, Express cookie manager, database permission/role resolvers, password policy
- **`lib/services/auth`** — `AuthService` for login, logout, session refresh, password change/reset, current user profile
- **`lib/db/migrations/0002_auth.sql`** — session extensions, password reset/history, MFA placeholders, RBAC seed
- **`artifacts/api-server`** — session middleware, seven auth endpoints, `GET /v1/users/me`, audit on auth lifecycle events
- **`artifacts/staff-portal`** — login page, session provider, protected routes, forbidden/unauthorized screens, permission-gated lead routes
- **OpenAPI + Orval** — auth endpoints and current-user contract; React Query hooks regenerated

**Verification:** `pnpm run typecheck` green, **330 tests** passing (15 net new since M2.2), production builds for api-server and staff-portal succeed, no regression to M1 website or M2.1/M2.2 foundation.

**Readiness for M2.4:** Approved — authenticated sessions, RBAC resolution, and organization-scoped identity are operational. MFA, SSO, and password-reset email delivery remain deferred as designed.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  artifacts/staff-portal — /staff/login, protected dashboard & leads  │
│  → generated API client (cookie sessions + CSRF header)                │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ POST /api/v1/auth/login
                                │ GET  /api/v1/auth/session
┌───────────────────────────────▼──────────────────────────────────────┐
│  artifacts/api-server                                                  │
│  requestContext → sessionAuth → devAuth (dev fallback) → CSRF → routes │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  lib/services/auth — AuthService                                       │
│  login / logout / refresh / change-password / reset-password           │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│ lib/auth      │     │ lib/auth        │     │ lib/auth            │
│ SessionStore  │     │ PermissionResolver │  │ RoleResolver        │
│ (Drizzle)     │     │ (DB + inheritance) │  │ (DB assignments)    │
└───────┬───────┘     └────────┬────────┘     └──────────┬──────────┘
        │                      │                         │
        └──────────────────────┼─────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  PostgreSQL — sessions, users, roles, permissions, user_roles, …     │
│  migration 0002_auth.sql + foundation tables from 0000                 │
└──────────────────────────────────────────────────────────────────────┘
```

### Layering (unchanged from M2.1/M2.2)

| Rule | M2.3 enforcement |
| --- | --- |
| No Drizzle in routes | Auth routes call `container.auth` / `AuthService` only |
| No hardcoded permissions in controllers | Routes use `requirePermission(req.auth, …)` |
| Single auth context | `sessionAuth` middleware attaches `AuthorizationContext` |
| Organization isolation | Sessions scoped to `organizationId`; role assignments filtered by org |
| Audit on security events | Login, logout, failed login, password change/reset audited |
| Contract-first API | OpenAPI → Orval → React Query hooks |

---

## Authentication Flow

```
Browser                    API Server                    AuthService              PostgreSQL
   │                           │                            │                        │
   │ POST /auth/login          │                            │                        │
   │ {email, password}         │                            │                        │
   ├──────────────────────────►│ auth.login()               │                        │
   │                           ├───────────────────────────►│ verify Argon2id hash   │
   │                           │                            ├───────────────────────►│
   │                           │                            │ create session row     │
   │                           │                            │ resolve roles/perms    │
   │                           │◄───────────────────────────┤                        │
   │ Set-Cookie: ckbhse_session│                            │                        │
   │◄──────────────────────────┤                            │                        │
   │                           │ audit: auth_session create │                        │
   │                           │                            │                        │
   │ GET /auth/session         │                            │                        │
   │ Cookie: ckbhse_session    │                            │                        │
   ├──────────────────────────►│ sessionAuth middleware     │                        │
   │                           ├───────────────────────────►│ load + renew session   │
   │                           │◄───────────────────────────┤ build AuthorizationCtx │
   │ {userId, roles, perms}    │                            │                        │
   │◄──────────────────────────┤                            │                        │
   │                           │                            │                        │
   │ POST /auth/logout         │                            │                        │
   ├──────────────────────────►│ revoke session + clear cookie                       │
   │                           │ audit: auth_session delete │                        │
```

### Session cookie

| Property | Value |
| --- | --- |
| Name | `ckbhse_session` |
| Value | Session UUID (not the token hash) |
| HttpOnly | Yes |
| SameSite | Lax |
| Secure | Production only |
| CSRF | Double-submit via `csrf_token` cookie + `x-csrf-token` header on mutating requests |

### Session lifetimes

| Mode | Absolute expiry | Idle expiry |
| --- | --- | --- |
| Standard | 24 hours | 2 hours |
| Remember me | 30 days | 7 days |

---

## RBAC Design

### Role hierarchy (13 roles)

Roles are data-driven in `permissions`, `roles`, `role_permissions`, and `user_roles` tables. Inheritance is resolved at runtime via `lib/data/src/seed/role-inheritance.ts`:

| Role key | Inherits from | Purpose |
| --- | --- | --- |
| `super_admin` | — | Full platform access |
| `platform_admin` | — | Platform operations |
| `organization_admin` | — | Tenant administration |
| `manager` | `staff` | Team management |
| `consultant` | `staff` | Delivery consultant |
| `operations_manager` | `manager` | Operations oversight |
| `trainer` | `staff` | Training delivery |
| `auditor` | `read_only` | Audit conduct |
| `staff` | — | General staff access |
| `finance` | `read_only` | Financial read/manage |
| `read_only` | — | Read-only baseline |
| `client_user` | — | Client portal (future) |
| `learner` | — | Learning portal (future) |

Document 06 role names map to these keys: Platform Administrator → `platform_admin`, Organization Administrator → `organization_admin`, Manager → `manager`, Consultant → `consultant`, Trainer → `trainer`, Auditor → `auditor`, Staff → `staff`, Client → `client_user`, Learner → `learner`, Finance → `finance`, Read-only → `read_only`.

### Permission resolution

1. Load `user_roles` for `(userId, organizationId)` including platform-scoped assignments (`organizationId IS NULL`).
2. Expand role keys through `ROLE_INHERITANCE` graph (`expandRoleKeys()`).
3. Join `role_permissions` → `permissions` for all expanded roles.
4. Filter to registered `Permission` constants in `@workspace/platform/permissions`.
5. Attach resolved set to `AuthorizationContext.permissions`.

Controllers call `requirePermission(req.auth, PERMISSIONS.*)` — no inline permission strings.

### Permission caching

`session_permission_cache` table is created as a foundation for future caching. Current implementation resolves permissions on each session load (correctness over cache invalidation complexity for M2.3).

---

## Database Additions

**Migration:** `lib/db/migrations/0002_auth.sql`

| Change | Description |
| --- | --- |
| `sessions.remember_me` | Remember-me flag |
| `sessions.idle_expires_at` | Sliding idle window |
| `password_reset_tokens` | Opaque reset tokens (SHA-256 hashed) |
| `password_history` | Last N password hashes for reuse prevention |
| `mfa_enrolments` | MFA placeholder |
| `mfa_backup_codes` | MFA backup codes placeholder |
| `session_permission_cache` | Future permission cache |
| RBAC seed | Permissions, roles, role_permissions, platform org, dev users |

**Drizzle schema:** `lib/db/src/schema/auth.ts`, extensions in `foundation.ts` (sessions).

**Dev credentials (after migration):**

| Email | Password | Role |
| --- | --- | --- |
| `consultant@ckbhse.co.uk` | `StaffDev123!` | consultant |
| `admin@ckbhse.co.uk` | `StaffDev123!` | platform_admin |

Platform organization ID: `00000000-0000-4000-8000-000000000001`

---

## API Endpoints Added

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Email/password login, sets session cookie |
| POST | `/api/v1/auth/logout` | Revokes session, clears cookie |
| GET | `/api/v1/auth/session` | Current session (roles + permissions) |
| POST | `/api/v1/auth/refresh` | Renews idle window |
| POST | `/api/v1/auth/change-password` | Authenticated password change |
| POST | `/api/v1/auth/request-password-reset` | Request reset token |
| POST | `/api/v1/auth/reset-password` | Complete reset with token |
| GET | `/api/v1/users/me` | Current user profile + auth context |

All endpoints require `DATABASE_URL` and `PLATFORM_ORGANIZATION_ID` except unauthenticated checks (`/auth/session`, `/users/me` return 401 without DB).

---

## Staff Portal Changes

| Component | Purpose |
| --- | --- |
| `pages/login.tsx` | Email/password form with remember-me |
| `providers/auth-provider.tsx` | Session state via `useAuthSession`, login/logout mutations |
| `components/protected-route.tsx` | Redirect unauthenticated users to `/login` |
| `components/permission-route.tsx` | Redirect insufficient permissions to `/forbidden` |
| `pages/unauthorized.tsx` | Session expired / not signed in |
| `pages/forbidden.tsx` | Authenticated but insufficient permissions |
| `components/staff-layout.tsx` | Sign-out button |

Development `X-Dev-*` headers removed from `main.tsx`. Dev auth middleware remains as a **development-only fallback** when no session cookie is present.

Lead routes (`/leads`, `/leads/:id`) require `PERMISSIONS.LEAD_READ`.

---

## Security Considerations

| Topic | Implementation |
| --- | --- |
| Password storage | Argon2id via `Argon2PasswordHasher`; never exposed in API |
| Password policy | Min 12 chars, upper/lower/digit/symbol, common-password block, history (5) |
| Session fixation | New session ID on login; token hash stored server-side |
| CSRF | Global double-submit middleware; client sends `x-csrf-token` |
| Rate limiting | `authRateLimiter` on login, change-password, reset endpoints |
| Tenant isolation | Sessions and role assignments scoped to organization |
| Audit trail | Login success/failure, logout, password change/reset |
| Dev auth fallback | Disabled in production; session auth takes precedence |

---

## Testing

| Package | New/updated tests | Count |
| --- | --- | --- |
| `lib/auth` | Argon2 hasher, password policy | 6 |
| `lib/data` | Role inheritance | (included in 26) |
| `lib/services` | AuthService token helpers, getCurrentUser | 4 |
| `artifacts/api-server` | Auth routes, users/me, v1 foundation | 45 total |

**Full suite:** 330 tests passing.

**Typecheck:** `pnpm run typecheck` — all libs and artifacts green.

**Production build:** api-server esbuild bundle and staff-portal Vite build succeed.

---

## Known Limitations

| Limitation | Planned resolution |
| --- | --- |
| Password reset email not sent | Token created in DB; email dispatch deferred to M2.4+ outbox integration |
| MFA not implemented | Schema + interfaces only; enrolment endpoints are placeholders |
| SSO/OIDC/SAML | Interface contracts in `lib/auth`; no provider wiring |
| Session permission cache unused | Table exists; resolver queries live on each request |
| RBAC admin UI | Role assignment UI deferred; seed + DB model operational |
| Dev auth headers | Retained as dev fallback only; remove when all portals use sessions |

---

## Future MFA Integration

Foundation in place:

- `mfa_enrolments` and `mfa_backup_codes` tables
- `MfaProvider` interface in `lib/auth/src/mfa/`
- Auth routes reserved for future `POST /auth/mfa/enrol`, `POST /auth/mfa/verify`

Integration path: implement `TotpMfaProvider`, extend `AuthService.login` with MFA challenge step, add Staff Portal enrolment UI, audit MFA events.

---

## Developer Guidance

### Local setup

1. Apply migrations: `0000_foundation.sql`, `0001_crm.sql`, `0002_auth.sql`
2. Set environment variables:
   - `DATABASE_URL`
   - `PLATFORM_ORGANIZATION_ID=00000000-0000-4000-8000-000000000001`
3. Start api-server and staff-portal
4. Sign in at `/staff/login` with dev credentials above

### Alternative (development only)

Send `X-Dev-User-Id`, `X-Dev-Organization-Id`, `X-Dev-Roles`, `X-Dev-Permissions` headers when no session cookie is present.

### Regenerate API client

```bash
pnpm -C lib/api-spec run codegen
```

Note: `lib/api-zod/src/index.ts` must not re-export `./generated/types` (duplicate export conflict). This file is hand-maintained after codegen.

---

## Operational Guidance

| Concern | Guidance |
| --- | --- |
| Session revocation | `AuthService.logout` or `SessionStore.revokeAllForUser` on password change |
| Password reset | Tokens expire after 1 hour; single-use via `used_at` |
| Idle timeout | Clients should call `POST /auth/refresh` on activity (Staff Portal refetches on focus) |
| Cookie domain | Configure via `COOKIE_DOMAIN` for cross-subdomain deployments |
| Monitoring | Audit log entries: `auth_session`, `auth_attempt`, `password_reset`, `user_credential` |

---

## Verification Checklist

- [x] Production session authentication replaces development headers (Staff Portal)
- [x] Staff Portal authenticates using real login
- [x] RBAC fully operational (13 roles, inheritance, DB-driven permissions)
- [x] Organization isolation intact
- [x] Audit logging covers authentication lifecycle
- [x] OpenAPI updated
- [x] Orval regenerated
- [x] Database migration `0002_auth.sql` created
- [x] All previous functionality operational
- [x] All tests pass (330)
- [x] Production build passes
- [x] No architectural drift

---

## Files Created

| Path | Purpose |
| --- | --- |
| `lib/auth/src/password/argon2-password-hasher.ts` | Argon2id implementation |
| `lib/auth/src/password/default-password-policy.ts` | Password policy evaluator |
| `lib/auth/src/session/drizzle-session-store.ts` | Persistent session store |
| `lib/auth/src/cookies/express-session-cookie-manager.ts` | HttpOnly cookie handling |
| `lib/auth/src/permissions/database-permission-resolver.ts` | DB permission resolution |
| `lib/auth/src/roles/database-role-resolver.ts` | DB role resolution |
| `lib/db/src/schema/auth.ts` | Auth-related Drizzle tables |
| `lib/db/migrations/0002_auth.sql` | Auth migration + seed |
| `lib/data/src/seed/role-inheritance.ts` | Role inheritance graph |
| `lib/services/src/auth/auth.service.ts` | Application auth service |
| `artifacts/api-server/src/middleware/session-auth.ts` | Session middleware |
| `artifacts/api-server/src/routes/v1/auth.ts` | Auth HTTP routes |
| `artifacts/staff-portal/src/pages/login.tsx` | Login page |
| `artifacts/staff-portal/src/providers/auth-provider.tsx` | Session provider |
| `artifacts/staff-portal/src/components/protected-route.tsx` | Auth guard |
| `artifacts/staff-portal/src/components/permission-route.tsx` | Permission guard |
| `artifacts/staff-portal/src/pages/forbidden.tsx` | 403 screen |
| `artifacts/staff-portal/src/pages/unauthorized.tsx` | 401 screen |
| `scripts/generate-auth-seed-sql.mjs` | RBAC seed generator |
| `lib/auth/src/password/*.test.ts` | Auth unit tests |
| `lib/services/src/auth/auth.service.test.ts` | AuthService tests |
| `artifacts/api-server/src/routes/v1/auth.test.ts` | Auth route tests |
| `docs/PHASE_03_M2_3_IMPLEMENTATION_REPORT.md` | This report |

---

## Files Modified

| Path | Change |
| --- | --- |
| `lib/auth/src/index.ts` | Export concrete implementations |
| `lib/auth/package.json` | argon2, db, data dependencies |
| `lib/db/src/schema/foundation.ts` | Session remember_me, idle_expires_at |
| `lib/db/src/schema/index.ts` | Export auth schema |
| `lib/data/src/seed/permissions-seed.ts` | Expanded role/permission seed |
| `lib/services/src/index.ts` | Wire AuthService in createServices |
| `artifacts/api-server/src/app.ts` | sessionAuth middleware order |
| `artifacts/api-server/src/container.ts` | Auth + session cookie wiring |
| `artifacts/api-server/src/middleware/dev-auth.ts` | Fallback when no session |
| `artifacts/api-server/src/routes/v1/users.ts` | GET /me implementation |
| `artifacts/staff-portal/src/App.tsx` | Protected + permission routes |
| `artifacts/staff-portal/src/main.tsx` | Remove dev header configuration |
| `artifacts/staff-portal/src/components/staff-layout.tsx` | Logout button |
| `lib/api-spec/openapi.yaml` | Auth + current user schemas |
| `lib/api-client-react/src/custom-fetch.ts` | CSRF header injection |
| `lib/api-zod/src/index.ts` | Fix duplicate export after codegen |
| `pnpm-workspace.yaml` | argon2 in onlyBuiltDependencies |

---

## Remaining Work Before M2.4

1. **Password reset email** — wire `requestPasswordReset` token to outbox + email template
2. **MFA enrolment** — TOTP provider + challenge step in login flow
3. **RBAC admin UI** — role assignment management in Staff Portal
4. **Session permission cache** — populate/invalidate on role changes
5. **Remove dev auth fallback** — once all internal tools use session login
6. **Integration tests with live DB** — end-to-end login → CRM lead access

M2.4 work has **not** been started.
