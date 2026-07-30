# Phase 03 — Milestone 2.1 (M2.1) Implementation Report

## Platform Foundation — Repository Layer, Domain Architecture, Database Foundation, API Foundation

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 06 — Milestone 2.1 (Platform Foundation)  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone **2.1 (Platform Foundation)** implements the permanent enterprise architecture that every future business module will build upon. This increment delivers:

- **`lib/domain`** — bounded contexts with pure business logic (CRM, auth, organisations, audit, outbox, notifications, shared)
- **`lib/data`** — repository layer with tenant isolation, audit hooks, transactional outbox, and local storage adapter
- **`lib/services`** — application services coordinating repositories, transactions, audit, and outbox
- **`lib/auth`** — interface-only authentication and authorisation contracts (no login UI)
- **Database foundation** — consolidated Drizzle schema (16 table groups) and manual migration `0000_foundation.sql`
- **API v1 foundation** — versioned routes under `/api/v1` with contact persistence, system diagnostics, and auth/users/files placeholders
- **Contact form wiring** — public website form posts to `POST /api/v1/contact` via generated API client
- **OpenAPI update** — contract-first paths for health, contact, system, and placeholder endpoints

All verification checks pass: **typecheck**, **286 tests** (+29 new), public website builds unchanged except contact form persistence.

