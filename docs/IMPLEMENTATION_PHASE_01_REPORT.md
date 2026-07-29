# Implementation Phase 01 Report — Enterprise Foundation Hardening

**Project:** CKBHSE Enterprise Digital Platform  
**Phase:** 01 — Foundation Hardening  
**Status:** Complete  
**Grounded in:** Documents 03, 03.5, 04, 05 (Milestone 0 / foundation track)  
**Verified at:** `pnpm run verify` green (format, lint, typecheck, 186 tests); `pnpm run build` green

---

## 1. Executive Summary

Phase 01 transformed the repository from “hardened API edge + empty domain” into an **enterprise-ready development platform**. Cross-cutting concerns that every future module depends on now exist as reusable, transport-agnostic infrastructure in `@workspace/platform`, wired into the API through a composition root.

**What this phase delivered**

- Strict TypeScript across the workspace (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, and related strict flags).
- A framework-agnostic platform package covering errors, permissions, authorization context, repositories, audit, search contracts, email, storage, notifications, jobs, feature flags, and logging channels.
- API-server integration: centralized config, request context, CSRF protection, structured multi-channel logging, OpenAPI error-contract alignment, and in-memory adapters behind provider interfaces.
- Cleanup of dead surface area (`mockup-sandbox`, duplicate `middlewares/` directory, bearer-token client path).

**What this phase deliberately did not deliver**

- No domain schema, migrations, or business repositories.
- No authentication/sessions (anonymous context only until Milestone 3).
- No durable audit table (framework + log sink only).
- No portal pages, LMS, CMS, or public content expansion.
- No live email, object storage, or vendor SDKs.

The foundation is ready for Phase 02 (schema baseline, enquiry persistence, and identity) without architectural restructuring.

---

## 2. Completed Tasks

| #   | Task                     | Status | Where                                                      |
| --- | ------------------------ | ------ | ---------------------------------------------------------- |
| 1   | TypeScript hardening     | Done   | `tsconfig.base.json`, UI primitive fixes                   |
| 2   | Repository layer         | Done   | `lib/platform/src/repository`                              |
| 3   | Authorization context    | Done   | `lib/platform/src/authorization`                           |
| 4   | Permission catalogue     | Done   | `lib/platform/src/permissions`                             |
| 5   | Audit framework          | Done   | `lib/platform/src/audit` + repository hooks                |
| 6   | Error framework          | Done   | `lib/platform/src/errors` + API middleware                 |
| 7   | Email abstraction        | Done   | `lib/platform/src/email`                                   |
| 8   | Storage abstraction      | Done   | `lib/platform/src/storage`                                 |
| 9   | Search framework         | Done   | `lib/platform/src/search`                                  |
| 10  | Notification framework   | Done   | `lib/platform/src/notifications`                           |
| 11  | Background job framework | Done   | `lib/platform/src/jobs`                                    |
| 12  | Feature flag framework   | Done   | `lib/platform/src/flags`                                   |
| 13  | Configuration layer      | Done   | `artifacts/api-server/src/config`                          |
| 14  | Security hardening       | Done   | Helmet, CORS, rate limit, CSRF, cookies                    |
| 15  | Logging improvements     | Done   | App / audit / security / performance channels              |
| 16  | OpenAPI improvements     | Done   | Shared `ErrorResponse` + named responses                   |
| 17  | Developer experience     | Done   | `.env.example`, `replit.md`, container, tests              |
| 18  | Codebase cleanup         | Done   | Removed mockup-sandbox, duplicate middleware, local errors |

---

## 3. Files Added

### `lib/platform` (new package)

| Path                                                | Purpose                                                        |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `package.json`, `tsconfig.json`, `vitest.config.ts` | Package surface and tests                                      |
| `src/errors/`                                       | Typed `AppError` taxonomy aligned with OpenAPI                 |
| `src/permissions/`                                  | Central permission catalogue (`PERMISSIONS`)                   |
| `src/authorization/`                                | Authz context, `can` / `requirePermission`, tenant scope       |
| `src/repository/`                                   | Contracts, `BaseRepository`, in-memory store, audit hooks      |
| `src/audit/`                                        | Audit events, recorder, redaction, sink interface              |
| `src/search/`                                       | Pagination, sort allowlists, permission-aware search contracts |
| `src/email/`                                        | `EmailProvider` + in-memory adapter                            |
| `src/storage/`                                      | `StorageProvider` + in-memory adapter, tenant key helper       |
| `src/notifications/`                                | Multi-channel dispatcher interfaces                            |
| `src/jobs/`                                         | Job registry + in-memory queue                                 |
| `src/flags/`                                        | Declared feature-flag service (dev/staging/production)         |
| `src/logging/`                                      | Logger / LoggerFactory contracts and channels                  |

