# Document 06 — Business Platform & Portal Architecture

**Project:** CKBHSE Enterprise Digital Platform  
**Document:** 06 — Milestone 2 Master Architecture  
**Version:** 1.0  
**Status:** Authoritative architectural blueprint for Milestone 2 and all subsequent business-platform implementation  
**Audience:** Principal Engineers, Technical Leads, Security Architects, DevOps, Product Management, AI development assistants  
**Grounded in:** Documents 01–05, Document 03.5 (Engineering Standards), Document 04 (Information Architecture), Milestone 1.5 Production Certification Report  
**Constraint:** Architecture and planning only. No production code, no schema, no routes, no APIs.

---

## Document control

| Item | Value |
| --- | --- |
| Prior milestone | Milestone 1 (P1–P8) + M1.5 — **Complete and frozen** |
| Public website | 158 routes, 157 indexable, CMS-ready content architecture |
| Current API | Hardened Express edge; health endpoints only |
| Database | Drizzle wired; schema empty |
| This document governs | All Milestone 2+ business platform, portal, and operational implementation |

**How to use this document.** Every Milestone 2 implementation task MUST reference the relevant section here before writing code. Architectural decisions in §20 are binding unless explicitly superseded by a later approved document. Where this document and Document 03.5 disagree, Document 03.5 wins on engineering conventions; this document wins on business platform scope and portal design.

---

# Section 1 — Platform Vision

## 1.1 Business platform objectives

Milestone 1 delivered a production-grade **public marketing platform** — discoverable, accessible, SEO-complete, and content-architecture ready. Milestone 2 transforms CKBHSE from that marketing surface into a **full enterprise HSE operations platform** that supports the complete commercial and delivery lifecycle:

- Capture and convert inbound interest
- Onboard and manage client organisations
- Plan, deliver, and evidence consultancy engagements
- Conduct audits, assessments, inspections, and incident management
- Deliver accredited training and issue certificates
- Maintain compliance registers and document libraries
- Report to executives, clients, and regulators
- Operate at scale as a multi-tenant SaaS-ready product

The business platform is not a collection of portals. It is a **single coherent operational system** with multiple authenticated experiences over shared domain logic, shared data, and shared compliance infrastructure.

## 1.2 Enterprise operational goals

| Goal | Architectural implication |
| --- | --- |
| **No enquiry lost** | First persistence slice; public forms write to durable storage with audit trail |
| **Single source of truth** | One API, one database, one permission model — not per-portal silos |
| **Evidence-grade records** | Immutable issued artifacts; append-only audit; versioned assessments |
| **Regulatory defensibility** | Tenant isolation, access logging, retention policies, export capability |
| **Operational efficiency** | Consultants capture once; clients self-serve; staff avoid duplicate entry |
| **Revenue expansion** | Training commerce, retainers, billing readiness without re-architecture |
| **Content autonomy** | CMS migration path from file-based content (M1) to governed database content |

## 1.3 Long-term scalability

The platform must support **thousands of organisations** and **tens of thousands of users** without architectural redesign. Scale targets (from Document 03):

| Dimension | Target | Design response |
| --- | --- | --- |
| Organisations | 10,000+ | `organization_id` as partition key on all tenant tables |
| Users | 100,000+ | Indexed identity lookups; session store in PostgreSQL initially |
| Documents | Millions of objects | Object storage (S3-compatible); metadata in PostgreSQL |
| Audit log | Highest write volume | Time-partitioned append-only table; never joined in OLTP |
| Concurrent consultants | Hundreds on site | Optimistic UI; background sync; offline-tolerant field capture (later phase) |

Row count is not the primary bottleneck. Connection pooling under autoscale, binary delivery, notification fan-out, and analytics competing with transactional load are — each has a defined mitigation in §17.

## 1.4 SaaS readiness

The platform is architected as **multi-tenant from day one**, even if CKBHSE operates as the sole tenant initially:

- Every tenant-scoped record carries an organisation partition key
- Permissions are evaluated in organisation scope
- Branding, entitlements, and feature flags are organisation-configurable
- Billing and subscription hooks are reserved at the organisation level
- A future **white-label** or **multi-region** deployment must not require schema redesign — only configuration and infrastructure

Single-tenant deployment (CKBHSE-only) is a **configuration mode**, not a different codebase.

## 1.5 Multi-tenant philosophy

**Organisation is the tenant boundary.** BRS §10 requires that every client accesses only their own data. This is a legal obligation, not a quality attribute.

Principles:

1. **Structural isolation over conventional isolation.** Tenant scoping is enforced by the repository layer (Document 03.5 §3), not by each route handler remembering a `where` clause.
2. **Organisation ≠ Client.** An organisation is an identity and data boundary; a client is a commercial relationship. They diverge for prospects, partners, and multi-entity accounts.
3. **One user, many hats.** A person may be a client contact, a student, and a staff member simultaneously — one `User` with scoped role assignments, not parallel user tables.
4. **Super-admin is rare and audited.** Platform-wide administration exists but is tightly scoped, MFA-enforced, and fully logged.
5. **No cross-tenant queries except platform admin.** Even analytics aggregates must respect tenant boundaries unless explicitly platform-scoped.

## 1.6 Security-first approach

Security is a **design property**, not a review stage (Document 03.5 §2.7). Milestone 2 establishes:

- Authentication before any tenant-scoped data access
- Authorisation evaluated on every mutating operation
- Audit logging in the same transaction as sensitive writes
- Rate limiting on all public and credential endpoints (already present on API edge)
- Encryption in transit (TLS) and at rest (database + object storage)
- GDPR-aware data lifecycle (retention, erasure, export)
- Zero-trust between services: every request carries provable identity context

The correct design question is never *"where do we check permissions?"* but *"how do we make an unchecked path impossible to write?"*

---

# Section 2 — High-Level Architecture