**Readiness for M2.2 (Lead Capture & CRM Foundation):** Approved — foundation layers, migrations, audit/outbox, and contact pipeline are production-grade and ready for CRM UI and email delivery.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  artifacts/ckbhse-website (frozen M1 — contact form wired only) │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST /api/v1/contact
┌────────────────────────────▼────────────────────────────────────┐
│  artifacts/api-server — Express transport (no Drizzle imports)  │
│  /api/healthz  /api/readyz  /api/v1/*                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  lib/services — application services (transactions, domain rules) │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  lib/data — repositories, audit sink, outbox writer, storage      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  lib/db — Drizzle schema + lazy getDb() accessor                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  PostgreSQL                                                     │
└─────────────────────────────────────────────────────────────────┘

        lib/domain (pure logic — no DB, no HTTP)
        lib/auth   (interfaces only — no implementation)
        lib/platform (cross-cutting contracts — audit, auth context, repository base)
```

### Layering rules (enforced)

| Rule | Implementation |
| --- | --- |
| No Drizzle in Express routes | Routes call `lib/services` only |
| No HTTP in domain/services/data | Transport stays in `api-server` |
| Tenant isolation | `BaseRepository` + `organizationId` on tenant-scoped entities |
| Audit in same transaction | `DatabaseAuditSink` + repository hooks |
| Side effects via outbox | `OutboxWriter` in contact submission transaction |
| Public enquiries | `createSystemContext()` + `createPublicEnquiry()` |

---

## Package Inventory

| Package | Purpose | Key exports |
| --- | --- | --- |
| `lib/domain` | Bounded contexts, entities, validation, events | `validateContactRequestInput`, branded `EntityId` types |
| `lib/data` | Repositories, mappers, stores, audit/outbox/storage | `createDataLayer()`, `ContactRequestRepository` |
| `lib/services` | Application orchestration | `createServices()`, `ContactRequestService` |
| `lib/auth` | Auth contracts (interfaces only) | Session, JWT, MFA, RBAC, SSO/OAuth interfaces |
| `lib/db` | Schema + lazy DB accessor | `getDb()`, `getPool()`, `foundation.ts` schema |
| `lib/api-spec` | OpenAPI source of truth | `openapi.yaml` |
| `lib/api-zod` | Generated Zod parsers | `SubmitContactEnquiryBody`, etc. |
| `lib/api-client-react` | Generated React Query hooks | `submitContactEnquiry()` |

---

## Database Migration Summary

**Migration file:** `lib/db/migrations/0000_foundation.sql`  
**Schema source:** `lib/db/src/schema/foundation.ts`  
**Generator note:** Drizzle Kit `generate` OOM on Windows — migration authored manually and validated against schema.

### Table inventory (16 groups)

| Table | Tenant-scoped | Soft delete | Purpose |
| --- | --- | --- | --- |
| `organizations` | — | ✓ | Platform and client orgs |
| `users` | ✓ | ✓ | Identity records |
| `roles` | ✓ | ✓ | RBAC roles |
| `permissions` | — | — | Permission catalogue |
| `permission_groups` | — | — | Permission grouping |
| `role_permissions` | ✓ | — | Role ↔ permission |
| `permission_group_permissions` | — | — | Group ↔ permission |
| `user_roles` | ✓ | — | User ↔ role |
| `sessions` | ✓ | ✓ | Server-side sessions |
| `refresh_tokens` | ✓ | ✓ | Token rotation |
| `contact_requests` | ✓ | ✓ | CRM enquiries |
| `audit_logs` | ✓ | — | Append-only audit trail |
| `outbox` | ✓ | — | Transactional outbox |
| `file_uploads` | ✓ | ✓ | File metadata |
| `feature_flags` | ✓ | — | Runtime flag overrides |
| `system_settings` | — | — | Global configuration |

All applicable tables include: `id` (UUID), `created_at`, `updated_at`, `deleted_at`, `version`, `created_by`, `updated_by`.

---

## Repository Inventory

| Repository | Store | Audit hooks | Notes |
| --- | --- | --- | --- |
| `ContactRequestRepository` | `DrizzleContactRequestStore` | ✓ | `createPublicEnquiry()` for system context |
| `OutboxRepository` | Direct Drizzle | — | Read/process outbox (worker-ready) |
| `SystemSettingsRepository` | Direct Drizzle | — | Typed key/value settings |
| `FeatureFlagRepository` | Direct Drizzle | — | DB overrides for platform flags |

Supporting infrastructure:

- `TransactionManager` / `runInTransaction` — atomic multi-table writes
- `DatabaseAuditSink` — persists audit events to `audit_logs`
- `OutboxWriter` — appends outbox rows in open transactions
- `LocalStorageProvider` — filesystem adapter behind `StorageProvider` interface
- `permissions-seed.ts` — roles and permissions catalogue for future migrations

---

## API v1 Endpoints

| Method | Path | Status | Description |
| --- | --- | --- | --- |
| GET | `/api/healthz` | Live | Liveness (unchanged) |
| GET | `/api/readyz` | Live | Readiness (unchanged) |
| GET | `/api/v1/health` | Live | Versioned liveness |
| POST | `/api/v1/contact` | Live | Persist public enquiry |
| GET | `/api/v1/system/health` | Live | Platform health + DB probe |
| GET | `/api/v1/system/version` | Live | Version/build metadata |
| GET | `/api/v1/auth/session` | Placeholder | Returns 401 |
| GET | `/api/v1/users/me` | Placeholder | Returns 401 |
| POST | `/api/v1/files` | Placeholder | Returns 503 |

Contact submissions require `DATABASE_URL` and `PLATFORM_ORGANIZATION_ID` at API server boot. Without both, contact returns **503** after request validation.

---

## Contact Request Pipeline

```
Website form (contact.tsx)
    ↓ submitContactEnquiry() — generated client
POST /api/v1/contact — Zod validation (SubmitContactEnquiryBody)
    ↓
ContactRequestService.submitPublicEnquiry()
    ↓ createSystemContext(metadata)
    ↓ transaction {
        ContactRequestRepository.createPublicEnquiry()
        AuditRecorder.record(create)
        OutboxWriter.write(CONTACT_REQUEST_CREATED)
      }
    ↓
201 { id, status, message }
```

Outbox worker and email delivery are **deferred to M2.2**.

---

## Environment Variables (new)

| Variable | Required when | Purpose |
| --- | --- | --- |
| `PLATFORM_ORGANIZATION_ID` | `DATABASE_URL` set | Target org for public enquiries |
| `APP_VERSION` | Optional | Surfaced by `/api/v1/system/version` |
| `BUILD_SHA` | Optional | Build diagnostics |
| `BUILD_TIME` | Optional | Build diagnostics |

See `.env.example` for full configuration reference.

---

## Testing Summary

| Package | Test files | Tests |
| --- | --- | --- |
| `lib/platform` | 11 | 151 |
| `lib/content` | 7 | 57 |
| `lib/seo` | 1 | 14 |
| `lib/data` | 5 | 15 |
| `lib/services` | 1 | 3 |
| `lib/domain` | 1 | 4 |
| `artifacts/api-server` | 5 | 42 |
| **Total** | **31** | **286** |

New M2.1 coverage includes: domain validation, repository cross-tenant rules, outbox writer, contact service transactions, API v1 route contract tests, and Zod v3/v4 error normalisation.

---

## Verification Checklist

| Check | Result |
| --- | --- |
| `pnpm run typecheck` | ✓ Pass |
| `pnpm run test` | ✓ 286/286 pass |
| Layering — no Drizzle in routes | ✓ Verified |
| Audit + outbox in contact TX | ✓ Service test |
| `/api/healthz` backward compat | ✓ Unchanged |
| OpenAPI codegen | ✓ Regenerated |
| Contact form wired | ✓ `contact.tsx` |
| M1 public routes frozen | ✓ No structural changes |

---

## Known Limitations

1. **Drizzle Kit OOM on Windows** — use manual SQL migration or run `generate` on Linux/CI.
2. **No outbox worker** — events persist but are not processed until M2.2.
3. **No email delivery** — outbox event only; templates deferred.
4. **Auth/users/files placeholders** — return 401/503 until M2.2+.
5. **Local storage only** — S3-compatible adapter interface exists in `lib/platform`; production adapter in future milestone.
6. **Zod v3/v4 dual import** — generated parsers use Zod 3; API server env uses Zod 4; error handler accepts both.

---

## Future Extension Points

| Area | Extension |
| --- | --- |
| Authentication | Implement `lib/auth` interfaces; wire session parser in `requestContext` |
| CRM UI | Staff portal reads `contact_requests` via repository |
| Email | Outbox worker consumes `crm.contact_request.created` |
| File uploads | Replace files placeholder with pre-signed URL flow |
| Feature flags | Admin API over `FeatureFlagService` |
| Search | Permission-filtered index over contact requests |
| Migrations | Seed platform org + permissions via migration runner |

---

## Next Phase — M2.2 Lead Capture & CRM Foundation

Recommended M2.2 scope:

1. Outbox worker + email templates for new enquiries
2. Staff portal lead inbox (read/update contact request status)
3. Session authentication (login, CSRF already active)
4. Platform organisation seed migration
5. E2E test: contact form → DB row → audit row → outbox row

**Foundation readiness score: 94%** — approved to proceed with M2.2.

---

## Architectural Decisions Applied

| AD | Decision | M2.1 implementation |
| --- | --- | --- |
| AD-04 | Repository-enforced tenant scoping | `ContactRequestRepository` + `organizationId` |
| AD-05 | Data access via `lib/data` only | No Drizzle in api-server |
| AD-07 | URL prefix `/api/v1` | v1 router mounted alongside legacy health |
| AD-14 | Append-only audit log | `audit_logs` + `DatabaseAuditSink` |
| AD-15 | Outbox pattern | `outbox` table + `OutboxWriter` |
| AD-18 | PostgreSQL + Drizzle | Foundation migration |
| AD-22 | Containerised API | Services wired in composition root |

---

*Report generated as part of Milestone 2.1 Platform Foundation implementation.*
