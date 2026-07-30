# Phase 03 — Milestone 2.2 (M2.2) Implementation Report

## Lead Capture & CRM Foundation

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 06 — Milestone 2.2 (Lead Capture & CRM Foundation)  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone **2.2 (Lead Capture & CRM Foundation)** delivers the first fully operational business module: converting public contact enquiries into CRM leads, notifying stakeholders by email, and providing staff tooling to manage the pipeline.

This increment builds directly on M2.1 (repository layer, services, audit, outbox, API v1) without architectural redesign:

- **`lib/workers`** — transactional outbox processor with polling, batching, exponential backoff, dead-letter handling, metrics, and graceful shutdown
- **`lib/email-templates`** — eight branded HTML/plain templates behind a registry
- **`lib/platform/email`** — SMTP provider (nodemailer) alongside in-memory provider
- **`lib/domain/crm`** — lead entities, workflow rules, activities, notes, assignments, reminders, tags
- **`lib/db`** — CRM schema (`0001_crm.sql`) with tenant support, soft delete, audit hooks
- **`lib/data`** — seven CRM repositories with permission-aware search
- **`lib/services/crm`** — lead, timeline, dashboard, reminder services + contact-to-lead orchestration
- **`artifacts/api-server`** — expanded `/api/v1` CRM routes, dev auth, outbox worker lifecycle
- **`artifacts/staff-portal`** — authenticated staff UI at `/staff/leads` and lead detail
- **OpenAPI + codegen** — contract-first CRM endpoints; React Query client regenerated

**Verification:** `pnpm run typecheck` green, **315 tests** passing (29 net new since M2.1), no regression to M1 public website or M2.1 foundation.