### API server

| Path                                | Purpose                                         |
| ----------------------------------- | ----------------------------------------------- |
| `src/container.ts`                  | Composition root for platform adapters          |
| `src/container.test.ts`             | Provider wiring tests                           |
| `src/contract.test.ts`              | OpenAPI ↔ `ErrorCode` lockstep guard            |
| `src/config/index.ts`               | Grouped configuration (cookies, CSRF, CORS, DB) |
| `src/middleware/csrf.ts`            | Double-submit CSRF issue + verify               |
| `src/middleware/request-context.ts` | Request ID + anonymous authz context            |
| `src/middleware/middleware.test.ts` | CSRF / context coverage                         |
| `src/types/express.d.ts`            | `req.auth`, `req.requestId`                     |

### Generated / contract

- Shared OpenAPI error response schemas and regenerated Zod / React client types.

---

## 4. Files Modified (material)

| Path                                              | Change                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `tsconfig.base.json`                              | Enabled full strict suite including indexed access and exact optionals          |
| `tsconfig.json`                                   | Project reference to `@workspace/platform`                                      |
| `artifacts/api-server/src/app.ts`                 | Middleware order: context → CSRF → routes → errors                              |
| `artifacts/api-server/src/config/env.ts`          | Expanded validated env (`COOKIE_SECRET`, `APP_ENV`, optional `DATABASE_URL`, …) |
| `artifacts/api-server/src/middleware/error.ts`    | Maps `AppError` / Zod to shared envelope                                        |
| `artifacts/api-server/src/middleware/security.ts` | Rate limiters + cookie-ready defaults                                           |
| `artifacts/api-server/src/lib/logger.ts`          | Implements platform logging channels                                            |
| `lib/api-spec/openapi.yaml`                       | Shared `ErrorResponse` and reusable HTTP error responses                        |
| `lib/api-client-react/src/custom-fetch.ts`        | `credentials: 'same-origin'`; removed bearer-token getter                       |
| `.env.example`                                    | Documents the validated configuration surface                                   |
| `replit.md`                                       | Platform usage rules; removed mockup-sandbox                                    |
| Selected `lib/ui` primitives                      | Type fixes required by exact optional / indexed access                          |

### Removed

| Path                                     | Reason                                   |
| ---------------------------------------- | ---------------------------------------- |
| `artifacts/mockup-sandbox/**`            | No purpose; Document 05 M0 cleanup (D18) |
| `artifacts/api-server/src/middlewares/`  | Duplicate of `middleware/`               |
| `artifacts/api-server/src/lib/errors.ts` | Replaced by `@workspace/platform/errors` |

---

## 5. Architectural Decisions Applied

| ADR / standard                     | How Phase 01 respects it                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| Express single backend             | All HTTP wiring remains in `api-server`; platform has no Express dependency         |
| React + Vite frontend              | Unchanged; foundation is backend/cross-cutting                                      |
| Repository pattern mandatory       | `BaseRepository` + `EntityStore`; context is the first parameter on every method    |
| Layer-based backend                | Errors/authz/repos live below transport; container is the composition root          |
| Multi-tenant architecture          | `resolveTenantScope` / `getTenantId`; org id is the tenant under single-org tenancy |
| RBAC via permissions               | Catalogue is code; `can()` never reads role names                                   |
| Audit logging mandatory            | Hooks on repository mutations; sink swappable (currently log channel)               |
| Shared UI only                     | No new UI; `lib/ui` remains sole primitive source                                   |
| Permission-aware search            | `SearchRequest` cannot carry tenant/permission fields                               |
| No vendor lock-in                  | Email/storage/notifications/jobs are interfaces + in-memory adapters                |
| Session cookies, not bearer tokens | Client fetch aligned; CSRF mounted for ambient credentials                          |

**Tenant ID note.** Document 03 defines single-organisation tenancy: the organisation _is_ the tenant. `AuthorizationContext.organizationId` is that identifier; `getTenantId()` is the explicit alias so call sites do not invent a second field that would drift.

---

## 6. Security Improvements

- **CSRF double-submit** mounted globally; safe methods and cookie-less requests exempt.
- **Fail-closed CSRF exemption:** keyed on “no cookies at all”, not “no CSRF cookie”, so a session cookie without a CSRF counterpart is rejected (regression test added).
- **Helmet CSP**, CORS allowlist, body size limit, global rate limiting.
- **Auth rate limiter** defined (ready to mount on credential routes in Milestone 3).
- **Cookie defaults:** `httpOnly`, `secure` in production, `sameSite: 'lax'`, shared `path: '/'`.
- **Production boot fails** without `COOKIE_SECRET` (≥32) and `TRUST_PROXY=true`.
- **Error messages:** unexpected faults withhold internal detail; `AppError` opts messages in.
- **Audit redaction** of sensitive fields before before/after capture.
- **Permission strings are a closed union** — typos do not compile.