## 2.1 Layered topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                                    │
│  artifacts/ckbhse-website  (FROZEN — public marketing)                      │
│  artifacts/client-portal   artifacts/staff-portal   artifacts/lms           │
│  artifacts/admin-portal    (+ executive/consultant role-scoped experiences) │
│  React 19 · Vite 7 · wouter · TanStack Query · lib/ui                       │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTPS · cookies · generated API client
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRANSPORT LAYER                                       │
│  artifacts/api-server — Express 5 · /api/v1/*                               │
│  Routers · controllers · request validation · response mapping · rate limit │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS SERVICES LAYER                               │
│  lib/services — use cases · orchestration · transactions · domain events      │
│  One module per bounded context (Client Mgmt, Consultancy, Learning, …)     │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────┐ ┌─────────────────┐ ┌──────────────────────────────┐
│  lib/domain          │ │  lib/auth       │ │  lib/platform (existing)     │
│  Pure business rules │ │  Permissions    │ │  Logging · errors · config   │
│  Entities · policies │ │  Session contract│ │  Cross-cutting utilities    │
│  State machines      │ │  Auth guards    │ │                              │
└──────────────────────┘ └─────────────────┘ └──────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REPOSITORY LAYER                                      │
│  lib/data — ONLY layer that may touch Drizzle / SQL                         │
│  AuthContext-scoped repositories · tenant predicates · audit on write       │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE                                              │
│  PostgreSQL · lib/db (connection + migrations only)                         │
│  Row-level tenant scoping · soft deletes · optimistic concurrency           │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐    ┌───────────────────────┐
│  OBJECT STORAGE  │    │  EXTERNAL SERVICES   │    │  NOTIFICATION SERVICES │
│  S3-compatible   │    │  Email · SMS · SSO   │    │  lib/notifications     │
│  Pre-signed URLs │    │  Payments · Signatures│   │  Email · in-app · push  │
└──────────────────┘    └──────────────────────┘    └───────────────────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  REPORTING · ANALYTICS · AUDIT (read-mostly / append-only downstream)       │
│  Materialised views · scheduled jobs · export pipelines · immutable audit log│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  INTEGRATIONS ADAPTER LAYER (future)                                         │
│  M365 · Google · Stripe · Xero · DocuSign · Entra ID · gov APIs              │
│  Isolated adapters — no vendor SDKs in domain or services                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Layer responsibilities

| Layer | Owns | Must NOT own |
| --- | --- | --- |
| **Presentation** | UI, routing, forms, client-side validation, optimistic UX | Business rules, direct DB access, permission decisions |
| **Transport** | HTTP mapping, auth middleware attachment, input/output DTOs | Business logic, SQL, cross-aggregate orchestration |
| **Business Services** | Use cases, transaction boundaries, event emission, permission checks | HTTP concerns, Drizzle queries |
| **Domain** | Invariants, state machines, calculations, domain events (types) | I/O, framework imports, database |
| **Repositories** | Persistence, tenant scoping, audit writes, row↔domain mapping | Business rule decisions, HTTP |
| **Database** | Durability, constraints, indexes | Application logic |
| **Storage** | Binary content, CDN delivery | Access control decisions (entitlement stays in services) |
| **Notifications** | Channel delivery, templates, retry | Business workflow state |
| **Reporting** | Aggregation, export formatting | Mutating transactional data |
| **Audit** | Append-only activity record | Updates or deletes to audit entries |
| **Integrations** | External API translation | Core domain logic |

## 2.3 Dependency rules (compiler-enforced)

Per Document 03.5 and Document 03:

```
domain        → (nothing)
data          → domain
auth          → domain
services      → domain, data, auth
api-server    → services, auth, platform   (NEVER data, NEVER db directly)
artifacts/*   → api-client-react, ui, content (public site only), seo
```

Violation of these edges is a **build failure**, not a code review comment.

## 2.4 Deployment topology

Single origin, path prefixes (Document 04 §2.4):

| Path | Application |
| --- | --- |
| `/` | Public website (frozen) |
| `/portal` | Client Portal |
| `/learn` | Training / LMS |
| `/staff` | Staff Portal (includes Consultant experience) |
| `/admin` | Administration Portal |
| `/api/v1` | Express API |

This preserves first-party cookies for session auth, simplifies CORS, and allows one TLS certificate and one CDN configuration.

---

# Section 3 — Multi-Tenant Architecture

## 3.1 Tenant hierarchy

```
Platform (CKBHSE operator)
└── Organization (tenant boundary — partition key)
    ├── Branches / Sites (physical locations)
    ├── Departments (internal structure)
    ├── Teams (working groups)
    └── Users (people — may span orgs via separate memberships)
        └── Role Assignments (scoped permissions)
            └── Projects (engagements)
                ├── Assets / Equipment
                ├── Documents
                ├── Audits / Inspections
                ├── Risk Registers
                ├── Incidents
                ├── Training records
                └── Tasks / Calendar events
```

## 3.2 Isolation boundaries

| Entity | Scope | Isolation mechanism |
| --- | --- | --- |
| **Organization** | Platform | Unique ID; root of tenant partition |
| **Branch / Site** | Organization | FK to organization; repository inherits org scope |
| **Department / Team** | Organization | FK; used for internal RBAC scoping |
| **User** | Global identity | Profile global; **membership** is org-scoped |
| **Project** | Organization (+ client link) | All delivery artifacts hang from project |
| **Document** | Organization | Metadata in DB; binary in object storage with org prefix |
| **Audit / Incident / Risk** | Organization | Never cross org boundary |
| **Training enrollment** | Organization or individual | Org-scoped for corporate training; user-scoped for public LMS |
| **Permissions** | Role × Scope | Evaluated within organization context |
| **Audit log** | Platform | Records org ID; append-only; platform admin can query cross-org |

## 3.3 Partition key strategy

Every tenant-scoped table includes `organization_id` (UUID, NOT NULL, indexed). Composite indexes **lead with** `organization_id`:

```
(organization_id, status, updated_at)
(organization_id, project_id, created_at)
```

Cross-tenant access is **structurally impossible** from application code because:

1. Repositories are constructed with an `AuthContext` containing the acting organisation
2. The tenant predicate is injected into every query automatically
3. Callers cannot supply `organization_id` as an override argument

## 3.4 CKBHSE operator vs client organisations

Two organisation **types** (conceptual, not separate databases):

| Type | Purpose |
| --- | --- |
| **Platform operator org** | CKBHSE staff, consultants, trainers — internal operations |
| **Client org** | Customer tenant — sees only their data in Client Portal |

A consultant's `AuthContext` may span multiple client projects via **assignments**, but never sees unassigned client data. Client users see only their organisation's partition.

## 3.5 Data residency and future multi-region

Phase 1: single PostgreSQL region (UK). Architecture reserves:

- `organization.region` for future pinning
- Object storage prefix per region
- Read replicas per region (future)

No implementation in Milestone 2 Phase 1 — design-only hooks.

---

# Section 4 — User Types

Eleven BRS roles map to **user types** with distinct portal experiences and permission bundles.

| User type | Primary portal | Core responsibilities |
| --- | --- | --- |
| **System Administrator** | Admin | Platform config, integrations, system health, tenant provisioning, global audit |
| **Organization Administrator** | Admin / Staff | Org settings, user invites, role assignment, branch structure |
| **HSE Manager** | Client / Staff | Compliance oversight, incident review, risk register, reporting |
| **Consultant** | Staff (consultant experience) | Audits, inspections, findings, field capture, report issuance |
| **Auditor** | Staff | Independent audit execution, evidence review, sign-off |
| **Trainer** | LMS | Course delivery, marking, attendance, certificate triggers |
| **Client User** | Client Portal | View projects, documents, reports, invoices, book services |
| **Employee** | Client Portal (limited) | Training assignments, policy acknowledgement, incident reporting |
| **External Contractor** | Client Portal (restricted) | Site induction, permit visibility, assigned tasks only |
| **Read-only User** | Any (scoped) | View permitted records; no mutations |
| **Guest** | Public website | Browse, enquire, book (unauthenticated) |

## 4.1 User type notes

**One person, multiple types.** A user may hold `Trainer` in the LMS and `Consultant` in Staff Portal simultaneously — resolved via scoped role assignments, not duplicate accounts.

**Guest is not a User row.** Public form submissions create `ContactRequest` records without requiring identity.

**Contractor is time-boxed.** External contractors receive restricted, expiring access scoped to a project or site.

**Super Admin approval.** BRS §10 requires approval before a user holds multiple privileged roles — enforced in the role assignment workflow.

**Executive experience.** Directors and executives use Staff Portal with an **Executive dashboard** landing — not a separate deployed application (same reasoning as Consultant within Staff).

---

# Section 5 — Authentication Architecture

> **Design only.** No implementation in this document.

## 5.1 Strategy summary

| Decision | Choice | Rationale |
| --- | --- | --- |
| Primary mechanism | **Server-side sessions** in PostgreSQL | Instant revocation; shared across autoscale instances |
| Token transport | **HttpOnly Secure SameSite cookies** | XSS-resistant; first-party on single origin |
| API auth | Session cookie (not Bearer JWT for web) | Document 03; avoids token leakage in browser |
| Password storage | Argon2id (or bcrypt with strong cost) | Industry standard; rate-limited endpoints |
| MFA | TOTP + recovery codes; WebAuthn later | BRS compliance; phased |
| SSO | OIDC/SAML adapter interface | Microsoft Entra ID first candidate |

## 5.2 Login flow (conceptual)

```
Client → POST /api/v1/auth/login { email, password }
       → Rate limit (authRateLimiter — already exists)
       → Verify credentials
       → [If MFA enrolled] → MFA challenge step
       → Create Session row (user_id, org context, device fingerprint, IP, expiry)
       → Set session cookie
       → Return user profile + permissions summary (not raw permission list for large sets)
```

## 5.3 Session lifecycle

| Property | Policy |
| --- | --- |
| Absolute expiry | 24 hours (configurable per org) |
| Idle expiry | 8 hours of inactivity |
| Renewal | Sliding window on authenticated requests |
| Revocation | Immediate on password change, role revocation, admin suspend, "sign out everywhere" |
| Storage | PostgreSQL `sessions` table; optional Redis cache layer later for read hot path |
| Device binding | Record user agent + device ID; surface in account security UI |

## 5.4 Refresh tokens

**Not used for browser sessions.** Server-side sessions with cookie renewal are sufficient at this scale. Refresh tokens are reserved for **future mobile app** and **public API** clients where cookie sessions are inappropriate.

## 5.5 Password reset

```
Request → POST /api/v1/auth/password-reset/request { email }
        → Always 200 (no email enumeration)
        → Single-use token, 1-hour expiry, hashed storage
        → Email via notification service
Confirm → POST /api/v1/auth/password-reset/confirm { token, newPassword }
        → Validate token, update credential, revoke all sessions
```

## 5.6 Invitation flow

```
Admin → POST /api/v1/users/invite { email, role, scope }
      → Create User (invited state) + Invitation token
      → Email with secure link
Invitee → GET /portal/accept-invite?token=…
        → Set password (+ MFA enrol if required)
        → Activate user, create session
```

## 5.7 Email verification

Required before first login for self-registrants (future public LMS signup). Invited users verify implicitly via invitation token.

## 5.8 Remember me

Extends idle expiry (e.g. 30 days) with a separate persistent cookie flag — **not** indefinite sessions. Requires re-authentication for sensitive actions (password change, MFA settings, payment).

## 5.9 MFA

| Phase | Capability |
| --- | --- |
| M2 Phase 2 | TOTP enrolment, verification at login, recovery codes |
| Future | WebAuthn/FIDO2, SMS fallback (optional, org-configurable) |
| Enforced for | System Admin, Org Admin, all staff roles (configurable policy) |

## 5.10 SSO readiness

```
lib/auth/providers/
  oidc-provider.interface.ts
  entra-id.adapter.ts      (future)
  saml-provider.interface.ts (future)
```

SSO links external identity to existing `User` row. Provisioning modes: JIT (just-in-time) and SCIM (future).

## 5.11 Account lockout

After **5 failed attempts** in 15 minutes: account locked for 30 minutes. Credential endpoints use existing `authRateLimiter` (skip successful requests). Security events logged to audit.

## 5.12 Device management

Users view active sessions (device, location, last active). Can revoke individual sessions. Admin can force-revoke all sessions for a user.

## 5.13 Trusted devices

Optional "trust this device for 30 days" skips MFA on subsequent logins from same device fingerprint — org policy gated.

---

# Section 6 — Authorization

## 6.1 RBAC model

```
Permission (fine-grained capability, e.g. audit:findings:write)
    ↑ bundled into
Role (named set, e.g. Consultant)
    ↑ assigned via
RoleAssignment (User × Role × Scope)
    ↑ evaluated against
AuthContext (acting user, org, resolved permissions, requestId)
```

## 6.2 Permission catalogue

- Permissions are **seeded via migrations** — versioned and reviewable
- Naming convention: `{domain}:{resource}:{action}` (e.g. `project:document:download`)
- Application code **never branches on role names** — only on permissions
- New permissions are additive; removal requires migration and deprecation period

## 6.3 Permission groups

Related permissions grouped for UI and assignment convenience:

| Group | Example permissions |
| --- | --- |
| Project read | `project:view`, `project:timeline:view` |
| Audit conduct | `audit:create`, `audit:findings:write`, `audit:report:issue` |
| Client admin | `org:users:invite`, `org:roles:assign` |

Groups are not evaluated at runtime — flat permission set is resolved at session creation and cached.

## 6.4 Inheritance and overrides

| Mechanism | Use |
| --- | --- |
| **Role hierarchy** | Org Admin inherits User Manager permissions |
| **Scope inheritance** | Project assignment grants project-scoped permissions |
| **Deny overrides** | Explicit deny beats allow (for contractor restrictions) |
| **Temporary elevation** | Time-boxed permission grant with audit (break-glass) |

## 6.5 Feature flags

Organisation-level entitlements control module visibility:

```
features.audits.enabled
features.lms.enabled
features.incidents.enabled
```

Feature flags gate **UI and API routes** — not security. Disabled feature returns 404, not 403, to avoid information leakage.

## 6.6 Tenant isolation in authorization

Permission evaluation always includes:

1. Does the user have the permission?
2. Is the permission valid in this organisation scope?
3. Does the target resource belong to this organisation?
4. For cross-project staff: is the user assigned to this project?

## 6.7 ABAC readiness (future)

Attributes reserved for future policy engine:

- Resource classification (confidential, public)
- Site location
- Time of access
- Device trust level

RBAC covers Milestone 2. ABAC adapter interface documented but not implemented.

---

# Section 7 — Portal Architecture

## 7.1 Portal map

| Portal | Package | Path | Audience |
| --- | --- | --- | --- |
| **Public Website** | `artifacts/ckbhse-website` | `/` | Guest — **FROZEN** |
| **Client Portal** | `artifacts/client-portal` | `/portal` | Client users, employees, contractors |
| **Staff Portal** | `artifacts/staff-portal` | `/staff` | Consultants, operations, HSE managers, executives |
| **Training Portal (LMS)** | `artifacts/lms` | `/learn` | Students, trainers |
| **Admin Portal** | `artifacts/admin-portal` | `/admin` | System and org administrators |

## 7.2 Shared infrastructure

All portals share:

| Shared asset | Package |
| --- | --- |
| Design system | `lib/ui` |
| API client + validators | `lib/api-client-react`, `lib/api-zod` |
| Auth session handling | `lib/auth` (client helpers) |
| Error envelope handling | `@workspace/platform/errors` |
| Logging conventions | `@workspace/platform/logging` |
| Content (public only) | `lib/content` — **not shared with authenticated portals** |

## 7.3 Isolated functionality

Each portal owns:

- Route tree and lazy-loaded feature modules
- Portal-specific navigation (composed from permissions)
- Default landing route per primary role
- Portal-specific dashboard widgets
- Colour theme (lib/ui structure shared; palette per app)

## 7.4 Experience separation within Staff Portal

| Experience | Landing | Navigation emphasis |
| --- | --- | --- |
| **Consultant** | Today's assignments, quick capture | Audits, inspections, findings, calendar |
| **Operations** | Pipeline, scheduling, resource utilisation | CRM, projects, bookings, tasks |
| **Executive** | KPI dashboard, risk summary | Reporting, compliance status, trends |
| **HSE Manager** | Open incidents, overdue actions | Risk register, CAPA, compliance |

One application; navigation graph filtered by `AuthContext.permissions`.

## 7.5 Training Portal dual experience

| Experience | Landing |
| --- | --- |
| **Student** | My courses, progress, certificates |
| **Trainer** | Cohorts, marking queue, attendance |

## 7.6 Admin Portal scope

Platform governance only — not day-to-day delivery:

- User and role management
- Organisation provisioning
- Integration credentials
- Feature entitlements
- Global audit log viewer
- System health dashboard
- CMS administration (M2 later phase)

## 7.7 Portal shell pattern

Every new portal implements:

```
app/           → providers, router, auth gate, error boundary
features/      → domain feature modules (lazy routes)
shared/        → portal-local shared components
lib/           → portal config, auth helpers
```

Auth gate redirects unauthenticated users to `/portal/login` (or equivalent). Session check via `GET /api/v1/auth/session`.

---

# Section 8 — Core Business Modules

Module boundaries follow Document 03 bounded contexts. Each module owns its aggregate roots, services, repositories, and API surface.

## 8.1 Module catalogue

| Module | Bounded context | Aggregate roots | Primary portals |
| --- | --- | --- | --- |
| **CRM & Leads** | Client Management | ContactRequest, Lead, Client, Contact | Staff, Admin |
| **Consultations & Bookings** | Client Management | Booking, Consultation | Public, Client, Staff |
| **Projects** | Consultancy Delivery | Project, Assignment | Staff, Client |
| **Audits & Inspections** | Consultancy Delivery | Audit, Finding, Inspection | Staff, Client |
| **Risk Assessments** | Consultancy Delivery | RiskAssessment (versioned) | Staff, Client |
| **RAMS & Method Statements** | Consultancy Delivery | RamsDocument, MethodStatement | Staff, Client |
| **Incidents** | Consultancy Delivery | Incident | Staff, Client |
| **CAPA** | Consultancy Delivery | CorrectiveAction | Staff, Client |
| **Training & LMS** | Learning | Course, CourseVersion, Enrollment | LMS, Client |
| **Certificates** | Learning | Certificate (immutable once issued) | LMS, Client |
| **Compliance Register** | Consultancy Delivery | ComplianceItem, Obligation | Staff, Client |
| **Document Library** | Documents & Knowledge | Document, DocumentVersion | All portals |
| **Asset & Equipment** | Consultancy Delivery | Asset, Equipment, MaintenanceRecord | Staff, Client |
| **Calendar & Tasks** | Platform | Task, CalendarEvent | Staff, Client |
| **Notifications** | Platform | Notification, NotificationPreference | All |
| **Messaging** | Platform | Thread, Message | Staff, Client |
| **Knowledge Base** | Documents & Knowledge | InternalArticle (distinct from public resources) | Staff, Client |
| **Reporting & Analytics** | Analytics | ReportDefinition, Dashboard (read-only) | Staff, Admin, Executive |
| **Billing** | Finance | Invoice, Payment (readiness only in early phases) | Staff, Client, Admin |

## 8.2 Module boundary rules

1. **No cross-module table access.** Module A references Module B by ID through service interfaces.
2. **Issued artifacts are immutable.** Audit reports, certificates, issued assessments — corrections create new versions.
3. **Finance is downstream.** Receives billable events; never reaches into audit findings or lesson content.
4. **Documents are shared infrastructure.** Storage mechanics unified; entitlements per module.
5. **Public content stays frozen in `lib/content`.** CMS-backed content (M2 later phase) is a separate pipeline from operational documents.

## 8.3 Module interaction example

```
ContactRequest (CRM) → converted → Client + Booking
Booking → confirmed → Project
Project → Audit scheduled → Findings → CorrectiveActions
Audit report issued → Document (PDF in object storage) → Client Portal read
Project milestones → Invoice (Finance, later phase)
```

---

# Section 9 — Business Workflow Architecture

## 9.1 Primary commercial workflow

```
Lead (website enquiry)
    ↓
Triage (staff assigns, scores)
    ↓
Consultation (booking, discovery call)
    ↓
Proposal (scope, pricing — document)
    ↓
Acceptance (client sign-off)
    ↓
Project (engagement opened, team assigned)
    ↓
Delivery (audits, training, assessments)
    ↓
Compliance (ongoing monitoring, register updates)
    ↓
Reporting (client + executive dashboards)
    ↓
Renewal (retainer, re-certification, follow-on project)
```

## 9.2 Audit delivery workflow

```
Project active
    ↓
Audit scheduled (calendar, notifications)
    ↓
Field capture (findings, evidence photos → object storage)
    ↓
Draft report (consultant review)
    ↓
Internal QA (optional approval step)
    ↓
Issued to client (immutable PDF + structured data)
    ↓
Client acknowledgement
    ↓
Corrective actions (CAPA) tracked to closure
    ↓
Follow-up audit (optional, linked to predecessor)
```

## 9.3 Incident workflow

```
Incident reported (any authorised user)
    ↓
Classification + severity assignment
    ↓
Investigation (evidence, interviews, timeline)
    ↓
Root cause analysis
    ↓
Corrective / preventive actions
    ↓
Verification + closure
    ↓
Regulatory notification (if required — manual trigger + audit)
    ↓
Trend analysis (reporting downstream)
```

## 9.4 Training workflow

```
Course published (LMS admin)
    ↓
Enrolment (client bulk or individual purchase)
    ↓
Payment confirmation (Finance hook, later)
    ↓
Learning delivery (lessons, SCORM/xAPI later)
    ↓
Assessment
    ↓
Pass → Certificate issued (immutable)
    ↓
Expiry monitoring → renewal notification
```

## 9.5 Workflow engine approach

**Phase 1:** State machines in `lib/domain` — explicit transitions, guard conditions, audit on transition.

**Future:** Workflow definition tables for configurable flows (not Milestone 2 Phase 1).

Domain events recorded in **outbox table** for async side effects (notifications, reporting refresh):

```
Service completes transaction
    → Write business data
    → Write outbox event(s)
    → Commit
Background worker → Process outbox → Send notifications, update search index
```

---

# Section 10 — File Storage Strategy

## 10.1 Principles

| Principle | Implementation |
| --- | --- |
| **Never on local disk in production** | Autoscale instances have ephemeral filesystem |
| **Upload bypasses API body** | Browser → pre-signed URL → object storage |
| **Metadata in PostgreSQL** | Storage key, mime, size, checksum, org, entitlements |
| **One abstraction** | `lib/storage` interface — S3-compatible backend |

## 10.2 Object categories

| Category | Examples | Retention |
| --- | --- | --- |
| **Documents** | Audit reports, policies, contracts | Legal retention policy per org |
| **Certificates** | PDF certificates | Permanent (immutable) |
| **Photos / evidence** | Inspection photos, incident evidence | Case-linked retention |
| **Videos** | LMS lesson media | Course lifecycle |
| **Reports** | Generated PDF/Excel exports | Configurable TTL for cache |
| **Downloads / templates** | Public templates (M1) → migrate to CMS | Versioned |
| **User uploads** | CVs, bulk import files | GDPR erasure capable |

## 10.3 Storage key layout

```
{bucket}/{organization_id}/{domain}/{entity_id}/{version}/{filename}
```

Example: `ckbhse-prod/a1b2c3…/audits/audit-789/v1/report.pdf`

## 10.4 Versioning

- Document metadata row per version
- Object storage keys are immutable per version
- Latest version pointer on parent entity
- Issued audit reports and certificates: **no overwrite** — new version only

## 10.5 Access control

1. Service checks permission via RBAC
2. Service requests signed download URL (short TTL, e.g. 15 minutes)
3. Client downloads directly from CDN/storage
4. Access logged to audit

## 10.6 Future cloud integration

| Provider | Interface |
| --- | --- |
| AWS S3 / compatible (MinIO, R2, B2) | Primary adapter |
| Azure Blob | Secondary adapter (future) |
| SharePoint | Integration layer for enterprise clients (future) |

Vendor SDKs live only in `lib/storage/adapters/`.

---

# Section 11 — Notification Architecture

## 11.1 Channels

| Channel | Phase | Use cases |
| --- | --- | --- |
| **Email** | M2 Phase 1 | Enquiry confirmation, password reset, invitations |
| **In-app** | M2 Phase 2 | Task assignments, report issued, action overdue |
| **SMS** | Future | Critical incident escalation, MFA fallback |
| **Push** | Future (mobile) | Field reminders, urgent alerts |
| **Digest** | M2 Phase 3 | Daily/weekly summary emails |

## 11.2 Notification service design

```
lib/notifications/
  notification.service.ts     → orchestration
  templates/                  → Handlebars or similar, versioned
  channels/
    email.channel.ts
    in-app.channel.ts
    sms.channel.ts            (future)
  preferences/                → user/org channel preferences
```

## 11.3 Trigger types

| Trigger | Example |
| --- | --- |
| **Transactional** | Password reset — cannot opt out |
| **Operational** | Audit assigned — opt-out configurable |
| **Marketing** | Newsletter — explicit consent required |
| **Escalation** | Incident severity 1 — immediate, multi-channel |

## 11.4 Reminder schedules

Background job scans for:

- Tasks due in 24h / overdue
- Audit scheduled tomorrow
- Training expiring in 30/7/1 days
- Certificate renewal windows
- CAPA overdue

Results enqueue notification events via outbox.

## 11.5 Delivery guarantees

At-least-once delivery with idempotency keys. Failed deliveries retry with exponential backoff. Dead letter queue for manual review.

---

# Section 12 — Audit & Compliance Architecture

## 12.1 Audit log (platform)

Append-only `AuditEntry` records:

| Field | Purpose |
| --- | --- |
| `id` | UUID |
| `timestamp` | UTC, server-generated |
| `actor_user_id` | Who (nullable for system) |
| `organization_id` | Tenant scope |
| `action` | `{domain}.{verb}` e.g. `audit.report.issue` |
| `target_type` + `target_id` | What was affected |
| `before_state` / `after_state` | JSON snapshot (PII-redacted where required) |
| `request_id` | Correlation with API logs |
| `ip_address` / `user_agent` | Request metadata |

**No UPDATE or DELETE** paths in repository. Platform admin read-only query with separate permission.

## 12.2 Activity history (user-facing)

Distinct from audit log — simplified timeline on entities (project activity, document history). Derived from audit entries or domain events.

## 12.3 Immutable records

| Record | Rule |
| --- | --- |
| Issued audit report | New version for corrections; issued copy frozen |
| Certificate | Never modified after issue |
| Signed compliance acknowledgment | Timestamp + user + content hash |
| Invoice (posted) | Credit note pattern for adjustments |

## 12.4 Electronic signatures readiness

Interface reserved for DocuSign / Adobe Sign:

```
lib/integrations/signing/
  signing-provider.interface.ts
  docusign.adapter.ts (future)
```

Signature events write to audit log with provider reference.

## 12.5 Evidence chains

Incident and audit evidence link:

```
Finding → Evidence items (photos, documents) → SHA-256 checksum
         → Captured by (user, timestamp, GPS optional)
         → Chain preserved in audit log
```

---

# Section 13 — Reporting Architecture

## 13.1 Reporting tiers

| Tier | Audience | Data source |
| --- | --- | --- |
| **Operational** | Consultants, HSE managers | Live OLTP (scoped queries) |
| **Management** | Executives, client directors | Materialised views |
| **Compliance** | Auditors, regulators | Export packages, immutable snapshots |
| **Platform** | CKBHSE admin | Cross-tenant aggregates (anonymised) |

## 13.2 Report types

| Domain | Examples |
| --- | --- |
| **Executive** | Compliance scorecard, open risk summary, incident trends |
| **Client** | Project status, outstanding actions, training compliance |
| **Consultant** | Utilisation, overdue findings |
| **Training** | Completion rates, expiry forecast |
| **Audit** | Finding severity distribution, closure times |
| **Incident** | Frequency by type, MTTR |
| **Financial** | Revenue, outstanding invoices (Finance module) |

## 13.3 Dashboard architecture

- Dashboard **definitions** stored as configuration (widgets, queries, layout)
- Widget data fetched via dedicated read API endpoints
- Heavy aggregates precomputed by scheduled jobs into materialised views
- **Never** run full-table scans on transactional request path

## 13.4 Export formats

PDF (headless render), Excel (structured), CSV (raw data). Large exports are async jobs with download link notification.

## 13.5 Scheduled reports

Cron-triggered report generation → object storage → email with signed link. Subscription management in user preferences.

---

# Section 14 — Integration Strategy

## 14.1 Integration principles

1. **Adapter pattern** — vendor logic isolated in `lib/integrations/{vendor}/`
2. **No vendor SDKs in domain or services** — only in adapters
3. **Webhook ingress** — signature verification, idempotency, audit
4. **Credential storage** — encrypted at rest, org-scoped, rotatable
5. **Graceful degradation** — core platform functions without integration

## 14.2 Integration catalogue

| Integration | Purpose | Boundary |
| --- | --- | --- |
| **Microsoft 365 / Entra ID** | SSO, calendar sync | Auth provider adapter |
| **Google Workspace** | SSO, calendar | Auth provider adapter |
| **Outlook / Teams** | Notifications, meeting links | Notification + calendar adapters |
| **Zoom** | Virtual consultation links | Booking service hook |
| **SharePoint** | Enterprise document sync | Storage adapter (client opt-in) |
| **Power BI** | Executive dashboards | Reporting export API |
| **Stripe** | Payments | Finance adapter |
| **Xero / QuickBooks** | Accounting sync | Finance adapter |
| **Salesforce / HubSpot** | CRM sync (optional) | CRM adapter — CKBHSE CRM is primary |
| **OpenAI** | AI assistants (future) | AI gateway service |
| **Gov compliance APIs** | RIDDOR, HSE feeds (future) | Compliance adapter |
| **DocuSign / Adobe Sign** | E-signatures | Signing adapter |

## 14.3 Integration boundaries

```
Portal → API → Service → IntegrationAdapter → External API
                              ↓
                         Audit log (every external call)
```

External systems **never** write directly to the database. All ingress via verified webhooks or scheduled sync jobs.

---

# Section 15 — API Architecture

## 15.1 REST principles

- Resources are nouns (`/projects`, `/audits/{id}/findings`)
- HTTP verbs map to intent (GET read, POST create, PATCH partial update, DELETE soft-delete)
- Consistent error envelope (existing `@workspace/platform/errors`)
- `requestId` on every response (already implemented)

## 15.2 Versioning

```
/api/v1/…    — current
/api/v2/…    — breaking changes only
```

Additive changes (new optional fields, new endpoints) stay in v1. Breaking changes require new version with deprecation header on old.

## 15.3 OpenAPI contract-first

Per Document 03.5 §2.6:

1. Write or update `lib/api-spec/openapi.yaml` (split into domain modules as surface grows)
2. Generate `lib/api-client-react` and `lib/api-zod` via Orval
3. CI fails on drift
4. Implement server against spec

## 15.4 Pagination

Cursor-based for large lists (stable under concurrent inserts):

```
GET /api/v1/projects?cursor=…&limit=25
→ { data: [...], meta: { nextCursor, hasMore } }
```

Offset pagination permitted only for small, stable admin lists.

## 15.5 Filtering, sorting, searching

```
GET /api/v1/audits?status=in-progress&sort=-scheduled_at&project_id=…
```

Search via dedicated endpoint with permission-aware index (§17.6):

```
GET /api/v1/search?q=fire+risk&types=project,document
```

## 15.6 Bulk operations

```
POST /api/v1/enrollments/bulk { courseId, userIds[] }
```

Async job for large bulks with progress polling.

## 15.7 Rate limiting

Existing global + auth limiters extended per route class:

| Class | Limit |
| --- | --- |
| Public forms | Strict (existing auth limiter pattern) |
| Authenticated read | Generous |
| Authenticated write | Moderate |
| Export / report generation | Strict |
| Webhook ingress | Per-integration key |

## 15.8 Validation

Request body validated with generated Zod schemas from OpenAPI. Domain validation in services (business rules).

## 15.9 Idempotency

```
POST /api/v1/invoices
Idempotency-Key: {uuid}
```

Server stores key → response mapping for 24h. Required for payment and external-sync endpoints.

## 15.10 Webhooks (outbound)

Organisations subscribe to events:

```
project.created, audit.issued, incident.reported, certificate.issued
```

HMAC-signed payloads, retry with backoff, delivery log.

---

# Section 16 — Security Architecture

## 16.1 OWASP alignment

| Risk | Mitigation |
| --- | --- |
| Injection | Parameterised queries (Drizzle); input validation (Zod) |
| Broken auth | Server sessions, MFA, lockout, secure cookies |
| Sensitive data exposure | TLS, encryption at rest, PII minimisation |
| XXE | No XML parsing in Phase 1 |
| Broken access control | RBAC + repository tenant scoping |
| Security misconfiguration | Zod env validation at boot; helmet on API |
| XSS | React default escaping; CSP on all apps |
| Insecure deserialization | JSON only; schema validation |
| Known vulnerabilities | `pnpm audit` in CI |
| Insufficient logging | Structured audit + request logging |

## 16.2 CSRF

SameSite cookies + CSRF token on mutating requests from portals (double-submit cookie or synchroniser token).

## 16.3 CSP

| App | Policy |
| --- | --- |
| Public website | Strict script-src; allow fonts CDN or self-host |
| Portals | Strict script-src 'self'; frame-ancestors 'none' |
| API | Already restrictive JSON-only CSP |

## 16.4 CORS

Explicit allowlist (existing `corsPolicy`). Credentials enabled for session cookies. Portals on same origin — CORS primarily for future public API consumers.

## 16.5 Encryption

| Layer | Method |
| --- | --- |
| Transit | TLS 1.2+ everywhere |
| Database | Provider-managed encryption at rest |
| Object storage | Server-side encryption (SSE-S3) |
| Secrets | Environment variables / vault; never in repo |
| Integration credentials | Encrypted column (AES-256-GCM) with platform key |

## 16.6 PII and GDPR

- Lawful basis recorded for contact data
- Data export endpoint (user request)
- Field-level erasure for deactivated users (not row delete — audit references)
- Retention policies per data category
- Cookie consent on public site (M1.5 noted as pending)

## 16.7 Least privilege

- Minimal permission sets per role
- Service accounts for integrations (no human password)
- Database roles: application user has no DDL rights

## 16.8 Zero trust

- Every API request validates session regardless of network origin
- Internal service calls (future) carry service identity
- No "trusted internal network" bypass

## 16.9 Backups and disaster recovery

| Asset | RPO | RTO |
| --- | --- | --- |
| PostgreSQL | 1 hour | 4 hours |
| Object storage | Versioning + cross-region (future) | 4 hours |
| Audit log | Continuous | 1 hour |

Quarterly restore rehearsal (M2 later phase).

---

# Section 17 — Scalability

## 17.1 Current strategy: modular monolith

Per Document 03: a well-layered modular monolith is **faster to build, easier to reason about, and sufficient** for target scale. Microservices are deferred until measurable pain.

## 17.2 Horizontal scaling

```
Load balancer → N × api-server instances (stateless)
              → N × static portal bundles (CDN)
              → PostgreSQL (primary + read replica later)
              → Object storage (infinite horizontal)
              → Background workers (job queue consumers)
```

Session store in PostgreSQL enables stateless API instances.

## 17.3 Connection pooling

Use PgBouncer (transaction mode) or managed pooler. Size pool per instance × max instances < PostgreSQL max connections.

## 17.4 Caching

| Cache | Use |
| --- | --- |
| HTTP CDN | Static assets, public prerendered pages (frozen M1 site) |
| Application | Permission resolution (short TTL), feature flags |
| Query | Materialised views for dashboards |
| Session | Optional Redis read-through (future) |

## 17.5 Queues and background jobs

```
lib/jobs/
  outbox-processor       → domain events
  notification-sender    → email/in-app
  report-generator       → async exports
  search-indexer         → permission-aware index
  reminder-scanner       → scheduled triggers
```

Job runner: start with PostgreSQL-backed queue (advisory locks or `pg-boss`); migrate to SQS/Redis if throughput demands.

## 17.6 Search indexing

Permission-aware search is the **highest-severity search risk** (Document 04 §13.6):

- Index stores `{ entity, organization_id, allowed_roles[], allowed_users[] }`
- Query filters **inside** the index engine, not post-query
- Leaking result counts is a failure mode — pagination must respect permissions

Start with PostgreSQL full-text + permission JOIN for MVP; Elasticsearch/OpenSearch adapter interface reserved.

## 17.7 Future microservices extraction seams

If extraction becomes necessary, these are the natural boundaries:

- Notification service
- Report generation service
- Search service
- AI gateway

Extract only with operational evidence — not preemptively.

---

# Section 18 — Operational Architecture

## 18.1 Deployment

| Artifact | Deploy target |
| --- | --- |
| `artifacts/ckbhse-website/dist/public` | CDN / static host |
| `artifacts/client-portal/dist` | CDN (path `/portal`) |
| `artifacts/staff-portal/dist` | CDN (path `/staff`) |
| `artifacts/lms/dist` | CDN (path `/learn`) |
| `artifacts/admin-portal/dist` | CDN (path `/admin`) |
| `artifacts/api-server/dist` | Container / Node process |

Reverse proxy routes path prefixes to correct static bundle or API upstream.

## 18.2 Environment tiers

| Tier | Purpose |
| --- | --- |
| Development | Local, hot reload |
| Staging | Production mirror, integration testing |
| Production | Live |

Environment validated via Zod at boot (existing pattern).

## 18.3 Monitoring

| Signal | Tool class |
| --- | --- |
| Uptime | Synthetic probes on `/api/healthz` |
| Errors | Structured log aggregation (Pino → collector) |
| Performance | APM on API (response times, DB query duration) |
| Business | Custom metrics (enquiries/day, audits issued) |

## 18.4 Logging

Existing `@workspace/platform/logging` with request correlation. Structured JSON. PII redaction in log pipeline. Security events on separate channel (already `recordSecurityEvent`).

## 18.5 Tracing

OpenTelemetry hooks at API middleware (future). `requestId` provides correlation until full tracing lands.

## 18.6 Metrics

Prometheus-compatible `/api/metrics` (protected, admin only) — request rate, error rate, latency histograms, pool utilisation.

## 18.7 Health checks

| Endpoint | Purpose |
| --- | --- |
| `GET /api/healthz` | Liveness — process up |
| `GET /api/readyz` | Readiness — DB connected, migrations current |

Already implemented. Readiness must check DB once connected.

## 18.8 Feature flags

Organisation entitlements + platform kill switches. Implemented as configuration service, not environment variables.

## 18.9 Release strategy

- Trunk-based development
- Feature flags for incomplete slices
- Database migrations forward-only
- Blue-green or rolling deploy for API
- Static bundles immutable (hash in filename — Vite default)

## 18.10 Rollback

- API: deploy previous container image
- Static: CDN pointer to previous bundle version
- Database: migrations must be backward-compatible for one release; destructive migrations require two-step deploy

## 18.11 Maintenance mode

Static maintenance page at CDN edge; API returns 503 with `Retry-After` for non-health endpoints.

---

# Section 19 — Milestone 2 Roadmap

Milestone 2 is broken into **implementation phases**. Each phase delivers a vertical slice (schema → repository → service → API → UI → tests → audit). Phases align with Document 05 milestones.

## 19.1 Phase overview

| Phase | Name | Duration (est.) | Outcome |
| --- | --- | --- | --- |
| **M2.1** | Platform Foundation | 3–4 weeks | Data layer, migrations, deploy pipeline, CI gates |
| **M2.2** | Lead Capture & Production Launch | 2–3 weeks | No enquiry lost; contact form persistence; staff triage |
| **M2.3** | Identity & Access | 5–7 weeks | Auth, sessions, RBAC, audit log, repository patterns |
| **M2.4** | Client Portal Core | 8–10 weeks | Projects, documents, file storage — client read + staff write |
| **M2.5** | Consultancy Delivery | 8–10 weeks | Audits, findings, CAPA, inspections, field capture |
| **M2.6** | Training Platform | 10–12 weeks | LMS, enrolment, assessment, certificates |
| **M2.7** | Administration & CMS | 8–10 weeks | Admin portal, content migration from `lib/content` |
| **M2.8** | Staff Operations | 8–10 weeks | CRM pipeline, calendar, tasks, finance readiness |
| **M2.9** | Enterprise Hardening | 4–6 weeks | Security review, performance, DR rehearsal |
| **M2.10** | Full Platform GA | 2–3 weeks | All portals live, documentation, support processes |

**Total: approximately 48–60 weeks** with parallel workstreams (Document 05 §2.5).

## 19.2 Recommended build order

```
M2.1 Foundation
    ↓
M2.2 Lead Capture ─────────────────────────────→ PRODUCTION LAUNCH #1
    ↓
M2.3 Identity & Access (BLOCKING for all authenticated work)
    ↓
    ├── M2.4 Client Portal Core
    │       ↓
    ├── M2.5 Consultancy Delivery
    │       ↓
    ├── M2.6 Training Platform
    │       ↓
    ├── M2.7 Admin & CMS
    │       ↓
    └── M2.8 Staff Operations
            ↓
        M2.9 Hardening
            ↓
        M2.10 GA
```

## 19.3 Dependencies

| Phase | Hard dependencies |
| --- | --- |
| M2.1 | None |
| M2.2 | M2.1 (database, email) |
| M2.3 | M2.1 |
| M2.4 | M2.3 (auth, RBAC, audit, storage) |
| M2.5 | M2.4 (projects, documents) |
| M2.6 | M2.3 (auth); soft dependency on M2.4 for client-assigned training |
| M2.7 | M2.3; content model from M1 `lib/content` |
| M2.8 | M2.3; soft dependency on M2.4–M2.6 for data |
| M2.9 | All prior phases |
| M2.10 | M2.9 |

## 19.4 Parallel work opportunities

| Parallel track A | Parallel track B | From |
| --- | --- | --- |
| M2.2 Lead capture UI + email templates | M2.1 Foundation + DB | Week 1 |
| M2.4 Client portal shell + navigation | M2.5 Audit domain model + API spec | After M2.3 |
| M2.6 LMS learner experience | M2.6 LMS trainer + course admin | After M2.6 core |
| M2.7 CMS admin UI | M2.8 CRM pipeline UI | After M2.3 |
| M2.9 Performance optimisation | M2.9 Security penetration test | M2.9 |

**Constraint:** Maximum two parallel tracks touching `lib/data` repositories to avoid schema conflicts (Document 05 §2.5).

## 19.5 M2.1 Foundation deliverables (first code phase)

- `lib/domain`, `lib/data`, `lib/services`, `lib/auth` packages created
- Repository pattern with `AuthContext` and cross-tenant tests
- Lazy database accessor (no import-time throw)
- First migration (audit log + outbox + contact_requests)
- API versioned router skeleton `/api/v1`
- Split OpenAPI spec structure
- Object storage adapter interface
- Delete `mockup-sandbox`; consolidate `middleware/` directories
- CI: E2E, accessibility scan, security scan gates

## 19.6 Public website during Milestone 2

**`artifacts/ckbhse-website` is frozen.** Changes limited to:

- Contact form wiring to enquiry API (M2.2)
- Cookie consent banner
- M1.5 remediation items (contrast, viewport, bundle splitting)
- Content updates via existing `lib/content` file pipeline until CMS (M2.7)

No structural changes to PageShell, routing, SEO framework, or content loader.

---

# Section 20 — Architectural Decisions

| # | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| AD-01 | **Architecture style** | Modular monolith | Document 03; sufficient for 10k orgs; avoids distributed complexity |
| AD-02 | **Authentication** | Server-side sessions + HttpOnly cookies | Instant revocation; autoscale-safe; BRS compliance |
| AD-03 | **Authorisation** | RBAC with fine-grained permissions | BRS §6–7; seeded migrations; ABAC interface reserved |
| AD-04 | **Tenant isolation** | Repository-enforced `organization_id` scoping | Document 03.5 §3; makes unsafe queries unexpressible |
| AD-05 | **Data access** | Repository layer in `lib/data` | Only layer touching Drizzle; returns domain types |
| AD-06 | **API style** | REST + OpenAPI contract-first | Existing Orval pipeline; six front ends need shared contract |
| AD-07 | **API versioning** | URL prefix `/api/v1` | Simple, explicit, CDN-cacheable health endpoints separate |
| AD-08 | **Front-end framework** | Vite SPA for all authenticated portals | Document 04 §1.3; SEO not required; M1 prerender pipeline proven |
| AD-09 | **Public website** | Frozen M1 architecture | M1.5 certified; no redesign |
| AD-10 | **Portal deployment** | Single origin, path prefixes | Shared cookies, simpler CORS, one CDN |
| AD-11 | **Consultant portal** | Role-scoped experience in Staff Portal | Document 04 §2.3; avoids duplicate apps |
| AD-12 | **File storage** | S3-compatible object storage + pre-signed URLs | Autoscale-safe; CDN-deliverable; one abstraction |
| AD-13 | **Notifications** | Central `lib/notifications` service | Four domains must not each invent email |
| AD-14 | **Audit log** | Append-only PostgreSQL table, partitioned by time | Immutable; correlates with `requestId`; no retrofits |
| AD-15 | **Domain events** | Outbox pattern | Async work without distributed transactions |
| AD-16 | **Search** | Permission-filtered index; PG full-text MVP | Document 04 risk; upgrade path to OpenSearch |
| AD-17 | **Reporting** | Materialised views + async export jobs | Never compete with OLTP |
| AD-18 | **Database** | PostgreSQL + Drizzle ORM | Existing wiring; migration tooling proven |
| AD-19 | **Content (public)** | File-based `lib/content` until CMS (M2.7) | M1 investment preserved; CMS migration explicit |
| AD-20 | **Integration** | Adapter pattern in `lib/integrations` | Vendor isolation; testable with mocks |
| AD-21 | **Background jobs** | PostgreSQL-backed queue initially | No new infrastructure until throughput demands |
| AD-22 | **Deployment** | Static portals + containerised API | Matches existing build outputs |
| AD-23 | **Content security** | CSP at CDN/proxy for all apps | M1.5 finding; centralised policy |
| AD-24 | **Organisation ≠ Client** | Separate domain concepts | Document 03; commercial vs identity boundary |
| AD-25 | **Issued artifacts** | Immutable with version supersession | Regulatory defensibility |

---

# Section 21 — Risks

| # | Risk | Category | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R-01 | Tenant isolation breach via handler-level scoping | Security | Critical | Repository-enforced scoping (AD-04); cross-tenant tests in CI |
| R-02 | Retrofitted audit log with gaps | Compliance | High | Audit from M2.1 first migration; repository writes audit in same TX |
| R-03 | Permission-aware search leaks data | Security | Critical | Filter in index engine; security review before search launch |
| R-04 | File storage on local disk in production | Operational | High | AD-12 enforced; CI check for direct filesystem writes |
| R-05 | Connection pool exhaustion under autoscale | Scaling | High | PgBouncer; pool size × instances < max connections |
| R-06 | Analytics queries degrade OLTP | Performance | Medium | Materialised views; read replica path (AD-17) |
| R-07 | OpenAPI spec becomes unmaintainable monolith | Maintainability | Medium | Split spec by domain module at M2.1 |
| R-08 | Portal built before internal write capability | Delivery | High | Two-sided slices per Document 05 §3.3 |
| R-09 | MFA bypass via session fixation | Security | High | Rotate session ID on login; Secure HttpOnly cookies |
| R-10 | GDPR erasure vs audit immutability conflict | Compliance | Medium | Field-level erasure; never delete audit actor references |
| R-11 | Integration vendor lock-in | Technical | Medium | Adapter interfaces; no SDK in domain |
| R-12 | M1 public site regression during M2 | Delivery | Medium | M1 frozen; M2 changes behind feature flags; E2E on public routes |
| R-13 | Scope creep into M2 features during foundation | Delivery | Medium | This document as scope authority; vertical slice discipline |
| R-14 | Offline field capture complexity (M2.5) | Technical | High | Defer offline to M2.5 sub-phase; online-first MVP |
| R-15 | CMS migration breaks SEO URLs | SEO | High | URL preservation from M1 routes; redirect map; no slug changes |

---

# Section 22 — Future Expansion

Architecture reserves capability for future modules without Milestone 2 implementation.

## 22.1 AI capabilities

| Module | Function | Architecture hook |
| --- | --- | --- |
| **AI Risk Assistant** | Risk assessment drafting | `lib/ai/` gateway; prompt templates; human approval gate |
| **AI Compliance Advisor** | Regulatory Q&A | RAG over knowledge base; audit logged queries |
| **AI Document Generator** | Report/RA templates | Service hook post-data capture; editable draft |
| **AI Incident Analysis** | Pattern detection | Analytics downstream; anonymised aggregates |

AI gateway enforces: tenant scoping, PII redaction before external LLM, audit logging, rate limits, human-in-the-loop for issued artifacts.

## 22.2 Mobile and offline

| Capability | Approach |
| --- | --- |
| **Mobile app (iOS/Android)** | React Native or Capacitor wrapper over API; refresh token auth |
| **Offline inspections** | Local IndexedDB queue; sync on reconnect; conflict resolution |
| **Wearables** | IoT adapter interface; health/safety monitoring (future) |

## 22.3 Additional portals

| Portal | Path (reserved) |
| --- | --- |
| **Contractor Portal** | `/contractor` — or scoped experience in Client Portal |
| **Vendor Portal** | `/vendor` — supplier document exchange |
| **Marketplace** | `/marketplace` — third-party HSE services |

## 22.4 Platform expansion

| Capability | Notes |
| --- | --- |
| **Public API** | API keys + OAuth for third-party developers; rate-limited |
| **White-label platform** | Org-level branding, custom domains, feature entitlements |
| **Multi-region deployment** | Org pinning to region; cross-region read replicas |
| **IoT integration** | Sensor data ingestion adapter; asset monitoring |
| **Permit-to-work system** | Reserved namespace per Document 04 §19 |

## 22.5 Expansion rules

1. New modules must use existing layered architecture — no bypass paths
2. New portals consume the same API — no portal-specific business logic
3. New integrations use adapter pattern — no vendor SDK in domain
4. Public website URLs remain stable — redirects, never breaking changes
5. Every expansion updates OpenAPI spec before implementation

---

# Appendix A — Relationship to prior documents

| Document | Relationship |
| --- | --- |
| **Document 01** | Product vision — this document operationalises it |
| **Document 02 (BRS)** | Requirements source — domains, roles, NFRs |
| **Document 03** | Domain model, bounded contexts, module structure — **canonical** for entities |
| **Document 03.5** | Engineering standards — **canonical** for code conventions |
| **Document 04** | Information architecture — portal paths, route patterns, navigation |
| **Document 05** | Delivery roadmap — phase timing and team-week estimates |
| **M1.5 Certification** | Public website frozen state — constraints on M2 public site changes |

## Appendix B — Glossary

| Term | Definition |
| --- | --- |
| **Organisation** | Tenant — data partition boundary |
| **Client** | Commercial relationship with an organisation |
| **AuthContext** | Immutable value: user, org, permissions, requestId |
| **Aggregate root** | Entity that owns consistency boundary (Project, Audit, Course) |
| **Vertical slice** | End-to-end feature across all layers |
| **Outbox** | Table of domain events for async processing |
| **Issued artifact** | Immutable record (report, certificate) after formal issuance |

---

# Appendix C — Implementation checklist for engineers

Before starting any Milestone 2 implementation task:

- [ ] Read the relevant section of this document
- [ ] Read the applicable bounded context in Document 03
- [ ] Follow layering rules in Document 03.5
- [ ] Update OpenAPI spec before API implementation
- [ ] Include cross-tenant test for any new repository
- [ ] Write audit log entry for any sensitive mutation
- [ ] Do not modify frozen M1 public website architecture
- [ ] Do not import Drizzle outside `lib/data`
- [ ] Do not branch on role names — use permissions

---

*Document 06 — Business Platform & Portal Architecture · Version 1.0 · 29 July 2026 · CKBHSE Enterprise Digital Platform*