**Readiness for M2.3 (Identity, Authentication & RBAC):** Approved — CRM and staff UI are wired through authorization context and permission checks; development identity is header-based only; production login deferred to M2.3 as designed.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  artifacts/ckbhse-website (M1 — unchanged except contact → outbox)   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ POST /api/v1/contact
┌───────────────────────────────▼──────────────────────────────────────┐
│  OutboxWorker (lib/workers) — CONTACT_REQUEST_CREATED                │
│  → LeadService.handleContactRequestCreated                           │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  lib/services/crm — LeadService, TimelineService, DashboardService   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  lib/data — Lead*, Activity, Note, Assignment, Reminder, Tag repos    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  PostgreSQL — leads + 9 related table groups (migration 0001_crm.sql)  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  artifacts/staff-portal — /staff/leads, /staff/leads/:id, dashboard  │
│  → generated API client + dev auth headers → /api/v1/*               │
└──────────────────────────────────────────────────────────────────────┘
```

### Contact → Lead pipeline

1. Public form submits `POST /api/v1/contact` (M2.1).
2. `ContactRequestService` persists enquiry + writes `CONTACT_REQUEST_CREATED` outbox event in one transaction.
3. `OutboxWorker` polls, invokes `createContactRequestCreatedHandler`.
4. `LeadService.handleContactRequestCreated` creates lead, records activities, sends acknowledgement + internal notification emails, marks contact request converted.
5. Staff view leads via `/staff/leads` backed by `LeadRepository.search`.

### Layering (unchanged from M2.1)

| Rule | M2.2 enforcement |
| --- | --- |
| No Drizzle in routes | CRM routes call `container.services` only |
| No HTTP in domain/services/data | Staff portal uses generated client |
| Tenant isolation | All CRM repositories extend `BaseRepository` |
| Audit automatic | Repository hooks + activity timeline |
| Side effects via outbox | Contact → lead conversion is outbox-driven |
| Permission checks | `LEAD_READ` / `LEAD_MANAGE` on all CRM endpoints |

---

## Worker Architecture

**Package:** `lib/workers`

| Capability | Implementation |
| --- | --- |
| Polling scheduler | `setInterval` with configurable `pollingIntervalMs` (default 5s) |
| Batch processing | `batchSize` (default 25) via `listPending` |
| Retry strategy | Exponential backoff via `scheduleRetry` + `nextAttemptAt` column |
| Poison / dead letter | After `maxAttempts`, `markDeadLetter` (`status: dead_letter`) |
| Idempotency | Handler + lead creation keyed by `contactRequestId` unique index |
| Graceful shutdown | `stop()` waits for in-flight batch; api-server calls on SIGTERM |
| Metrics | `processed`, `failed`, `deadLetter`, `retried` counters |
| Extensibility | Handler map keyed by `eventType`; new types register without redesign |

**Boot wiring:** `artifacts/api-server/src/container.ts` creates `OutboxWorker` when database + platform org configured; `index.ts` starts/stops with HTTP server.

---

## Email Infrastructure

| Component | Location |
| --- | --- |
| `EmailProvider` interface | `lib/platform/src/email/` |
| `InMemoryEmailProvider` | Local / test |
| `SmtpEmailProvider` | Production SMTP (optional auth) |
| Template registry | `lib/email-templates/src/registry.ts` |
| Branded layout | `lib/email-templates/src/layout.ts` |

### Templates (8)

| Key | Purpose |
| --- | --- |
| `public_enquiry_received` | Customer acknowledgement |
| `internal_new_enquiry` | Staff notification |
| `lead_assigned` | Assignment notice |
| `lead_status_changed` | Status transition |
| `follow_up_reminder` | Reminder due |
| `consultation_confirmed` | Consultation booking |
| `proposal_sent` | Proposal delivery |
| `proposal_accepted` | Win notification |

All templates emit HTML + plain text, use shared layout/branding, and accept localization-ready copy slots.

**Configuration:** `CRM_SUPPORT_EMAIL`, `EMAIL_FROM`, `SMTP_*` env vars (see `.env.example`).

---

## CRM Domain

**Location:** `lib/domain/src/crm/`

| Entity / concept | Notes |
| --- | --- |
| `Lead` | Core aggregate; links `contactRequestId` |
| `LeadStatus` | new → acknowledged → qualified → proposal_sent → negotiation → won/lost/archived |
| `LeadWorkflow` | Transition matrix enforced in domain + service |
| `LeadActivity` | Timeline events (email, status, assignment, note, etc.) |
| `LeadNote` | Internal notes, version-ready |
| `LeadAssignment` | Ownership history |
| `LeadReminder` | Follow-ups with recurrence fields |
| `LeadTag` | Tenant-scoped labels |

Pure domain logic — no HTTP, no Drizzle.

---

## Database Additions

**Migration:** `lib/db/migrations/0001_crm.sql`  
**Schema:** `lib/db/src/schema/crm.ts`

| Table | Purpose |
| --- | --- |
| `leads` | Core lead records |
| `lead_activities` | Timeline |
| `lead_notes` | Internal notes |
| `lead_assignments` | Assignment history |
| `lead_reminders` | Follow-up reminders |
| `lead_tags` | Tag definitions |
| `lead_tag_links` | Lead ↔ tag M:N |
| `lead_scores` | Scoring (foundation) |
| `lead_sources` | Source catalogue |
| `lead_status_history` | Status audit trail |

**Outbox extension:** `next_attempt_at` column + `dead_letter` status on `outbox_events`.

Indexes, foreign keys, `organization_id`, soft delete (`deleted_at`), and audit columns on all tenant tables.

---

## Repository Inventory

| Repository | Key methods |
| --- | --- |
| `LeadRepository` | `search`, `findByIdOrFail`, `createFromContactSystem`, `transitionStatus`, `assign` |
| `LeadActivityRepository` | `listByLeadId`, `insert`, `insertForOrganization` |
| `LeadNoteRepository` | `create`, `listByLeadId` |
| `LeadAssignmentRepository` | `assign`, `listByLeadId` |
| `LeadReminderRepository` | `create`, `listForLead`, `complete` |
| `LeadTagRepository` | `list`, `create`, `listForLead` |
| `LeadStatusHistoryRepository` | `record`, `recordForOrganization`, `listByLeadId` |

Search filters applied **before** query execution (keyword, status, priority, assignee, date, service, tags).

---

## Service Inventory

| Service | Responsibility |
| --- | --- |
| `LeadService` | Search, CRUD, workflow transitions, assignment, `handleContactRequestCreated` |
| `TimelineService` | Aggregated timeline + note creation with activity |
| `DashboardService` | Pipeline metrics (new, qualified, won, lost, open, avg response) |
| `ReminderService` | Create, list, complete reminders |
| `CrmEmailService` | Template rendering + send orchestration (via `LeadService`) |

---

## API Inventory (v1)

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/v1/auth/session` | — | Dev session (headers) / 401 prod |
| GET | `/v1/leads` | `LEAD_READ` | Search + paginate |
| GET | `/v1/leads/:id` | `LEAD_READ` | Lead detail |
| PATCH | `/v1/leads/:id/status` | `LEAD_MANAGE` | Workflow transition |
| POST | `/v1/leads/:id/assign` | `LEAD_MANAGE` | Assign staff |
| GET | `/v1/leads/:id/timeline` | `LEAD_READ` | Activities + notes + status |
| POST | `/v1/leads/:id/notes` | `LEAD_MANAGE` | Add note |
| GET | `/v1/dashboard` | `LEAD_READ` | CRM metrics |
| GET | `/v1/reminders?leadId=` | `LEAD_READ` | List reminders |
| POST | `/v1/reminders` | `LEAD_MANAGE` | Create reminder |
| POST | `/v1/reminders/:id/complete` | `LEAD_MANAGE` | Complete reminder |
| GET | `/v1/tags` | `LEAD_READ` | List tags |
| POST | `/v1/tags` | `LEAD_MANAGE` | Create tag |

Activities are exposed via timeline (dedicated `/v1/activities` route deferred — same data model, single read path).

OpenAPI: `lib/api-spec/openapi.yaml` — codegen via `pnpm --filter @workspace/api-spec run codegen`.

---

## Staff Portal

**Artifact:** `artifacts/staff-portal`  
**Dev URL:** `http://localhost:5182/staff/` (proxies `/api` → api-server)

| Route | Features |
| --- | --- |
| `/staff/` | Dashboard metric cards |
| `/staff/leads` | Lead inbox — search, status/priority filters, pagination, badges |
| `/staff/leads/:id` | Contact info, message, timeline, notes, reminders, status control |

- Loads real data via `@workspace/api-client-react` generated hooks
- Dev identity via `setDevAuthHeaders` (`x-dev-user-id`, `x-dev-organization-id`)
- Responsive layout; table structure virtual-scroll ready
- No fake/mock data

---

## Lead Workflow

```
new → acknowledged → qualified → proposal_sent → negotiation → won
                                                          ↘ lost
any open state → archived (terminal)
```

Transitions validated by `lib/domain/src/crm/lead-workflow.ts`. Invalid transitions return `422 Unprocessable Entity`.

---

## Auth Integration (M2.2 scope)

| Layer | Behaviour |
| --- | --- |
| `devAuth` middleware | Development only; trusted headers impersonate consultant |
| Permissions | `LEAD_READ`, `LEAD_MANAGE` seeded for consultant + operations_manager |
| Production | No login UI; session endpoint returns 401 until M2.3 |
| Authorization never bypassed | All CRM routes call `requirePermission` |

Default dev IDs match seed data (`00000000-0000-4000-8000-000000000010` user, `…0001` org).

---

## Audit

All CRM mutations flow through repositories with audit hooks:

- Lead creation from outbox (system context)
- Status transitions → `lead_status_history` + activity
- Assignments → `lead_assignments` + activity
- Notes → `lead_notes` + activity
- Email sends → activity records

Audit events include `requestId`, actor, organization, entity, action.

---

## Testing

| Area | Package | Tests |
| --- | --- | --- |
| Domain workflow | `lib/domain` | 7 |
| Email templates | `lib/email-templates` | 8 |
| Platform (incl. SMTP) | `lib/platform` | 155 |
| Data / lead repo | `lib/data` | 24 |
| Services | `lib/services` | 3 |
| Outbox worker | `lib/workers` | 5 |
| API server | `artifacts/api-server` | 42 |
| Content / SEO | `lib/content`, `lib/seo` | 71 |
| **Total** | | **315** |

Run: `pnpm run verify` (format, lint, typecheck, test).

---

## Performance

| Concern | Mitigation |
| --- | --- |
| Lead inbox queries | Indexed columns: status, priority, assignee, created_at, organization_id |
| Dashboard aggregation | In-memory over bounded search page (10k cap); chart-optimized queries deferred |
| Outbox polling | Batch size 25, backoff prevents hot-loop on failures |
| Staff list pagination | Offset/limit with `hasMore` flag |

---

## Security

| Control | Status |
| --- | --- |
| Tenant isolation | Enforced at repository layer |
| Permission gates | All CRM endpoints |
| Dev auth | Disabled in production (`NODE_ENV !== development`) |
| Email validation | `assertValidEmailMessage` before SMTP send |
| Error envelope | No internal details leaked |
| Rate limiting | Inherited from M2.1 api-server |

---

## Known Limitations

1. **No production login** — M2.3 delivers session authentication and RBAC UI.
2. **Dashboard charts** — Metric cards only; visualization layer prepared for later.
3. **Lead scoring service** — Schema + repository foundation; automation rules deferred.
4. **Attachments / email history UI** — Activity types defined; file storage from M2.1 placeholder not wired to CRM UI.
5. **Workload balancing** — Assignment interfaces ready; automation deferred.
6. **Drizzle Kit on Windows** — Manual SQL migrations continue (0001_crm.sql).
7. **Orval + Zod v3** — Integer OpenAPI types use `number` to avoid `zod.int()` (v4 syntax).
8. **Dedicated `/v1/activities` route** — Timeline endpoint covers read use cases.

---

## Verification Checklist

| Criterion | Status |
| --- | --- |
| Transactional outbox worker | ✅ |
| Email infrastructure + templates | ✅ |
| CRM domain | ✅ |
| CRM repositories | ✅ |
| CRM services | ✅ |
| Lead workflow | ✅ |
| Staff Lead Inbox | ✅ |
| Lead Details | ✅ |
| Dashboard | ✅ |
| Timeline / Notes / Assignment | ✅ |
| Search / Reminders / Tags | ✅ |
| OpenAPI updated | ✅ |
| Generated client updated | ✅ |
| Documentation | ✅ |
| M1 website regression | ✅ |
| M2.1 foundation regression | ✅ |
| All tests pass | ✅ (315) |

---

## Readiness for M2.3 — Identity, Authentication & Role-Based Access Control

**Recommendation: Proceed to M2.3.**

M2.2 establishes the patterns M2.3 will replace incrementally:

1. **Replace dev headers** with `SessionProvider` implementing `lib/auth` interfaces — staff portal already uses same-origin API client with credentials support.
2. **Wire `/v1/auth/session`** to real session store — response shape (`AuthSessionResponse`) is contract-ready.
3. **Enforce RBAC from database** — permission catalogue and seed data include CRM permissions; M2.3 adds role management UI and session-scoped permission resolution.
4. **Protect staff portal routes** — add auth gate component calling `useAuthSession`; redirect unauthenticated users to login page.
5. **Production email** — configure SMTP + support address; in-memory provider sufficient for dev.

No CRM redesign required for M2.3. The bounded context, repositories, and services are authentication-agnostic by design.

---

## Quick Start (Development)

```bash
# Terminal 1 — API (requires DATABASE_URL + PLATFORM_ORGANIZATION_ID)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Staff portal
pnpm --filter @workspace/staff-portal run dev

# Terminal 3 — Public website (optional)
pnpm --filter @workspace/ckbhse-website run dev
```

Apply migrations: run `0000_foundation.sql` then `0001_crm.sql` against PostgreSQL.

Submit a contact form → outbox worker creates lead → refresh `/staff/leads`.

---

*End of Milestone 2.2 Implementation Report*