---

## 7. Technical Debt Removed

| Debt                                                | Resolution                                                 |
| --------------------------------------------------- | ---------------------------------------------------------- |
| D6 bearer-token client path                         | Removed `setAuthTokenGetter`; `credentials: 'same-origin'` |
| D17 duplicate `middlewares/`                        | Deleted                                                    |
| D18 `mockup-sandbox`                                | Deleted                                                    |
| Local API `errors.ts` vs shared taxonomy            | Moved to `@workspace/platform/errors`                      |
| Unused / inconsistent OpenAPI error models          | Shared `ErrorResponse` + named responses + contract test   |
| Per-call-site config derivation                     | Centralized in `config/index.ts`                           |
| Lax TypeScript allowing indexed / optional footguns | Strict flags enabled workspace-wide                        |

---

## 8. Remaining Risks

| Risk                                                        | Severity               | Mitigation for Phase 02+                                           |
| ----------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| Audit sink is log-only (not immutable DB)                   | High for compliance    | Add audit table + DB sink in Milestone 3; revoke `UPDATE`/`DELETE` |
| No schema / migrations yet                                  | Blocks all persistence | Milestone 0/2 baseline: organisations, users, enquiries            |
| `lib/db` still throws if `DATABASE_URL` unset when imported | Medium                 | Lazy connect or readiness-gated import before domain work          |
| Anonymous-only request context                              | Expected               | Session middleware in Milestone 3                                  |
| `/api` still unversioned (`/api` not `/api/v1`)             | Medium                 | Introduce `/api/v1` before first external consumer                 |
| No e2e / axe / secret scanning in CI                        | Medium                 | Document 05 M0 CI gates still open                                 |
| Deployment still unwired (`.replit` build/run)              | High for launch        | Document 05 immediate action #1                                    |
| Storage ADR not yet written as a formal ADR file            | Low                    | Record provider choice before document uploads (M4)                |
| `authRateLimiter` defined but unmounted                     | Low                    | Mount with login/register routes                                   |

---

## 9. Verification Results

| Gate                            | Result                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm run format:check`         | Pass                                                                                         |
| `pnpm run lint`                 | Pass (2 pre-existing warnings: react-refresh export, unused `actionTypes` in toast hook)     |
| `pnpm run typecheck`            | Pass                                                                                         |
| `pnpm run test`                 | Pass — **151** platform + **35** API server = **186**                                        |
| `pnpm run build`                | Pass (website + API)                                                                         |
| Existing health endpoints       | Operational (`/api/healthz`, `/api/readyz`)                                                  |
| Architectural duplication check | No second UI kit; no Express in `lib/platform`; providers only constructed in `container.ts` |

---

## 10. Recommendations Before Phase 02

Phase 02 should begin Document 05’s **Milestone 0 remainder + Milestone 2 enquiry slice**, not portals.

1. **Wire deployment** (`.replit` build/run, path-prefixed edge routing) so staging exists.
2. **Author the first migrations** — organisations, users (minimal), enquiries — without inventing the full domain model.
3. **Make `/readyz` database-aware** once `DATABASE_URL` is optional-but-checked.
4. **Select the email provider** (procurement) and add one adapter behind `EmailProvider`; keep other vendors as future adapters.
5. **Record a storage ADR** (S3-compatible recommended) before any upload feature.
6. **Add CI gates:** Playwright smoke, `axe`, dependency/secret scanning.
7. **Do not start Client/Staff/LMS portals** until identity (Milestone 3) and the enquiry write path are real.
8. **Keep using the composition root** — the first route that imports a vendor SDK directly undoes Phase 01.

### Suggested Phase 02 exit criteria

- Enquiry form persists, emails (via adapter, even if sandbox), and appears in a minimal internal list.
- Schema migrations reversible in development.
- Cross-tenant test template exists for the first tenant-scoped repository (even if still in-memory against Drizzle later).

---

## 11. Commit Trail (Phase 01)

| Commit    | Summary                                         |
| --------- | ----------------------------------------------- |
| `3606087` | Remove mockup-sandbox and duplicate middleware  |
| `3b1958c` | Enable strict TypeScript across the workspace   |
| `16587d4` | Align API client with session-cookie decision   |
| `517b0c6` | Add `lib/platform` cross-cutting infrastructure |
| `b6c4e0b` | Wire platform foundation into the API server    |
| `e8941f1` | OpenAPI `ErrorResponse` shared responses        |
| `11aafbc` | CSRF fail-closed exemption                      |
| `bfe5248` | `getTenantId` alias for organisation tenancy    |
| _(this)_  | Phase 01 report and `replit.md` platform guide  |

---

_End of report._
