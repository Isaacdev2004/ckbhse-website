# Phase 03 — Milestone 2.4 (M2.4) Implementation Report

## Client Portal & Organization Workspace

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 06 — Milestone 2.4 (Client Portal & Organization Workspace)  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone **2.4** delivers the first authenticated **customer-facing portal** for the CKBHSE platform: a multi-tenant organization workspace at `/portal` where client organizations securely manage compliance, projects, documents, training records, support, and communications.

Built directly on M2.1–M2.3 without architectural redesign:

- **`lib/db/migrations/0003_portal.sql`** — 18 portal table groups + demo client org seed
- **`lib/db/src/schema/portal.ts`** — Drizzle schema for workspace entities
- **`lib/domain/src/portal`** — domain types for projects, documents, incidents, audits, etc.
- **`lib/data`** — `DrizzlePortalStore`, `PortalRepository` with RBAC + tenant isolation
- **`lib/services/portal`** — `PortalService` aggregating dashboard and workspace modules
- **`artifacts/api-server`** — `/api/v1/portal/*` REST endpoints
- **`artifacts/client-portal`** — full SPA with 16 protected routes + login
- **OpenAPI + Orval** — portal contract endpoints; React Query hooks regenerated
- **RBAC expansion** — 7 client roles with inheritance from `client_user`

**Verification:** `pnpm run typecheck` green, **354 tests** passing (24 net new since M2.3), client-portal production build succeeds, no regression to M1 website or M2.1–M2.3.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  artifacts/client-portal @ /portal                                   │
│  Session auth (M2.3) → portalFetch / generated hooks → API           │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ GET/POST /api/v1/portal/*
┌───────────────────────────────▼──────────────────────────────────────┐
│  artifacts/api-server/routes/v1/portal.ts                            │
│  → container.services.portal (PortalService)                         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  lib/services/portal — PortalService                                   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  lib/data — PortalRepository → DrizzlePortalStore                      │
│  requirePermission + organizationId scoping on every operation         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│  PostgreSQL — organization_profiles, projects, documents, tickets, …   │
│  migration 0003_portal.sql                                               │
└────────────────────────────────────────────────────────────────────────┘
```

### Layering (unchanged)

| Rule | M2.4 enforcement |
| --- | --- |
| No Drizzle in routes | Portal routes call `container.services.portal` only |
| No hardcoded roles | `PortalRepository` uses `requirePermission(PERMISSIONS.*)` |
| Organization isolation | All queries filtered by `context.organizationId` |
| No mock APIs | Dashboard/widgets load from `PortalService.getDashboard()` |
| Storage abstraction | Documents use `storageKey`; LocalStorageProvider from M2.1 |

---

## Portal Overview

**URL:** `/portal` (Vite base path, port 5183 dev)

| Route | Module | Permission |
| --- | --- | --- |
| `/portal/dashboard` | Executive dashboard | `portal.access` |
| `/portal/profile` | Session profile | `portal.access` |
| `/portal/organisation` | Organization workspace | `portal.access` |
| `/portal/users` | Member management | `identity.user.read` |
| `/portal/projects` | Project delivery | `delivery.project.read` |
| `/portal/compliance` | Compliance workspace | `consultancy.risk-assessment.read` |
| `/portal/documents` | Document library | `delivery.document.read` |
| `/portal/training` | Training workspace | `learning.enrolment.access` |
| `/portal/certificates` | Certificate centre | `training.certificate.read` |
| `/portal/audits` | Audit schedule/history | `consultancy.audit.read` |
| `/portal/incidents` | Incident register | `consultancy.incident.read` |
| `/portal/actions` | Action register | `portal.access` |
| `/portal/messages` | Secure messaging | `portal.access` |
| `/portal/support` | Support centre | `support.ticket.manage` |
| `/portal/settings` | Org preferences | `client.user.manage` |
| `/portal/activity` | Unified timeline | `portal.access` |

Authentication uses M2.3 session cookies (`ckbhse_session`) + CSRF double-submit.

---

## Client Roles (RBAC)

Seven client portal roles added (seed in `0003_portal.sql` + `permissions-seed.ts`):

| Role key | Inherits | Purpose |
| --- | --- | --- |
| `compliance_manager` | `client_user` | Compliance oversight + manage |
| `training_manager` | `client_user` | Training + certificate management |
| `hr_manager` | `client_user` | HR records + user read |
| `viewer` | `client_user` | Read-only portal access |
| `external_contractor` | `viewer` | Limited project/document read |
| `department_manager` | `client_user` | Department-scoped access |
| `site_manager` | `client_user` | Site-scoped access |

`CLIENT_PERMISSIONS` expanded with audit, incident, risk, and learning access for full workspace visibility.

---

## Database Additions

**Migration:** `lib/db/migrations/0003_portal.sql`

| Table | Purpose |
| --- | --- |
| `organization_profiles` | Extended org metadata, scores, contacts |
| `organization_members` | User membership, department, site |
| `organization_settings` | Preferences, branding, notifications |
| `organization_projects` | Client projects |
| `project_tasks`, `project_comments` | Project delivery detail |
| `organization_documents`, `organization_document_versions` | Document management |
| `organization_certificates` | Certificate centre |
| `organization_actions` | Action register |
| `organization_incidents` | Incident register |
| `organization_audits` | Client audit view |
| `support_tickets`, `support_ticket_messages` | Support centre |
| `organization_message_threads`, `organization_messages` | Messaging |
| `organization_activities` | Unified activity feed |
| `compliance_tasks` | Compliance workspace tasks |

**Demo seed:** Acme Manufacturing Ltd (`…0002`), user `client@acme.example.com` / `StaffDev123!`

---

## API Endpoints

Base path: `/api/v1/portal`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/dashboard` | Executive dashboard metrics |
| GET/PATCH | `/organisation` | Organization profile |
| GET | `/users` | Organization members |
| GET | `/projects`, `/projects/:id` | Projects + detail |
| GET/POST | `/documents` | Document library |
| GET | `/certificates` | Certificates |
| GET | `/compliance` | Compliance score + tasks |
| GET | `/audits` | Audits |
| GET | `/incidents` | Incidents |
| GET | `/actions` | Action register |
| GET/POST | `/support`, `/support/:id` | Support tickets |
| GET | `/messages`, `/messages/:threadId` | Messaging |
| GET | `/activity` | Activity timeline |
| GET/PATCH | `/settings` | Organization settings |
| GET | `/training` | Training workspace summary |
| GET | `/search?q=` | Global workspace search |

OpenAPI schemas: `PortalDashboardResponse`, `PortalOrganisationResponse`, etc.

---

## Services

| Service | Responsibility |
| --- | --- |
| `PortalService` | Dashboard aggregation, workspace modules, global search |

Wired in `createServices()` as `services.portal`.

---

## Testing

| Area | Tests added |
| --- | --- |
| `lib/data` | Portal repository permissions, RBAC seed, role inheritance |
| `lib/services` | Portal dashboard mapping |
| `artifacts/api-server` | 17 portal route auth/availability tests |

**Full suite:** 354 tests passing (target 350+ met).

---

## Security

- RBAC via `PortalRepository.requireOrganizationId()` + `requirePermission()`
- Organization isolation on every query (`organizationId` from session)
- Session authentication (M2.3) — no dev headers in client portal
- CSRF on mutating portal requests (client `portalFetch`)
- Rate limiting inherited from api-server global middleware
- Permission-gated routes in client portal UI (`PermissionRoute`)

---

## Accessibility

- WCAG-oriented patterns from `@workspace/ui` (focus rings, semantic headings)
- Keyboard-navigable sidebar and forms
- `aria-label` on global search
- Responsive sidebar layout (horizontal scroll mobile, vertical desktop)
- Reduced motion via Tailwind/ui defaults

---

## Verification Checklist

- [x] Multi-tenant client portal at `/portal`
- [x] All 16 workspace routes implemented
- [x] Real data from services (no mock components)
- [x] Organization isolation enforced
- [x] RBAC with 7 client roles + inheritance
- [x] Database migration `0003_portal.sql`
- [x] OpenAPI updated + Orval regenerated
- [x] 354 tests passing
- [x] Production builds pass (client-portal, api-server)
- [x] No architectural drift from M2.1–M2.3

---

## Files Created

| Path | Purpose |
| --- | --- |
| `lib/db/migrations/0003_portal.sql` | Portal schema + seed |
| `lib/db/src/schema/portal.ts` | Drizzle definitions |
| `lib/domain/src/portal/index.ts` | Domain types |
| `lib/data/src/stores/drizzle-portal.store.ts` | Portal data access |
| `lib/data/src/repositories/portal.repository.ts` | RBAC-aware repository |
| `lib/services/src/portal/portal.service.ts` | Application service |
| `artifacts/api-server/src/routes/v1/portal.ts` | HTTP routes |
| `artifacts/client-portal/**` | Client portal SPA |
| `lib/data/src/seed/portal-rbac.test.ts` | RBAC tests |
| `docs/PHASE_03_M2_4_IMPLEMENTATION_REPORT.md` | This report |

---

## Files Modified

| Path | Change |
| --- | --- |
| `lib/db/src/schema/index.ts` | Export portal schema |
| `lib/domain/src/index.ts` | Export portal domain |
| `lib/data/src/index.ts` | Wire portal store/repository |
| `lib/data/src/seed/permissions-seed.ts` | Client roles + permissions |
| `lib/data/src/seed/role-inheritance.ts` | Client role inheritance |
| `lib/services/src/index.ts` | Wire PortalService |
| `artifacts/api-server/src/routes/v1/index.ts` | Mount `/portal` |
| `lib/api-spec/openapi.yaml` | Portal endpoints + schemas |
| `lib/api-zod/src/index.ts` | Fix duplicate export after codegen |

---

## Remaining Work (Future Milestones)

1. **File upload pipeline** — wire `POST /documents` to storage provider + pre-signed URLs
2. **Member invite flow** — email invitations via outbox
3. **Password reset UI** in client portal
4. **Real-time messaging** — WebSocket/SSE layer on message threads
5. **LMS integration** — connect training workspace to enrolment services
6. **PDF export** for audit reports
7. **Notification delivery** — outbox events for expiry/due reminders
8. **Concurrent session management** UI in settings
9. **Integration tests with live DB** — full login → dashboard E2E

---

## Developer Guidance

### Local setup

1. Apply migrations through `0003_portal.sql`
2. Start api-server + client-portal (`pnpm -C artifacts/client-portal run dev`)
3. Sign in at `/portal/login`:
   - Email: `client@acme.example.com`
   - Password: `StaffDev123!`
   - Organization ID sent automatically: `00000000-0000-4000-8000-000000000002`

### Regenerate API client

```bash
pnpm -C lib/api-spec run codegen
```

Note: After codegen, ensure `lib/api-zod/src/index.ts` does not re-export `./generated/types` (duplicate export conflict).
