# Document 05 — Enterprise Delivery Roadmap & Implementation Plan

**Project:** CKBHSE Enterprise Digital Platform
**Document:** 05 — Delivery Roadmap
**Version:** 1.0
**Status:** Authoritative execution plan from the current codebase to production.
**Audience:** Engineering Managers, Technical Leads, Product Managers, QA Leads, DevOps, UX Designers, AI development assistants.
**Grounded in:** Documents 01, 02 (BRS), 03 (Architecture Review), 03.5 (Engineering Standards), 04 (Information Architecture), and the code at commit `b00fbce`.
**Constraint:** Documentation only. No production code, no schema, no APIs, no pages.

---

## 1. Executive Summary

### 1.1 Where the platform actually is

Any roadmap that misstates its starting point produces a plausible sequence and a wrong one. The verified state of the repository at `b00fbce`:

| Layer                 | State           | Evidence                                                                                                    |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| Monorepo, tooling, CI | **Complete**    | pnpm workspaces, 5 lib packages, CI runs format, lint, typecheck, test, build, and OpenAPI client-sync      |
| Shared design system  | **Complete**    | `lib/ui`, 55 primitives, sole copy                                                                          |
| API hardening         | **Complete**    | helmet, CORS allowlist, rate limiting, error envelope, structured logging, graceful shutdown, validated env |
| Database schema       | **Empty**       | `lib/db/src/schema/index.ts` exports nothing; no `migrations/` directory exists                             |
| API surface           | **2 endpoints** | `/healthz`, `/readyz` only. No auth, no domain routes, no database connection                               |
| Public website        | **11 routes**   | 12 page files; contact form calls `preventDefault()` and discards; one shared `<title>`                     |
| Automated tests       | **1 file**      | `artifacts/api-server/src/app.test.ts`                                                                      |
| CI quality gates      | **Partial**     | No end-to-end, accessibility, or security scanning                                                          |
| Deployment            | **Not wired**   | `.replit` declares an autoscale target with no `build` or `run` command                                     |
| `mockup-sandbox`      | **No purpose**  | Contains no mockups; debt item D18                                                                          |

The honest summary: **the foundations and the standards are real, and the domain is at zero.** Documents 02 through 04 specify roughly 250 route patterns, a full domain model, and an RBAC scheme, none of which exists in code. There is no `users` table, no session, no tenant, no persistence of any kind.

This is a better position than it sounds. The expensive, hard-to-reverse decisions — monorepo structure, shared UI, API hardening, migration tooling, engineering standards, information architecture — are settled and documented. What remains is largely additive, which is the cheapest kind of remaining work.

### 1.2 Delivery philosophy

Four commitments shape every sequencing decision in this document.

**Journey-first, not sitemap-first.** Document 04 lists roughly 250 routes. Building them in sitemap order would produce a platform that is 40% complete in every direction and usable in none. Instead, work is organised as **vertical slices**: one domain entity implemented end to end — schema, repository, API, both user interfaces that touch it, tests, audit logging — before the next begins. A slice is releasable; a horizontal layer is not.

**Value before completeness.** The public website is the only ecosystem currently capable of generating revenue, and it currently loses every enquiry submitted to it. That makes lead capture the highest-value work in the entire programme despite being one of the smallest items in it.

**Risk-first within each phase.** Where a phase contains both a risky and a routine element, the risky one goes first, while there is still time to be wrong. Authentication, tenant isolation, and permission-aware search are addressed early and deliberately rather than deferred to a hardening phase, because discovering a tenant-isolation flaw after five modules depend on the repository layer is a rewrite, not a fix.

**No architectural debt for speed.** Where a shortcut is genuinely available, this document says so explicitly and states its repayment terms. Where it is not, the plan takes the longer path. Document 03.5 exists to make this judgement reviewable rather than personal.

### 1.3 Why journey-first was selected

The alternative approaches were considered and rejected for specific reasons.

**Layer-first** (all schema, then all repositories, then all APIs, then all UI) produces nothing demonstrable until the final layer, defers all integration risk to the end, and makes every estimate unfalsifiable until it is too late to act on. It is the single most common cause of enterprise platform overruns.

**Portal-first** (finish the Client Portal, then the Staff Portal, and so on) fails on a dependency the brief's example milestone order does not surface: **client-facing views are read views of data that internal users create.** A client portal showing projects, audit reports, invoices, and certificates cannot be demonstrated, tested, or launched unless something produces those records. Building the Client Portal before any internal write capability means seeding fake data, which tests nothing and is thrown away. §3.3 explains how the milestone order resolves this.

**Journey-first with vertical slices** produces a demonstrable, testable, releasable increment at every step, surfaces integration risk immediately, and — critically for this project — allows the public website to reach production months before the rest of the platform.

### 1.4 Expected business outcomes

| Outcome                                        | Delivered at | Why it matters                                                          |
| ---------------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| No enquiry is lost                             | Milestone 2  | Every submission is currently discarded; this is pure recovered revenue |
| Site is discoverable in search                 | Milestone 2  | 56 prerendered routes with real metadata, replacing one shared title    |
| Consultations booked without phone calls       | Milestone 2  | Removes friction at the highest-intent moment                           |
| Clients self-serve compliance status           | Milestone 4  | Reduces inbound support load; increases retention                       |
| Consultants capture findings on site once      | Milestone 5  | Removes duplicate data entry, the largest internal efficiency gain      |
| Training sold and delivered online             | Milestone 6  | Opens the second revenue stream                                         |
| Business publishes content without engineering | Milestone 7  | Removes engineering from the marketing critical path                    |
| Internal operations leave spreadsheets         | Milestone 8  | Efficiency, not revenue — hence its position                            |

### 1.5 The single most important recommendation

**The first production launch should be Milestone 2, not Milestone 9.**

The brief's example sequence places Production Launch at the end. This document recommends against that. The public website plus lead capture is independently valuable, has no dependency on authentication or any portal, and addresses both outstanding launch gates. Shipping it early converts "maintain deployment readiness throughout development" from an aspiration into a fact — a live production system enforces deployment discipline in a way that no internal process does.

Everything from Milestone 3 onward is then an incremental release to a platform that is already in production, with real users, real monitoring, and a real rollback path. Milestone 10 becomes full-platform general availability rather than a first, high-risk, all-at-once launch.

---

## 2. Delivery Strategy

### 2.1 Vertical slices

A slice is the smallest change that delivers observable value across every layer. For this platform a slice comprises: the schema migration, the repository with its tenant-scoping and cross-tenant test, the service-layer logic, the API route with its OpenAPI entry and Zod validation, the generated client, the user interface in every portal that touches the entity, audit logging, tests at each level, and documentation.

**A slice is not done when the API works.** Document 03.5's Definition of Done applies to the whole slice, and §23 restates it for this roadmap.

The reference slices, in dependency order:

| Slice                | Produces                                            | Consumes                        |
| -------------------- | --------------------------------------------------- | ------------------------------- |
| Enquiry              | Public form → staff triage view                     | —                               |
| Identity             | Users, sessions, organisations, roles, permissions  | —                               |
| Project              | Staff creates → client views                        | Identity                        |
| Document             | Consultant uploads → client downloads               | Identity, Project, file storage |
| Audit                | Consultant conducts and issues → client reads       | Identity, Project, Document     |
| Invoice              | Finance raises → client views and pays              | Identity, Project               |
| Course and Enrolment | Admin authors → student learns → certificate issued | Identity                        |
| Booking              | Public or client books → staff schedules            | Identity (partly public)        |

### 2.2 Incremental delivery

Every milestone ends in a deployable state, and from Milestone 2 onward every milestone is actually deployed. Between milestones the platform is never broken: incomplete work sits behind feature flags (§13.13) rather than on long-lived branches, because a three-week branch is a merge conflict with a delivery date attached.

Backward compatibility is preserved throughout. The API is versioned at `/api/v1`, and Document 03.5's rule holds: additive changes to existing endpoints, new versions for breaking ones. Since the API currently has two endpoints and no external consumers, the cheap moment to establish this discipline is now, before there is anything to break.

### 2.3 Risk-first implementation

Three items carry disproportionate risk and are therefore scheduled earlier than their business value alone would justify.

**Tenant isolation** is designed and tested in Milestone 3, as part of the first repository that handles tenant-scoped data — not audited later. Document 03.5 §14.3 requires a cross-tenant test per repository; the pattern must exist before there are repositories to apply it to.

**Permission-aware search** has its contract defined in Milestone 3 and its first implementation in Milestone 4, before any search interface exists. Document 04 §13.6 identifies it as the highest-severity risk in the platform: a search index is a denormalised copy of everything, and one that filters after the query rather than inside it leaks counts and pagination positions even when it hides titles.

**File storage** is decided in Milestone 0 and implemented in Milestone 4, because documents, certificates, course media, and job applications all depend on it. Debt item D4 records that no storage architecture exists; four separate features would otherwise each invent one.

### 2.4 Customer-value-first delivery

Within any milestone, work that a customer can see precedes work only engineers can see, unless a dependency forbids it. The ordering test is: _if we stopped here, would anything be better for a user than it was yesterday?_ A phase that cannot answer yes is either mis-scoped or is genuine foundation work that should be named as such rather than disguised as a feature.

This is why Milestone 1 completes the public website before Milestone 3 builds authentication, even though authentication is architecturally more fundamental. Nothing about the public site needs it.

### 2.5 Parallel workstreams

Two tracks run concurrently from the start and are the primary source of schedule compression.

**Track A — Public and Content.** Public website completion, content modelling, SEO, accessibility, analytics. Depends on `lib/ui` and the content model; needs no authentication, no RBAC, and only a minimal slice of the database.

**Track B — Platform Foundation.** Schema, migrations, database connection, authentication, RBAC, audit logging, file storage, observability.

They converge at Milestone 2, where the enquiry slice needs Track B's database and Track A's form. After Milestone 3 the tracks re-diverge into domain workstreams (§5).

The constraint on parallelism is not machine capacity but **review capacity and architectural coherence.** Two tracks are safe with the reference team in §21. Four concurrent tracks touching the repository layer at once would produce exactly the duplication Document 03.5 §19.3 forbids, and the codebase has already paid for that once — 6,479 lines deleted when the forked UI primitives were consolidated.

### 2.6 Continuous verification

The current CI pipeline runs formatting, linting, typechecking, tests, build, and OpenAPI client-sync. It is a good foundation with three named gaps: **no end-to-end tests, no accessibility scanning, no security scanning.** All three are added in Milestone 0, before there is a large surface to retrofit them onto.

Verification is continuous in a specific sense: **a quality gate is added to CI in the same milestone that creates the risk it guards.** Accessibility scanning arrives with the public website, not after it. Cross-tenant tests arrive with the first tenant-scoped repository. Performance budgets arrive with the first prerendered build. A gate added after the fact is a backlog of failures nobody has time to fix.

### 2.7 What this plan deliberately does not build

A roadmap that only adds is a wish list. Three explicit removals:

**`artifacts/mockup-sandbox` is deleted in Milestone 0.** It contains no mockups and serves no user (D18). If a design-system workbench is wanted, it should be created deliberately against `lib/ui` with that stated purpose; keeping an empty application because it exists is how monorepos rot.

**The duplicate `src/middlewares/` directory in `api-server` is removed in Milestone 0.** Both `middleware/` and `middlewares/` exist, one holding only a `.gitkeep`. Two plausible locations for the same thing guarantees that eventually both are used.

**No portal is built ahead of the internal capability that produces its data.** §3.3 covers this.

---

## 3. Project Milestones

### 3.1 Milestone overview

Eleven milestones. Complexity is expressed in **team-weeks for the reference team in §21**, not calendar dates, per the brief.

| #   | Milestone                                     | Outcome                                         | Complexity | Value       | Risk     |
| --- | --------------------------------------------- | ----------------------------------------------- | ---------- | ----------- | -------- |
| M0  | Foundation Complete                           | Deployable pipeline, real schema, full CI gates | 3–4 wk     | Enabling    | Low      |
| M1  | Public Website Complete                       | 56 prerendered routes, real metadata, WCAG AA   | 6–8 wk     | High        | Low      |
| M2  | Lead Generation — **first production launch** | No enquiry lost; site live and indexed          | 2–3 wk     | **Highest** | Medium   |
| M3  | Identity & Access Foundation                  | Auth, RBAC, tenancy, audit logging              | 5–7 wk     | Enabling    | **High** |
| M4  | Client Portal Core                            | Clients see projects and documents              | 8–10 wk    | High        | Medium   |
| M5  | Consultancy Delivery Platform                 | Consultants capture and issue on site           | 8–10 wk    | High        | **High** |
| M6  | Training Platform (LMS)                       | Courses sold and delivered online               | 10–12 wk   | High        | Medium   |
| M7  | Administration & CMS                          | Business publishes without engineering          | 8–10 wk    | Medium      | Medium   |
| M8  | Staff Operations Platform                     | Internal operations leave spreadsheets          | 8–10 wk    | Medium      | Low      |
| M9  | Enterprise Hardening                          | Security, performance, resilience verified      | 4–6 wk     | Enabling    | Medium   |
| M10 | Full Platform GA                              | All ecosystems live under one operating model   | 2–3 wk     | High        | Low      |

**Sequential total: 64–83 team-weeks.** With the two-track parallelism in §22, the elapsed range is **roughly 48 weeks at the optimistic end and 60 at the conservative end** — about eleven to fourteen months at the reference team shape. §22.1 lays out the conservative sequence in full, and that is the one to plan against; the optimistic end assumes a third concurrent stream from week 43 and no content delay in M1, neither of which should be assumed.

The single most useful number in this table is not the total but the position of M2: **first production launch at approximately week 12**, which is where the platform stops costing money and starts making it.

### 3.2 Mapping to the brief's example sequence

The brief offers a ten-milestone example. This plan keeps its structure and makes three deliberate changes, each justified.

| Brief's example         | This plan               | Change and rationale                                                                                                      |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| M0 Foundation Complete  | M0                      | Unchanged, with the specific gaps in §1.1 named                                                                           |
| M1 Public Website       | M1                      | Unchanged                                                                                                                 |
| M2 Lead Generation      | M2                      | **Becomes the first production launch** (§1.5)                                                                            |
| M3 Authentication       | M3 Identity & Access    | Widened to include RBAC, tenancy, and audit logging, which are inseparable from authentication in a multi-tenant platform |
| M4 Client Portal        | M4 Client Portal Core   | Scoped to projects and documents, and **paired with the minimum internal write capability** (§3.3)                        |
| M5 Consultancy Platform | M5                      | Unchanged                                                                                                                 |
| M6 Training Platform    | M6                      | Unchanged                                                                                                                 |
| M7 Administration       | M7 Administration & CMS | Explicitly includes the content-source migration begun in M1 (§7.2)                                                       |
| —                       | **M8 Staff Operations** | **Added.** CRM, scheduling, HR, finance and approvals are a substantial platform, not a footnote to administration        |
| M8 Enterprise Hardening | M9                      | Renumbered                                                                                                                |
| M9 Production Launch    | M10 Full Platform GA    | Reframed: production begins at M2, so this is general availability of the complete platform                               |

### 3.3 The dependency the milestone order must respect

The most important structural decision in this roadmap is that **client-facing read views are paired with the internal write capability that produces their data, in the same milestone.**

A Client Portal showing projects, documents, audit reports, invoices and certificates is a view over records that consultants, operations and finance create. Built in isolation it can only be demonstrated with seeded fixtures, which verify nothing about the real workflow and are discarded later. Worse, it invites the team to design the read model without knowing how the data is actually produced, which is how field-level mismatches enter a schema.

So each milestone from M4 onward contains a **complete two-sided slice**:

| Milestone | Internal capability (write)              | Client-facing capability (read)              |
| --------- | ---------------------------------------- | -------------------------------------------- |
| M4        | Staff creates project, uploads document  | Client views project, downloads document     |
| M5        | Consultant conducts audit, issues report | Client reads issued report, sees findings    |
| M6        | Admin authors course; trainer marks      | Student enrols, learns, receives certificate |
| M8        | Finance raises invoice                   | Client views and pays invoice                |

The invoice slice is deliberately late. Payment integration carries the highest external-dependency risk in the platform, and clients can be invoiced by existing means in the interim. Nothing else depends on it, which makes it the safest thing to defer.

### 3.4 Milestone descriptions

**M0 — Foundation Complete.** Closes the gap between "the tooling is good" and "the platform can be deployed and extended safely." Delivers the first real migrations, a live database connection, a working deploy, and the three missing CI gates. Nothing user-visible; everything after it depends on it.

**M1 — Public Website Complete.** Turns 11 hardcoded pages into the 70-pattern information architecture of Document 04 §4, prerendered with real per-route metadata. The largest pure-frontend effort in the programme, and the one most amenable to parallel work.

**M2 — Lead Generation and first production launch.** The enquiry and booking slices, plus transactional email and a minimal internal view of what arrives. Closes both launch gates. Smallest milestone, highest value.

**M3 — Identity & Access Foundation.** Authentication, sessions, organisations, RBAC, and audit logging. The highest-risk milestone in the programme because everything after it inherits these decisions. Establishes the repository patterns, tenant scoping, and permission-aware query contract that all later slices copy.

**M4 — Client Portal Core.** First authenticated portal. Projects and documents end to end, both sides. Establishes the portal application shell, navigation composed from permissions, and the file-storage implementation.

**M5 — Consultancy Delivery Platform.** Audits, findings, corrective actions, inspections, and the mobile fieldwork surface. High risk for a reason unrelated to the domain: the offline-tolerant, one-handed, on-site capture surface described in Document 04 §6.2 has requirements unlike anything else in the platform.

**M6 — Training Platform.** The largest single milestone. Courses, versioning, enrolment, lesson delivery, assessment, certification, and both learner and trainer experiences. Opens the second revenue stream.

**M7 — Administration & CMS.** Full administration portal and the migration of public content from repository files to database-backed CMS, completing the content model established in M1.

**M8 — Staff Operations Platform.** CRM, scheduling, HR, finance, approvals, internal reporting. Positioned here deliberately: these functions are currently performed by people and do not block revenue, so they yield to anything that does.

**M9 — Enterprise Hardening.** External security review, performance verification against budgets, load testing, disaster-recovery rehearsal, and accessibility audit across all five applications.

**M10 — Full Platform GA.** Documentation, training, support processes, and the launch gates in §17 verified across the whole platform.

---

## 4. Phase Breakdown

Each phase states objectives, features, dependencies, deliverables, acceptance criteria, exit criteria, complexity, business value, and risk. Complexity is team-weeks at the §21 reference shape.

---

### M0 — Foundation Complete

**Objectives.** Make the platform deployable, give it a real data layer, and close the CI gaps before there is a large surface to retrofit.

**Features and work items.**

1. Author the first migrations and establish the schema baseline. `lib/db/src/schema/index.ts` is currently empty and no `migrations/` directory exists. The baseline covers only what M2 needs — organisations, users, and enquiries — because a schema written ahead of the features that use it is a guess.
2. Add `DATABASE_URL` to the validated environment schema and wire the connection, with pooling and a readiness probe that reflects real database health rather than process liveness.
3. Wire deployment. `.replit` declares an autoscale target with no `build` or `run` command (D19). Establish the single-origin path-prefixed routing from Document 04 §2.4 at the edge.
4. Add the three missing CI gates: Playwright end-to-end, `axe` accessibility scanning, and dependency plus secret scanning.
5. Decide the file-storage architecture (D4) and record it as an ADR. Implementation waits for M4; the decision cannot, because four later features depend on it.
6. Resolve `customFetch` credential handling (D6) so authenticated requests will work when M3 arrives.
7. Delete `artifacts/mockup-sandbox` (D18) and the duplicate `src/middlewares/` directory.
8. Establish the seed and fixture strategy for local development and test databases.

**Dependencies.** None. This phase can begin immediately.

**Deliverables.** Working migration pipeline with a reversible baseline; live database connection; successful deployment to a staging environment; CI running eight gates; file-storage ADR; two removals completed.

**Acceptance criteria.**

- `pnpm run verify` passes, and CI additionally runs end-to-end, accessibility, and security scans.
- A migration can be applied and rolled back against a clean database.
- `/readyz` returns unhealthy when the database is unreachable and healthy when it is.
- A commit to `main` produces a deployed staging environment with no manual steps.
- No `components/ui/` directory exists in any application, and `mockup-sandbox` is gone.

**Exit criteria.** A new engineer can clone the repository, run one command, and reach a working local environment with a seeded database; and a merge to `main` reaches staging automatically.

**Complexity** 3–4 wk · **Value** Enabling · **Risk** Low — well-understood work with no unknowns.

---

### M1 — Public Website Complete

**Objectives.** Deliver the Document 04 §4 information architecture as a prerendered, accessible, SEO-complete public site.

**Features and work items.**

1. **Establish the content model before writing pages.** Content is defined as typed, validated structures — service, industry, course, guide, case study, vacancy, legal document — with Zod schemas as the contract. Pages consume typed content objects and never embed copy inline. §7.2 explains why this decision determines whether the site is built once or twice.
2. Build the six-group primary navigation from Document 04 §3.1, replacing the current flat eight-item bar, with the mobile drawer and accessible disclosure behaviour.
3. Implement the route inventory: about, services and sub-services, industries, training and its facet pages, case studies and testimonials, knowledge centre, blog and news, careers, legal, and the system and error routes.
4. Build the prerendering pipeline: 56 indexed patterns rendered to static HTML at build time with per-route metadata, canonical URLs, and structured data. This is the obligation Document 04 §14.1 assigns, and it is engineering work rather than content work.
5. Implement breadcrumbs with `BreadcrumbList` structured data on every route three or more segments deep.
6. Accessibility: landmarks, skip links, focus management on client-side route change, heading hierarchy, `aria-current`. The route-change focus move is the most commonly missed single-page-application requirement and is specified in Document 04 §18.3.
7. Apply the three legal redirects from Document 04 §16.6 and establish the redirect map.
8. Performance budgets and Core Web Vitals measurement in CI.
9. Analytics and consent management, gated on the cookie policy.

**Dependencies.** M0 for the CI accessibility gate and the deploy pipeline. `lib/ui` is already complete. Content authoring by Marketing, Operations and Training runs in parallel and is the most likely schedule constraint — it is a business dependency, not an engineering one, and §16 treats it as a scheduling risk.

**Deliverables.** 70 route patterns implemented; 56 prerendered with unique metadata and structured data; navigation and breadcrumbs; accessibility conformance; performance budgets enforced; redirect map.

**Acceptance criteria.**

- Every indexed route returns prerendered HTML containing its own title, description, canonical, and structured data, verified by an automated crawl in CI rather than by inspection.
- `axe` reports zero critical or serious violations across all public routes.
- Keyboard-only traversal reaches every interactive element; focus moves to `<h1>` on route change.
- Unmatched paths return HTTP 404, not 200 with an error page.
- Lighthouse performance and accessibility budgets met on mobile at the throttled CI baseline.
- No route exceeds four path segments (Document 04 §11.1).

**Exit criteria.** The site is ready to be indexed and is accessible; only lead capture is missing before it can launch.

**Complexity** 6–8 wk · **Value** High · **Risk** Low technically; **medium on schedule** because content readiness is outside engineering control.

---

### M2 — Lead Generation and First Production Launch

**Objectives.** Stop losing enquiries, enable self-service booking, and put the platform into production.

**Features and work items.**

1. **The enquiry slice, end to end.** This is the first complete vertical slice and it deliberately exercises every architectural layer: React form → Zod validation shared between client and server → API route → service → repository → Drizzle → Postgres → transactional email → audit log entry → a minimal internal view of what arrived. §25.6 explains why this specific slice is the right first one.
2. Consultation booking with availability, confirmation, and calendar invitation.
3. Transactional email: enquiry acknowledgement, internal notification, booking confirmation, newsletter double opt-in.
4. Abuse controls on the four public write surfaces in Document 04 §15.3: rate limiting, spam scoring, size caps, and a database-level constraint preventing double-booked slots.
5. A minimal internal enquiry list — the first authenticated-adjacent surface. Since M3 has not yet delivered authentication, this is protected by a deliberately interim mechanism whose replacement is a named M3 deliverable, recorded as debt with repayment terms rather than left implicit.
6. Conversion tracking against the distinct confirmation URLs from Document 04 §4.10.
7. Production environment, monitoring, alerting, backups, and a rehearsed rollback.

**Dependencies.** M0 (database, deployment, CI gates); M1 (the pages the forms live on). The email provider is a new external dependency and should be selected during M1 to avoid blocking here.

**Deliverables.** Enquiry and booking slices complete with tests; email delivery; abuse controls; internal enquiry view; production environment with monitoring, alerting, verified backups and a rehearsed rollback; analytics goals.

**Acceptance criteria.**

- A submitted enquiry is persisted, acknowledged by email, notified internally, visible to staff, and recorded in the audit log — verified by an end-to-end test, not manually.
- A booking cannot double-book a slot under concurrent submission, enforced by a database constraint rather than application logic.
- Rate limiting and spam controls demonstrably reject abusive traffic without rejecting legitimate submissions.
- Backup restoration is verified by an actual restore into a scratch environment.
- Rollback to the previous release is rehearsed and timed.
- All §17 launch gates applicable to the public site pass.

**Exit criteria.** The public website is live, indexed, capturing leads, monitored, backed up, and rollback-tested. **Production has begun.**

**Complexity** 2–3 wk · **Value** **Highest in the programme** · **Risk** Medium — the risk is operational readiness rather than the feature, and it is a first-time-through risk that never recurs.

---

### M3 — Identity & Access Foundation

**Objectives.** Establish authentication, multi-tenancy, RBAC, and audit logging — and with them the repository, scoping and query patterns every later slice copies.

**Features and work items.**

1. Organisations and the tenancy model. Every tenant-scoped table carries its organisation reference, and the repository derives it from the authorisation context, never from a request parameter.
2. Authentication: registration, login, logout, password reset, email verification, server-side sessions in `HttpOnly` cookies, and session revocation.
3. The permission catalogue, seeded through migrations so it is versioned and reviewable in pull requests per Document 03.5 §10.1, and roles composed from permissions at runtime.
4. Authorisation middleware and the server-side check on every route. Document 04 §15.2 is binding: navigation hiding is presentation, and the server is the boundary.
5. **Audit logging**, with `UPDATE` and `DELETE` revoked from the application's database role so immutability is enforced by the database rather than by convention.
6. **The cross-tenant test pattern**, applied to the first tenant-scoped repositories and made a template that every later repository copies. Document 03.5 §14.3 requires one per repository.
7. **The permission-aware query contract** defined and documented, so that search in M4 and every list endpoint afterwards inherits it rather than reinventing it (Document 04 §13.6).
8. Multi-factor authentication for privileged roles, and the multi-role grant with Super Admin approval required by BRS §10.
9. Replace M2's interim protection on the internal enquiry view, repaying that debt.
10. Minimal user administration so accounts can be created and roles assigned without direct database access.

**Dependencies.** M0. Independent of M1 and M2, so it can run in parallel with them on Track B — which is the largest single source of schedule compression in this plan.

**Deliverables.** Tenancy model; authentication flows; permission catalogue and role composition; authorisation middleware; immutable audit log; cross-tenant test template; permission-aware query contract; MFA for privileged roles; minimal user administration.

**Acceptance criteria.**

- A user of organisation A cannot read, list, count, or paginate any record of organisation B, verified by tests at the repository level, the API level, and end to end.
- Every mutating endpoint writes an audit entry containing actor, action, target, timestamp, and before-and-after state.
- The application's database role cannot `UPDATE` or `DELETE` audit rows, verified by a test that attempts it.
- No route authorises on a role name; every check resolves a permission.
- Sessions can be revoked and revocation takes effect immediately.
- Password reset and email verification tokens are single-use and expire.
- An external review of the authentication and authorisation implementation finds no critical or high findings.

**Exit criteria.** A user can register, be assigned permissions within an organisation, and reach only what those permissions allow, with every action audited — and the patterns for doing so are documented and templated for reuse.

**Complexity** 5–7 wk · **Value** Enabling · **Risk** **Highest in the programme.** Every subsequent milestone inherits these decisions, and a tenant-isolation flaw discovered after five modules depend on the repository layer is a rewrite. This is why an external review is an exit criterion rather than an M9 activity.

---

### M4 — Client Portal Core

**Objectives.** Deliver the first authenticated portal, the file-storage implementation, and the two-sided project and document slices.

**Features and work items.**

1. The portal application shell: `artifacts/client-portal` at `/portal`, with navigation composed from resolved permissions, the utility navigation and portal switcher from Document 04 §3.3, and the mobile bottom-bar pattern.
2. **File storage implemented** on the M0 decision: pre-signed direct upload, generated filenames, content-type validation, malware scanning, signed expiring download URLs, and versioning.
3. The project slice, both sides — staff creates and maintains; client views status, timeline and team.
4. The document slice, both sides — internal upload with version history; client browse, search and download.
5. The client dashboard as a router rather than a report, aggregating what needs attention from tasks, documents and messages, per Document 04 §5.2.
6. Client tasks: what CKBHSE is waiting on from the client, distinct from internal corrective actions.
7. **Permission-aware search**, first implementation, filtered at query time inside the repository.
8. In-app notifications with email digest, and deep links that address the specific record rather than the dashboard.
9. Client-side delegated user administration, where a client administrator manages colleagues within their own organisation and can grant no permission they do not hold.
10. Adopt the Document 04 §11.3 depth fixes, principally promoting audits to `/portal/audits/<id>`, before M5 creates audit records that would otherwise need migrating.

**Dependencies.** M3 for identity, tenancy, permissions and audit logging. M0 for the storage decision. The two-sided pairing in §3.3 means the minimal internal write surface is in scope here, not deferred.

**Deliverables.** Client portal application; file storage; project and document slices both sides; dashboard; tasks; permission-aware search; notifications; delegated administration.

**Acceptance criteria.**

- A client sees exactly their own organisation's projects and documents, verified by cross-tenant tests at every layer.
- Search returns only records the acting user may access, verified by a test in which a user searches for a term appearing only in another tenant's data and receives no results and no count.
- Uploads are scanned, stored under generated names, and served only through signed expiring URLs.
- Document version history is preserved and previous versions remain retrievable.
- Navigation contains no item the acting user cannot use.
- Notification deep links resolve to the specific record.
- Portal is fully keyboard operable and passes `axe` with no critical or serious violations.

**Exit criteria.** A real client can log in, see their real projects and documents, and act on what is asked of them.

**Complexity** 8–10 wk · **Value** High · **Risk** Medium. Search and file handling are the risky parts; both are mitigated by having their contracts settled in M0 and M3.

---

### M5 — Consultancy Delivery Platform

**Objectives.** Let consultants capture findings on site once, and deliver issued reports into the Client Portal.

**Features and work items.**

1. The internal application shell: `artifacts/staff-portal` at `/staff`, with the consultant experience as a role-scoped surface within it — the approved decision from Document 04 §2.3, not a sixth application.
2. Audits: scheduling, checklists, findings, severity classification, and corrective actions.
3. **The mobile fieldwork surface.** Document 04 §6.2 identifies this as the most demanding route in the platform: used on a construction site, one-handed, sometimes gloved, with intermittent connectivity. It requires large touch targets, photographic evidence capture, resilience to connection loss mid-session, and queued idempotent submission with client-supplied keys. **It is designed and built first within this milestone**, because a desk-first design adapted for mobile will fail.
4. Report drafting and issuance as separate permission-gated states, with issued reports immutable and corrections producing a new version — the constraint Document 03 establishes and Document 04 §6.3 carries forward.
5. Inspections and incident investigation.
6. Risk assessments with approval workflow.
7. Consultant dashboard, assignment scoping, calendar and meetings.
8. Client-facing delivery: issued reports, findings and corrective actions appearing in the Client Portal.
9. Internal knowledge base and consultant competency records.
10. Two-way messaging between consultant and client.

**Dependencies.** M3, M4 (projects, documents, storage, notifications).

**Deliverables.** Staff portal shell with consultant experience; audit lifecycle with immutable issuance; offline-tolerant fieldwork capture; inspections and incidents; risk assessments; client-facing report delivery; messaging.

**Acceptance criteria.**

- An audit can be conducted entirely on a mobile device, including photographic evidence, with the connection interrupted mid-session and no data lost.
- Repeated submission of the same fieldwork payload creates one record, verified by an idempotency test.
- An issued report cannot be modified; a correction produces a new version and both remain retrievable.
- Issuance requires a distinct permission and writes an audit entry.
- A client sees an issued report within the agreed interval of issuance and can see nothing before issuance.
- Fieldwork surface meets touch-target and contrast requirements and is operable one-handed.

**Exit criteria.** A consultant completes a real audit on site and the client reads the issued report in the portal, with no duplicate data entry at any point.

**Complexity** 8–10 wk · **Value** High · **Risk** **High** — the offline-tolerant mobile capture surface is unlike anything else in the platform, and its requirements are the least similar to the team's existing work.

---

### M6 — Training Platform (LMS)

**Objectives.** Sell and deliver accredited training online, opening the second revenue stream.

**Features and work items.**

1. The learning application: `artifacts/lms` at `/learn`, with learner and trainer as two role-scoped experiences in one application.
2. Course authoring, structure, and **version pinning** — enrolments pin a course version so that publishing changes does not invalidate in-progress learners. Document 04 §9.4 notes this is the normal state of any updated course, not an edge case, and it must be in the model from the start rather than retrofitted.
3. Public catalogue integration: the M1 course pages become purchasable, connecting the highest-intent public search entry points to enrolment.
4. Enrolment and payment, with access gated on payment confirmation per BRS §10.
5. Lesson delivery, including video through CDN with signed expiring URLs rather than through the API, and throttled background progress persistence that survives an abandoned session (Document 04 §9.5).
6. Assessment: question banks, quizzes, assignments, submission, marking queue, and pass criteria.
7. Certificate generation as an immutable stored artifact, with the three views in Document 04 §9.6 — learner credential, client compliance view, and public verification — all reading one record.
8. Learner dashboard with resume-where-I-left-off as the primary element, progress, transcript, achievements, bookmarks and downloads.
9. Trainer experience: course builder, cohort progress, marking, and outcome reporting.
10. Client-side visibility of employee training and certificate expiry in the Client Portal.

**Dependencies.** M3, M4. Payment provider is a new external dependency and should be selected during M5.

**Deliverables.** LMS application; course authoring with version pinning; catalogue and enrolment; payment; lesson and video delivery; assessment and marking; immutable certificates with three views; learner and trainer experiences; client training visibility.

**Acceptance criteria.**

- A learner enrolled on version 1 continues to see version 1 after version 2 is published, verified by test.
- Progress persists through an abandoned session and resumes at the correct position.
- Video is never served through the API and signed URLs expire.
- A certificate is generated once, is immutable, and reads identically in all three views.
- Public verification confirms a supplied identifier without enumerating or disclosing anything else.
- Payment failure does not grant access; payment success grants it exactly once.
- Assessment scoring is auditable and a learner cannot alter their own result.

**Exit criteria.** A member of the public buys a course from a public course page, completes it, and receives a verifiable certificate, with no manual intervention.

**Complexity** 10–12 wk · **Value** High · **Risk** Medium. Largest milestone by scope; risk is concentrated in payment integration and video delivery, both of which are well-trodden problems with mature providers.

---

### M7 — Administration & CMS

**Objectives.** Remove engineering from the content publication path and give the platform its administrative surface.

**Features and work items.**

1. `artifacts/admin-portal` at `/admin`, with the Super Admin separation from Document 04 §8.5.
2. Full user, role, permission and organisation administration, with permissions viewed rather than authored since the catalogue is migration-seeded.
3. **The CMS content-source migration.** The typed content model from M1 moves from repository files to database-backed authoring, with versioning, rollback and the approval gates from Document 04 §17.2 — including the client-approval gate on case studies and testimonials, which is a legal requirement rather than an editorial courtesy. §7.2 explains why the M1 content-model decision makes this a source swap rather than a rewrite.
4. Media library with usage tracking, so an asset cannot be deleted while referenced.
5. Redirect management, metadata and structured-data administration, and navigation structure editing.
6. Training administration, certificate issuance and revocation, and accrediting bodies.
7. **The audit log explorer**, which is what makes the immutability requirement usable — filterable by actor, action, target, organisation and time, and correlated by the `requestId` that already flows through logs and error envelopes (Document 04 §8.2).
8. System health, background jobs and queues, cache management, integrations, API keys, webhooks, email templates and feature flag administration.
9. Cross-tenant oversight routes, with reads logged as well as writes and tenant context presented unmistakably (Document 04 §8.4).

**Dependencies.** M3, and M1's content model. Best positioned after M6 so that training administration is built against a real LMS rather than an anticipated one.

**Deliverables.** Admin portal; identity administration; CMS with versioning, rollback and approval gates; media library; SEO administration; training administration; audit log explorer; system operations surfaces; feature flags; cross-tenant oversight.

**Acceptance criteria.**

- Marketing publishes, updates and rolls back a public page with no engineering involvement and no deployment.
- A case study cannot be published without a recorded client approval.
- Content changes are versioned, attributable, and reversible to any prior version.
- The audit log explorer answers "who changed this record, when, and what did it look like before" for any audited entity.
- No administrative route permits editing or deleting an audit entry.
- Cross-tenant routes require platform scope, log reads, and display tenant context.
- Legal document versions record what a user agreed to on a given date.

**Exit criteria.** The business operates its own content and administration; engineering is no longer in the publication path.

**Complexity** 8–10 wk · **Value** Medium direct, high indirect — it removes a recurring engineering cost rather than adding a customer-visible feature · **Risk** Medium, concentrated in the content migration.

---

### M8 — Staff Operations Platform

**Objectives.** Move internal operations off spreadsheets and manual process.

**Features and work items.**

1. CRM: enquiry triage through lead to client, building on the M2 enquiry slice and completing the path Document 04 §7.3 describes.
2. Resource scheduling, consultant availability, assignment board and capacity planning.
3. **The single cross-domain approval queue** from Document 04 §7.4, consolidating audit issuance, invoice authorisation, content publication, multi-role grants and refunds. Centralised so approvers have one place to look and the platform has one auditable record.
4. **The invoice slice, both sides** — finance raises, client views and pays. Deliberately last among the two-sided slices because payment integration carries the highest external-dependency risk and nothing else depends on it (§3.3).
5. HR: staff records, competency and expiry matrix, recruitment, applications, onboarding and absence, behind the HR permission boundary that excludes Operations (Document 04 §7.5).
6. Finance beyond invoicing: payments, reconciliation, refunds, retainers.
7. Operational reporting and internal announcements.
8. Marketing and support surfaces: campaigns, newsletter, lead attribution, and the support ticket queue.

**Dependencies.** M3, M4, M5. The invoice slice depends on the payment integration established in M6, which is why this milestone follows it.

**Deliverables.** CRM and lead pipeline; scheduling and capacity; unified approval queue; invoice slice both sides; HR module; finance module; operational reporting; marketing and support surfaces.

**Acceptance criteria.**

- An enquiry progresses to client and project with every transition audited and permission-gated.
- HR routes are unreachable by Operations, verified by test.
- Every approval type appears in one queue and produces one auditable record.
- A client can view and pay an invoice, and payment state reconciles without manual intervention.
- Scheduling prevents double-booking a consultant.
- Reports agree with the underlying records.

**Exit criteria.** Internal operations run on the platform rather than alongside it.

**Complexity** 8–10 wk · **Value** Medium — efficiency rather than revenue, which is precisely why it yields to everything that generates revenue · **Risk** Low. Broad but well-understood; the payment portion is the only genuinely uncertain part and it reuses M6's integration.

---

### M9 — Enterprise Hardening

**Objectives.** Verify under adversarial and load conditions what has so far only been verified functionally.

**Features and work items.**

1. External penetration test and security review across all five applications and the API.
2. Load and soak testing against the BRS §9 performance requirements, including the progress-write path from M6, which is the highest-frequency operation in the platform.
3. Full accessibility audit across all five applications, including assistive-technology testing rather than automated scanning alone.
4. Disaster recovery rehearsal: restore from backup into a clean environment and measure the actual recovery time against the stated objective.
5. Tenant isolation review as a dedicated exercise, re-verifying at scale what M3 established in principle.
6. Database performance: index review, slow-query analysis, and connection-pool tuning under load.
7. Dependency audit, secret rotation, and API-key lifecycle verification.
8. Observability completion: dashboards, alert thresholds tuned against real traffic, and on-call runbooks.
9. Data retention and deletion, covering the GDPR obligations in BRS §10.

**Dependencies.** M4 through M8 substantially complete.

**Deliverables.** Penetration test report with findings closed; load test results against budgets; accessibility audit report; rehearsed and timed disaster recovery; tenant isolation review; database tuning; observability and runbooks; retention and deletion implemented.

**Acceptance criteria.**

- No critical or high security findings remain open.
- Performance budgets met at projected peak load with headroom.
- Zero critical or serious accessibility violations across all applications.
- Recovery time and recovery point objectives demonstrated by rehearsal, not asserted.
- Tenant isolation verified by an independent reviewer.
- Alerts fire correctly against injected failures and runbooks resolve them.
- Data subject access and deletion requests are fulfilled within statutory time.

**Exit criteria.** The platform is verified against adversarial conditions, not merely functional ones.

**Complexity** 4–6 wk · **Value** Enabling · **Risk** Medium — the risk is discovering something expensive late, which is mitigated by having front-loaded security review into M3's exit criteria.

---

### M10 — Full Platform GA

**Objectives.** Bring all five ecosystems under one operating model with the launch gates verified.

**Features and work items.** Documentation completion for all audiences; user training and onboarding material per role; support processes, escalation paths and service levels; the §17 launch gate verification; final content review and sign-off; SEO verification across the full route inventory; announcement and phased user onboarding.

**Dependencies.** M9 complete.

**Deliverables.** Complete documentation; training material; support processes; signed-off launch gate checklist; onboarding plan.

**Acceptance criteria.** Every §17 gate passes; every role has documentation and training; support can resolve common issues without engineering escalation; no critical or high defects open.

**Exit criteria.** All five ecosystems are generally available and supported.

**Complexity** 2–3 wk · **Value** High · **Risk** Low.

---

## 5. Workstreams

### 5.1 Definitions

| Workstream                     | Scope                                            | Peak milestones                |
| ------------------------------ | ------------------------------------------------ | ------------------------------ |
| Architecture                   | ADRs, patterns, review, standards enforcement    | Continuous, heaviest M0, M3    |
| Database                       | Schema, migrations, indexes, performance         | M0, M3, then per slice         |
| Backend                        | Repositories, services, API routes, OpenAPI      | M3 onward, continuous          |
| Authentication & Authorisation | Sessions, RBAC, tenancy, audit logging           | M3, then per slice             |
| Frontend — Public              | Public website, prerendering, SEO surface        | M1, M2                         |
| Frontend — Portals             | Four authenticated applications                  | M4 onward                      |
| Shared UI                      | `lib/ui` extension as portal needs emerge        | M4 onward                      |
| CMS & Content Platform         | Content model, authoring, versioning             | M1 (model), M7 (authoring)     |
| Consultancy Domain             | Audits, findings, inspections, fieldwork         | M5                             |
| Training Domain                | Courses, assessment, certification               | M6                             |
| Operations Domain              | CRM, scheduling, HR, finance, approvals          | M8                             |
| Infrastructure & DevOps        | Environments, CI/CD, deployment, backups         | M0, M2, continuous             |
| Observability                  | Logging, metrics, tracing, alerting, runbooks    | M2, M9                         |
| QA                             | Test strategy, automation, gates, regression     | Continuous from M0             |
| Accessibility                  | WCAG conformance, assistive-technology testing   | M1, then per portal            |
| SEO                            | Metadata, structured data, indexing, performance | M1, M2, M7                     |
| Analytics                      | Events, funnels, dashboards                      | M2, then per portal            |
| Security                       | Threat modelling, review, scanning, response     | M0, M3, M9                     |
| Documentation                  | Technical and user documentation                 | Continuous                     |
| Content Production             | Copy, imagery, case studies, course material     | M1 onward — **business-owned** |

### 5.2 Concurrency

**Safe to run concurrently.**

| Streams                         | Condition                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| Frontend-Public + Backend/Auth  | The two tracks in §2.5; no shared code before M2                                                  |
| Content Production + everything | Business-owned; the M1 constraint                                                                 |
| Accessibility + Frontend        | Accessibility is embedded per feature, not a phase                                                |
| SEO + Frontend-Public           | Same surface, different concerns                                                                  |
| Documentation + everything      | Continuous                                                                                        |
| DevOps + feature work           | Separate concerns after M0                                                                        |
| Two domain workstreams          | Only when they touch different aggregates and neither is changing the repository or auth patterns |

**Must be sequential.**

| Streams                                                              | Reason                                             |
| -------------------------------------------------------------------- | -------------------------------------------------- |
| Database schema → Backend                                            | Repositories cannot precede tables                 |
| Auth/RBAC → any portal                                               | Every portal route authorises server-side          |
| Auth/RBAC → permission-aware search                                  | Search inherits the query contract                 |
| File storage decision → documents, certificates, media, applications | Four features, one architecture                    |
| Content model → CMS authoring                                        | M7 is a source swap only if M1 got the model right |
| Payment integration → invoicing                                      | M8 reuses M6's integration                         |
| Feature work → hardening verification                                | Cannot load-test what does not exist               |

**The real limit on parallelism is review capacity, not headcount.** Document 03.5's standards are enforced by review; more concurrent streams than the architecture workstream can review produces divergent implementations of the same pattern. Two to three concurrent streams is the safe ceiling at the reference team shape.

---

## 6. Dependency Map

### 6.1 The critical path

```
M0 Foundation
  (schema, migrations, DATABASE_URL, deployment, CI gates, storage ADR)
        |
        v
M3 Identity & Access                    <-- CRITICAL PATH BEGINS
  (tenancy, auth, RBAC, audit logging,
   cross-tenant test template,
   permission-aware query contract)
        |
        v
M4 Client Portal Core
  (portal shell, file storage,
   project + document slices, search)
        |
        +-----------------------+
        v                       v
M5 Consultancy            M6 Training
  (audits, fieldwork,       (courses, assessment,
   issuance)                 certificates, payment)
        |                       |
        +-----------+-----------+
                    v
              M7 Administration & CMS
                    |
                    v
              M8 Staff Operations
                (needs M6 payment integration)
                    |
                    v
              M9 Hardening
                    |
                    v
              M10 Full GA

Parallel, off the critical path:
M0 --> M1 Public Website --> M2 Lead Gen + FIRST PRODUCTION LAUNCH
```

### 6.2 Why M3 is the critical path

Everything authenticated inherits M3's decisions. The tenancy model determines every table's shape. The permission catalogue determines every route's authorisation. The repository scoping pattern is copied into every repository built afterwards. The permission-aware query contract is inherited by search and every list endpoint.

The practical consequence: **M3 is the one milestone where taking extra time is cheaper than saving it.** A flaw found in M3 costs days. The same flaw found in M8, after five modules have copied the pattern, costs a rewrite of the data-access layer and re-verification of every module. This is why an external review of authentication and authorisation is an M3 exit criterion rather than deferred to M9.

### 6.3 Fine-grained dependencies

| Capability                   | Hard dependencies                                             |
| ---------------------------- | ------------------------------------------------------------- |
| Any persistence              | Schema + migrations + `DATABASE_URL` (M0)                     |
| Any deployment               | Build and run commands, edge routing (M0)                     |
| Enquiry slice                | Persistence, email provider                                   |
| Any authenticated route      | Sessions, permission catalogue, authorisation middleware (M3) |
| Any tenant-scoped repository | Tenancy model, cross-tenant test template (M3)                |
| Permission-aware search      | Query contract (M3), first repository (M4)                    |
| Document upload/download     | File storage decision (M0), implementation (M4)               |
| Audit report issuance        | Projects, documents, audit logging, approval permission       |
| Certificate issuance         | Enrolment, assessment, immutable artifact storage             |
| Course purchase              | Payment integration, public catalogue (M1)                    |
| CMS authoring                | Typed content model (M1)                                      |
| Invoice payment              | Payment integration (M6)                                      |
| Load testing                 | The features being tested                                     |

### 6.4 External dependencies

Each needs selection ahead of the milestone that consumes it, because procurement is slower than engineering.

| Dependency                       | Needed by | Select during | Risk if late                     |
| -------------------------------- | --------- | ------------- | -------------------------------- |
| Managed Postgres                 | M0        | Now           | Blocks everything                |
| Object storage + CDN             | M4        | M0            | Blocks documents                 |
| Transactional email              | M2        | M1            | **Blocks first launch**          |
| Payment provider                 | M6        | M5            | Blocks second revenue stream     |
| Malware scanning                 | M4        | M3            | Blocks upload go-live            |
| Error and performance monitoring | M2        | M1            | Blocks launch readiness          |
| Accrediting body integration     | M6        | M5            | May constrain certificate format |

The email provider is the sharpest of these: it is small, easily overlooked, and gates the first production launch.

---

## 7. Public Website Delivery Plan

### 7.1 Increments

Nine increments across M1 and M2. Each is independently reviewable and deployable to staging.

| #   | Increment                          | Scope                                                                                     | Depends on |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| P1  | Content model and navigation shell | Typed content schemas, six-group navigation, mobile drawer, footer, breadcrumbs           | M0         |
| P2  | Prerendering pipeline              | Static generation, per-route metadata, canonicals, structured data, sitemap, `robots.txt` | P1         |
| P3  | Company and trust                  | `/about` and children, accreditations, partners, offices, testimonials                    | P1         |
| P4  | Commercial core                    | Services hub, 6 pillars, 16 sub-services, industries                                      | P1, P2     |
| P5  | Training public surface            | Training hub, catalogue, course pages, facet landings, schedule                           | P1, P2     |
| P6  | Knowledge and editorial            | Knowledge hub, guides, templates, policies, legislation, glossary, blog, news             | P1, P2     |
| P7  | Proof and careers                  | Case studies, vacancies with `JobPosting`, application form                               | P1, P2     |
| P8  | Legal, system and error            | Legal group, redirects, 404, edge-served 500, maintenance, offline, search                | P1         |
| P9  | Conversion                         | Contact, booking, enquiry persistence, email, confirmations, analytics                    | M0, P3–P8  |

P1 and P2 are prerequisites for everything and should be built by the strongest available frontend engineer. P3 through P8 are highly parallelisable — different route groups, shared primitives, minimal interaction — making this the milestone where additional frontend capacity converts most directly into schedule.

### 7.2 The decision that determines whether this site is built once or twice

**Public content is defined as typed, validated data from the first line of M1, and pages consume typed content objects rather than embedding copy inline.**

The tension: Milestone 7 delivers a database-backed CMS, but the public site must launch long before it. Three options exist.

| Option                                    | Launch speed                               | Cost at M7                         |
| ----------------------------------------- | ------------------------------------------ | ---------------------------------- |
| Hardcode copy in TSX                      | Fastest                                    | **Rewrite every page**             |
| Database-backed CMS in M1                 | Slowest — blocks launch on an admin portal | None                               |
| **Typed content files in the repository** | Fast                                       | **Swap the source, not the pages** |

The third is recommended. Content lives in version-controlled structured files validated by the same Zod schemas the CMS will later use, and the prerender step reads them at build time. This gives versioning, rollback, diffable review and an audit trail through git immediately, and maps naturally onto the Document 04 §17 approval gates via pull-request review.

At M7 the source changes from files to repository-backed queries. Because pages consume typed objects and the schemas are unchanged, **the page components do not change.** Only the content loader does.

The discipline this requires is narrow but absolute: no page may contain a hardcoded string of body copy. Enforced in review, and cheap to check.

### 7.3 Launch readiness

The public site launches at the end of M2 when all of the following hold. These are the §17 launch gates filtered to the public site.

- Every indexed route prerendered with unique title, description, canonical and structured data, verified by automated crawl.
- `axe` clean of critical and serious violations; keyboard traversal complete; focus moves to `<h1>` on route change.
- Performance budgets met on throttled mobile.
- Enquiry and booking persist, notify, and audit — verified end to end.
- Abuse controls active on all four public write surfaces.
- Legal pages published and approved by counsel; accessibility statement published with a tested conformance claim.
- Redirects in place; unmatched paths return 404; edge serves 500, maintenance and offline.
- Analytics and consent live; conversion goals firing.
- Monitoring and alerting active; backups verified by restore; rollback rehearsed.

---

## 8. Client Portal Delivery Plan

### 8.1 Order and rationale

| #   | Increment                                                                 | Milestone | Why here                                          |
| --- | ------------------------------------------------------------------------- | --------- | ------------------------------------------------- |
| C1  | Application shell, permission-composed navigation, account and session UI | M4        | Everything else renders inside it                 |
| C2  | Dashboard skeleton                                                        | M4        | Landing surface; populated as sources arrive      |
| C3  | **Projects** (with internal write)                                        | M4        | The spine — everything else hangs off a project   |
| C4  | **Documents** (with internal upload)                                      | M4        | Highest-frequency client task; needs file storage |
| C5  | Permission-aware search                                                   | M4        | Built once projects and documents exist to search |
| C6  | Tasks                                                                     | M4        | Completes the dashboard's attention aggregation   |
| C7  | Notifications                                                             | M4        | Pulls clients back; needs records to notify about |
| C8  | Delegated user administration                                             | M4        | Client admins onboard colleagues                  |
| C9  | Audit reports and findings                                                | M5        | Produced by M5's consultant tooling               |
| C10 | Messaging                                                                 | M5        | Paired with consultant messaging                  |
| C11 | Training visibility and certificates                                      | M6        | Requires the LMS                                  |
| C12 | Compliance calendar                                                       | M6        | Derived from certificate expiry and audit cycles  |
| C13 | Invoices and payment                                                      | M8        | Requires M6 payment integration                   |
| C14 | Bookings and support tickets                                              | M8        | Requires scheduling and support queue             |

### 8.2 Dependency notes

**Projects before everything.** Document 04 §5.3 establishes the project as the spine: it owns its timeline, documents, audits and invoices. Building any of those first means building them without their parent.

**The dashboard is built twice, deliberately.** C2 delivers the shell; each subsequent increment adds its own attention source. This is not rework — it is the only way to avoid blocking the dashboard until every source exists. Its aggregation logic is the increment that makes it valuable, and it grows.

**The compliance calendar is derived and has no create route.** Its entries project from certificate expiry, audit cycles and project milestones, which is why it cannot precede those sources.

**Invoices are last.** Payment is the highest external-dependency risk and nothing else depends on it (§3.3).

---

## 9. Consultant Portal Delivery Plan

Delivered as a role-scoped experience within `artifacts/staff-portal`, per the approved decision in Document 04 §2.3.

| #   | Increment                                                         | Milestone | Why here                                                                    |
| --- | ----------------------------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| N1  | Internal shell with role-scoped navigation and consultant landing | M5        | Shared with all internal roles                                              |
| N2  | Assigned clients and projects, scoped by authorisation context    | M5        | Scope is derived server-side, never filtered client-side                    |
| N3  | **Mobile fieldwork capture**                                      | M5        | **Built first within M5** — hardest requirements, must not be an adaptation |
| N4  | Audits, checklists, findings, severity                            | M5        | Consumes fieldwork capture                                                  |
| N5  | Corrective actions                                                | M5        | Produced by findings                                                        |
| N6  | Report drafting and issuance                                      | M5        | Issuance is the client-facing handover                                      |
| N7  | Inspections and incidents                                         | M5        | Reuse the fieldwork pattern                                                 |
| N8  | Risk assessments with approval                                    | M5        | Reuse the approval pattern                                                  |
| N9  | Calendar, meetings, tasks                                         | M5        | Coordination, valuable once delivery works                                  |
| N10 | Client messaging                                                  | M5        | Paired with C10                                                             |
| N11 | Internal knowledge base                                           | M7        | Content platform, not delivery                                              |
| N12 | Competencies and CPD                                              | M8        | Overlaps HR                                                                 |

**N3 first is the most important sequencing decision in this milestone.** Document 04 §6.2 sets out why: on-site, one-handed, gloved, intermittent connectivity, photographic evidence, queued idempotent submission. Every other internal route is used at a desk. A desk-first design adapted afterwards will fail, and the failure surfaces in the field where it is most expensive to discover.

---

## 10. Staff Portal Delivery Plan

| #   | Increment                                      | Milestone | Why here                                        |
| --- | ---------------------------------------------- | --------- | ----------------------------------------------- |
| S1  | Minimal enquiry list                           | M2        | Enquiries must be actionable at first launch    |
| S2  | Project and document write surfaces            | M4        | Pairs with C3 and C4                            |
| S3  | Consultant experience                          | M5        | §9                                              |
| S4  | **CRM**: enquiry → lead → client → project     | M8        | Completes the path S1 begins                    |
| S5  | Scheduling, availability, capacity             | M8        | Needs projects and consultants                  |
| S6  | **Unified approval queue**                     | M8        | Consolidates approvals from M5–M8               |
| S7  | Finance: invoices, payments, reconciliation    | M8        | Needs M6 payment integration                    |
| S8  | HR: people, competencies, recruitment, absence | M8        | Independent; behind its own permission boundary |
| S9  | Operational reporting                          | M8        | Needs data to report on                         |
| S10 | Announcements, marketing, support              | M8        | Lower frequency                                 |

**S1 is a deliberate exception to the milestone structure.** Enquiries arriving at first launch must be visible to someone, so a minimal list ships in M2 behind interim protection, with its replacement a named M3 deliverable. This is recorded as debt with explicit repayment terms rather than left implicit — §2.7's principle applied honestly rather than pretending the shortcut does not exist.

**S6 late is correct.** A unified approval queue can only be built once there are several approval types to unify. Built early it would be a queue with one entry type and would be redesigned when the second arrived.

---

## 11. Administration Delivery Plan

| #   | Increment                                         | Milestone                          | Why here                                           |
| --- | ------------------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| A1  | Minimal user administration and role assignment   | M3                                 | Accounts must be creatable without database access |
| A2  | Admin shell, Super Admin separation               | M7                                 | Full portal                                        |
| A3  | Users, roles, permissions, organisations          | M7                                 | Extends A1                                         |
| A4  | **CMS content migration**                         | M7                                 | The §7.2 source swap                               |
| A5  | Media library with usage tracking                 | M7                                 | Pairs with CMS                                     |
| A6  | SEO, redirects, navigation administration         | M7                                 | Marketing self-service                             |
| A7  | **Audit log explorer**                            | M7                                 | Makes M3's immutable log usable                    |
| A8  | Training administration                           | M7                                 | After M6, against a real LMS                       |
| A9  | Invoices and payments administration              | M8                                 | Pairs with S7                                      |
| A10 | Reports and analytics                             | M8                                 | Needs data                                         |
| A11 | System health, jobs, queues, cache                | M7                                 | Operational necessity as surface grows             |
| A12 | Integrations, API keys, webhooks, email templates | M7                                 | External surface management                        |
| A13 | Feature flags                                     | M0 (minimal) → M7 (administration) | Flags are needed from M0; their UI is not          |
| A14 | Security, backups, environment, legal versions    | M9                                 | Super Admin; pairs with hardening                  |

**A1 before A2 matters.** M3 needs accounts to exist without granting anyone direct database access. A minimal command-line or single-screen tool suffices and is replaced by A3.

**A7 is the highest-value administrative increment.** An immutable audit log nobody can query satisfies the letter of BRS §10 and none of its purpose (Document 04 §8.2).

**A13 split across two milestones** because feature flags are an M0 delivery mechanism — they are how incomplete work reaches `main` without breaking production (§2.2) — while their administrative interface is a convenience that can wait.

---

## 12. LMS Delivery Plan

| #   | Increment                                  | Milestone   | Why here                                            |
| --- | ------------------------------------------ | ----------- | --------------------------------------------------- |
| L1  | Public course pages                        | M1          | Highest-intent SEO entry points; ship with the site |
| L2  | LMS shell, learner and trainer experiences | M6          | Application foundation                              |
| L3  | **Course model with version pinning**      | M6          | **Must be in the model from the start**             |
| L4  | Course authoring and structure             | M6          | Trainers need content before learners               |
| L5  | Enrolment and payment                      | M6          | Connects L1 to L2                                   |
| L6  | Lesson delivery, video, progress           | M6          | The core learning experience                        |
| L7  | Assessment: banks, quizzes, assignments    | M6          | Required for certification                          |
| L8  | Marking queue                              | M6          | Trainer work surface                                |
| L9  | **Certificates** as immutable artifacts    | M6          | The commercial outcome                              |
| L10 | Learner dashboard, progress, transcript    | M6          | Resume-where-I-left-off is the primary element      |
| L11 | Bookmarks, downloads, achievements         | M6          | Retention, not core                                 |
| L12 | Client-side training visibility            | M6          | The third certificate view                          |
| L13 | Cohort and outcome reporting               | M7          | Reporting after delivery works                      |
| L14 | Course discussion                          | Post-launch | Reserved in Document 04 §9.1                        |

**L3 is the critical decision.** Enrolments pin a course version so that publishing changes does not invalidate in-progress learners. Document 04 §9.4 notes this is the normal state of any updated course. Retrofitting versioning onto a live LMS means migrating in-flight enrolments — one of the most expensive corrections available in this programme, and entirely avoidable by modelling it on day one.

**L9 immutability likewise.** A certificate is a legal artifact generated once and stored, never regenerated from live data — otherwise editing a course silently alters certificates already issued.

---

## 13. Cross-Cutting Infrastructure

Delivery milestone for each cross-cutting concern, with the principle that infrastructure arrives in the milestone that first genuinely needs it — early enough to shape what follows, late enough to be informed by real requirements.

| #     | Concern                         | Delivered                             | Notes                                                                                                                                                              |
| ----- | ------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 13.1  | **Configuration**               | M0                                    | Validated env schema exists with 9 variables; `DATABASE_URL` and provider credentials added as consumed. Boot-time validation already fails fast, which is correct |
| 13.2  | **Logging**                     | Exists                                | Structured logging with `requestId` correlation in place; extend to correlate across audit entries                                                                 |
| 13.3  | **Rate limiting**               | Exists                                | In place; per-route tuning for the four public write surfaces in M2                                                                                                |
| 13.4  | **Monitoring & alerting**       | M2                                    | Required for first production launch, not after it                                                                                                                 |
| 13.5  | **Background jobs**             | M2 minimal → M6 full                  | Email dispatch in M2; certificate generation, video processing and digests in M6                                                                                   |
| 13.6  | **Email**                       | M2                                    | Transactional first; templates administered in M7                                                                                                                  |
| 13.7  | **Authentication**              | M3                                    | Sessions in `HttpOnly` cookies, single origin per Document 04 §2.4                                                                                                 |
| 13.8  | **Authorisation**               | M3                                    | Permission catalogue migration-seeded; roles composed at runtime                                                                                                   |
| 13.9  | **Audit logging**               | M3                                    | `UPDATE`/`DELETE` revoked from the application database role                                                                                                       |
| 13.10 | **File storage**                | M0 decision → M4 implementation       | Pre-signed upload, generated names, malware scan, signed expiring downloads                                                                                        |
| 13.11 | **Search**                      | M3 contract → M4 first implementation | Postgres full-text; permission filtering at query time inside the repository                                                                                       |
| 13.12 | **Caching**                     | M4 → M9 tuning                        | Prerendered public site needs little; portals need query-level caching                                                                                             |
| 13.13 | **Feature flags**               | M0                                    | The mechanism that keeps incomplete work off long-lived branches                                                                                                   |
| 13.14 | **Analytics**                   | M2                                    | Public funnel first; portal analytics per portal                                                                                                                   |
| 13.15 | **API documentation & OpenAPI** | Exists, extended per slice            | CI already verifies the generated client matches the spec — the discipline is established and needs only to be maintained                                          |

### 13.16 The two that must not slip

**Feature flags (13.13) are a delivery mechanism, not a feature.** Without them, incomplete work either blocks a release or lives on a long-lived branch. Both are worse than a flag. This is why they appear in M0 despite having no user value.

**Monitoring (13.4) belongs in M2, not M9.** A production system without monitoring is one where users report incidents before the team knows about them. Since M2 is the first production launch, monitoring is a launch gate, not a hardening activity.

---

## 14. Quality Assurance Strategy

### 14.1 Starting position

**One test file exists in the repository** (`artifacts/api-server/src/app.test.ts`). CI runs formatting, linting, typechecking, tests, build and OpenAPI client-sync — a good pipeline with nothing substantial to run through it.

The implication for this roadmap: **test coverage is built with each slice, never retrofitted.** A milestone that ships without tests creates a debt that compounds, because the next milestone builds on untested foundations and the cost of establishing a baseline rises with every one.

### 14.2 Test levels and gates

| Level         | Scope                                             | When                             | Gate                   | Pass criteria                                                        |
| ------------- | ------------------------------------------------- | -------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| Unit          | Pure logic, validators, domain rules              | Every PR                         | CI blocking            | All pass; coverage on domain logic does not decrease                 |
| Integration   | Repositories against a real Postgres              | Every PR                         | CI blocking            | All pass; **every tenant-scoped repository has a cross-tenant test** |
| API contract  | Routes against OpenAPI, including error envelopes | Every PR                         | CI blocking            | Spec and implementation agree; generated client in sync              |
| Authorisation | Every route against every relevant permission     | Every PR from M3                 | CI blocking            | No route reachable without its permission; no cross-tenant read      |
| End-to-end    | Critical journeys in a browser                    | Every PR (smoke), nightly (full) | CI blocking on smoke   | Smoke green; full suite green before release                         |
| Accessibility | `axe` on every route; manual per portal           | Every PR (automated)             | CI blocking            | Zero critical or serious violations                                  |
| Performance   | Lighthouse budgets; API latency                   | Every PR (public), per release   | CI blocking on budgets | Budgets met at throttled mobile baseline                             |
| Security      | Dependency and secret scanning; SAST              | Every PR                         | CI blocking            | No high or critical findings                                         |
| Load          | Sustained and peak traffic                        | M9, then per major release       | Release gate           | BRS §9 targets met with headroom                                     |
| Penetration   | Adversarial, external                             | M3 (auth scope), M9 (full)       | Release gate           | No critical or high findings open                                    |
| Regression    | Accumulated suite                                 | Every release                    | Release gate           | No regressions                                                       |
| Acceptance    | Business verification against BRS                 | Per milestone                    | Milestone gate         | Product owner sign-off                                               |

### 14.3 The three non-negotiable tests

**Cross-tenant isolation.** Every tenant-scoped repository has a test proving a user of organisation A cannot read, list, count or paginate organisation B's records. Document 03.5 §14.3 requires it; this roadmap makes the template an M3 deliverable so later slices copy rather than invent it.

**Permission-aware search.** A test in which a user searches for a term appearing only in another tenant's data and receives no results **and no count**. Post-filtering leaks totals and pagination positions even when it hides titles, and only a query-time test catches the difference.

**Audit immutability.** A test that attempts to `UPDATE` and `DELETE` an audit row using the application's database credentials and asserts both fail. This verifies the privilege revocation rather than the application's intention not to modify.

### 14.4 Environments for testing

Integration tests run against a real Postgres in CI, never a mock or an in-memory substitute — the tenant-scoping behaviour being verified is partly a database behaviour, and a mock would verify the test's assumptions instead of the system.

### 14.5 Definition of a passing milestone

A milestone passes when every gate above is green, its §4 acceptance criteria are demonstrated, its §24 architecture validation checklist is signed, and no critical or high defect is open. Medium and low defects are triaged and may be carried with a recorded decision.

---

## 15. DevOps & Release Strategy

### 15.1 Starting position

`.replit` declares an autoscale deployment target with `router = "application"` and a post-build step, but **no `build` or `run` command** (D19). Deployment is therefore not currently possible. `.env.example` exists and the environment schema validates nine variables at boot, failing fast on misconfiguration — the right behaviour, already in place.

### 15.2 Environments

| Environment | Purpose                            | Data                    | Deploys from             | Access            |
| ----------- | ---------------------------------- | ----------------------- | ------------------------ | ----------------- |
| Local       | Development                        | Seeded fixtures         | Working tree             | Engineer          |
| CI          | Verification                       | Ephemeral per run       | Pull request             | Automated         |
| Staging     | Integration, acceptance, rehearsal | Anonymised or synthetic | `main`, automatically    | Team, product, QA |
| Production  | Live                               | Real                    | Tagged release, approved | Restricted        |

**Staging must never contain unanonymised client data.** Audit findings and personal data carry the same confidentiality obligations wherever they sit, and a staging environment with looser access controls holding real data is a breach waiting to be reported.

### 15.3 CI/CD pipeline

Current: format check, lint, typecheck, test, build, OpenAPI client-sync — six gates.
Added in M0: end-to-end, accessibility, dependency and secret scanning — nine gates.

On merge to `main`: full pipeline, then automatic deploy to staging, then smoke tests against staging. Production deploys from a tagged release with approval (§15.8), run migrations first, then deploy, then smoke test, with automatic rollback on smoke failure.

### 15.4 Migrations

Forward-only in production, with every migration reversible in development. Expand-and-contract for breaking changes: add the new shape, migrate data, switch reads, remove the old shape across separate releases — never in one, because a single-release breaking migration cannot be rolled back once traffic has written to the new shape.

Migrations run before the deploy that needs them and must be backward-compatible with the currently running version, which is what makes rollback possible at all.

### 15.5 Secrets

Never in the repository. Injected as environment variables from the platform's secret store, validated at boot by the existing schema. Rotated on a schedule and on any suspected exposure, with rotation rehearsed in M9. Separate credentials per environment, and no production credential ever present in a local or CI environment.

### 15.6 Rollback

Application rollback is a redeploy of the previous tagged release, rehearsed and timed in M2 and re-verified each release. Database rollback is deliberately harder and is why §15.4 mandates expand-and-contract: the rollback path for data is forward-compatibility, not reverse migration.

**Rollback is rehearsed before first launch, not documented and hoped for.** An untested rollback is an assumption.

### 15.7 Backups, health checks, monitoring

Automated database backups with point-in-time recovery, **verified by actual restore into a scratch environment** in M2 and rehearsed in M9. A backup that has never been restored is untested.

`/healthz` and `/readyz` exist; M0 makes readiness reflect real database health rather than process liveness, so orchestration stops routing traffic to an instance that cannot serve it.

Monitoring from M2: error rate, latency percentiles, database health and pool saturation, queue depth, availability, and Core Web Vitals from real users. Alert thresholds are tuned against real traffic in M9 — thresholds set before there is traffic are guesses that train the team to ignore alerts.

### 15.8 Release approvals

| Change                           | Approval                                                   |
| -------------------------------- | ---------------------------------------------------------- |
| Any pull request                 | One reviewer; architecture review for pattern changes      |
| Staging deploy                   | Automatic on green pipeline                                |
| Production deploy                | Technical lead plus product owner                          |
| Migration touching existing data | Technical lead plus architecture review                    |
| Permission or role change        | Super Admin, audited                                       |
| Security-affecting change        | Security owner                                             |
| Rollback                         | Technical lead, or on-call unilaterally during an incident |

Rollback authority during an incident sits with whoever is on call, without waiting for approval. Requiring sign-off to stop an outage lengthens it.

---

## 16. Risk Register

Likelihood and impact are Low / Medium / High. Owner refers to the §21 roles.

### 16.1 Technical

| Risk                                           | L        | I            | Mitigation                                                                                                                       | Owner        |
| ---------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Tenant isolation flaw reaches production       | Medium   | **Critical** | Repository-enforced scoping; cross-tenant test per repository; external review as M3 exit criterion; independent re-review in M9 | Architecture |
| Search leaks across tenants or leaks counts    | Medium   | **Critical** | Query-time filtering inside the repository; the §14.3 no-results-and-no-count test; contract defined in M3 before any UI         | Backend      |
| Course versioning retrofitted after launch     | Low      | **High**     | Version pinning in the M6 model from day one (L3)                                                                                | Architecture |
| Prerendering pipeline underestimated           | **High** | High         | Scoped precisely at 56 patterns; P2 built early by a senior engineer; automated crawl verification in CI                         | Frontend     |
| Offline fieldwork capture harder than expected | **High** | High         | N3 built first in M5; idempotent submission with client keys; field-tested on real devices early                                 | Frontend     |
| Repository pattern drifts across teams         | Medium   | High         | Templates from M3; architecture review on pattern changes; concurrency capped at review capacity (§5.2)                          | Architecture |
| Duplicated UI components reappear              | Medium   | Medium       | `lib/ui` as sole source; `components/ui/` forbidden and lint-enforced; the 6,479-line consolidation as precedent                 | Frontend     |
| Migration causes data loss                     | Low      | **Critical** | Expand-and-contract; forward-only in production; review required; restore-verified backups                                       | Backend      |
| Payment integration edge cases                 | Medium   | High         | Provider-hosted flows; idempotency keys; reconciliation; deferred to M6/M8 when patterns are mature                              | Backend      |
| Performance degrades as data grows             | Medium   | Medium       | Index review and load testing in M9; budgets in CI from M1                                                                       | Backend      |

### 16.2 Business

| Risk                                          | L        | I      | Mitigation                                                                                                                                                                                                                          | Owner               |
| --------------------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Content not ready, delaying M1**            | **High** | High   | Content is business-owned and the most likely M1 constraint; start production during M0; launch with a defensible subset and publish the rest incrementally — the CMS-less content model (§7.2) makes incremental publication cheap | Product / Marketing |
| Scope grows with 250 documented routes        | **High** | High   | Milestone exit criteria are binding; new scope enters the post-launch roadmap (§19), not the current milestone                                                                                                                      | Product             |
| Client approval for case studies not obtained | Medium   | Medium | Approval is a hard gate (Document 04 §17.2); begin obtaining consent during M1                                                                                                                                                      | Marketing           |
| Second revenue stream delayed by LMS size     | Medium   | High   | M6 is the largest milestone; L1 course pages ship in M1 so enquiry-led sales work before the LMS exists                                                                                                                             | Product             |
| Internal adoption resistance                  | Medium   | Medium | M8 positioned after the platform has proven itself externally; training in M10                                                                                                                                                      | Operations          |

### 16.3 Operational

| Risk                                   | L        | I            | Mitigation                                                                                 | Owner               |
| -------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------ | ------------------- |
| Deployment not wired blocks everything | **High** | **Critical** | First M0 work item; D19 is a known gap                                                     | DevOps              |
| No monitoring at first launch          | Medium   | High         | Monitoring is an M2 launch gate, not an M9 activity                                        | DevOps              |
| Backups never restore-tested           | Medium   | **Critical** | Restore verification is an M2 acceptance criterion                                         | DevOps              |
| Alert fatigue from untuned thresholds  | Medium   | Medium       | Thresholds tuned against real traffic in M9                                                | DevOps              |
| Single points of knowledge             | Medium   | Medium       | Documentation continuous; review spreads context; no single owner for a critical path area | Engineering Manager |

### 16.4 Security

| Risk                                     | L      | I            | Mitigation                                                                                                                     | Owner        |
| ---------------------------------------- | ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Anonymous file upload abused             | Medium | **High**     | Built last of the four public write surfaces, after storage exists; scanning, generated names, content inspection, rate limits | Security     |
| Session or CSRF weakness                 | Low    | **Critical** | Single origin keeps cookies first-party; `SameSite` plus origin check; external review in M3                                   | Security     |
| Privilege escalation via delegated admin | Medium | High         | A client admin can grant no permission they do not hold; every grant audited                                                   | Backend      |
| Cross-tenant admin route misused         | Medium | High         | Platform-scope permission; reads logged as well as writes; unmistakable tenant context                                         | Architecture |
| Real client data in staging              | Medium | **High**     | Anonymised or synthetic only; enforced in the deploy pipeline                                                                  | DevOps       |
| Secret exposure                          | Low    | **Critical** | Secret scanning in CI from M0; rotation rehearsed in M9                                                                        | Security     |

### 16.5 Schedule and integration

| Risk                                                 | L        | I        | Mitigation                                                                                                       | Owner               |
| ---------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Email provider not selected, gating first launch** | Medium   | **High** | Small, easily overlooked, gates M2; select during M1 (§6.4)                                                      | DevOps              |
| M3 overruns and blocks everything downstream         | Medium   | **High** | Extra time in M3 is cheaper than saving it (§6.2); Track A continues delivering value in parallel                | Engineering Manager |
| Parallelism exceeds review capacity                  | **High** | Medium   | Two to three concurrent streams capped (§5.2)                                                                    | Architecture        |
| Accrediting body constrains certificate format       | Medium   | Medium   | Engage during M5, before M6 builds certification                                                                 | Product             |
| Payment provider onboarding slower than build        | Medium   | Medium   | Begin commercial onboarding during M5                                                                            | Product             |
| Estimates wrong because team shape differs           | **High** | Medium   | Estimates are team-weeks at the §21 reference shape; re-baseline against the actual team before committing dates | Engineering Manager |

### 16.6 The five to watch

Ranked by expected cost, being the product of likelihood and impact rather than impact alone:

1. **Tenant isolation flaw** — mitigated by front-loading review into M3's exit criteria rather than M9.
2. **Content readiness delaying M1** — the highest-likelihood schedule risk, and the one furthest outside engineering's control.
3. **Prerendering underestimated** — a direct consequence of the Vite decision, high likelihood because it is easy to mistake for routine frontend work.
4. **Offline fieldwork capture** — high likelihood because its requirements are least similar to anything the team has built.
5. **Scope growth against 250 documented routes** — a complete IA invites building broadly; only binding exit criteria prevent it.

---

## 17. Launch Gates

Two gate sets, because there are two launches: the public site at M2 and full platform GA at M10.

### 17.1 Gate A — Public site (end of M2)

| #   | Gate                                                                                | Verified by                           | Blocking |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------- | -------- |
| A1  | Every indexed route prerendered with unique metadata, canonical and structured data | Automated crawl in CI                 | Yes      |
| A2  | Zero critical or serious accessibility violations; keyboard traversal complete      | `axe` in CI plus manual keyboard pass | Yes      |
| A3  | Accessibility statement published with a tested conformance claim                   | Engineering plus director sign-off    | Yes      |
| A4  | Performance budgets met on throttled mobile                                         | Lighthouse in CI                      | Yes      |
| A5  | Enquiry and booking persist, notify, audit                                          | End-to-end test                       | Yes      |
| A6  | Abuse controls active on all four public write surfaces                             | Security test                         | Yes      |
| A7  | Legal pages published and approved by external counsel                              | Counsel sign-off                      | Yes      |
| A8  | Redirects in place; 404 returns HTTP 404; edge serves 500, maintenance, offline     | Automated check                       | Yes      |
| A9  | Analytics and consent live; conversion goals firing                                 | Manual verification                   | Yes      |
| A10 | Monitoring and alerting active                                                      | Injected failure triggers alert       | Yes      |
| A11 | Backups verified **by actual restore**                                              | Restore into scratch environment      | Yes      |
| A12 | Rollback rehearsed and timed                                                        | Rehearsal record                      | Yes      |
| A13 | No critical or high defects open                                                    | Defect triage                         | Yes      |
| A14 | Dependency and secret scans clean                                                   | CI                                    | Yes      |

### 17.2 Gate B — Full platform GA (end of M10)

Gate A remains in force, plus:

| #   | Gate                                                                                         | Verified by                   | Blocking |
| --- | -------------------------------------------------------------------------------------------- | ----------------------------- | -------- |
| B1  | External penetration test with no critical or high findings open                             | External report               | Yes      |
| B2  | **Tenant isolation independently verified**                                                  | Independent review            | Yes      |
| B3  | **Permission-aware search verified to leak neither records nor counts**                      | Security test plus review     | Yes      |
| B4  | Authorisation enforced server-side on every route                                            | Automated authorisation suite | Yes      |
| B5  | Audit logging active on every mutating endpoint; immutability enforced by database privilege | Automated test                | Yes      |
| B6  | Performance targets met at projected peak load with headroom                                 | Load test                     | Yes      |
| B7  | Accessibility verified across all five applications including assistive technology           | Audit report                  | Yes      |
| B8  | Disaster recovery rehearsed; RTO and RPO demonstrated                                        | Rehearsal record              | Yes      |
| B9  | Data retention and deletion operational per GDPR                                             | Process test                  | Yes      |
| B10 | Monitoring, alerting and runbooks complete; alerts tuned against real traffic                | On-call rehearsal             | Yes      |
| B11 | Documentation complete for every audience                                                    | Review                        | Yes      |
| B12 | Support processes and escalation live; support resolves common issues without engineering    | Process rehearsal             | Yes      |
| B13 | Every §24 architecture validation checklist signed                                           | Architecture sign-off         | Yes      |
| B14 | No critical or high defects open                                                             | Defect triage                 | Yes      |
| B15 | Payment reconciliation verified against provider records                                     | Finance sign-off              | Yes      |

### 17.3 The three gates most likely to be argued about

**A11 (backup restore) and A12 (rollback rehearsal)** are commonly reduced to documentation because nothing appears to depend on them. Both are assumptions until exercised, and the moment they are needed is the worst moment to discover they do not work.

**B3 (search leaks neither records nor counts)** will be tempting to treat as satisfied by "search results are filtered." The distinction between post-filtering and query-time filtering is invisible in the interface and total in its consequences, and only the explicit no-count test distinguishes them.

---

## 18. Success Metrics

Metrics are grouped by audience and each has a baseline, because a target without a baseline cannot be evaluated. Several baselines are literally zero today, which makes early progress easy to demonstrate and easy to overstate — the targets below are set at levels that represent real operating quality rather than movement off zero.

### 18.1 Technical

| Metric                       | Baseline         | Target                                                           | From       |
| ---------------------------- | ---------------- | ---------------------------------------------------------------- | ---------- |
| Automated test files         | **1**            | Every slice covered at unit, integration and authorisation level | M0         |
| CI gates                     | 6                | 9                                                                | M0         |
| CI pipeline duration         | —                | Under 15 min for the blocking path                               | M0         |
| Cross-tenant tests           | 0                | One per tenant-scoped repository                                 | M3         |
| Deployment frequency         | **Not possible** | At least weekly to production                                    | M2         |
| Change failure rate          | —                | Under 15%                                                        | M2         |
| Mean time to restore         | —                | Under 1 hour                                                     | M2         |
| Duplicated UI component sets | 1 (`lib/ui`)     | Remains 1                                                        | Continuous |

### 18.2 Business

| Metric                                | Baseline                 | Target                             | From |
| ------------------------------------- | ------------------------ | ---------------------------------- | ---- |
| Enquiries captured                    | **0 — all discarded**    | 100% of submissions persisted      | M2   |
| Consultations booked online           | 0                        | Majority of bookings self-service  | M2   |
| Organic search entrances              | Effectively 0            | Growing month on month             | M2   |
| Indexed pages                         | 11 with one shared title | 56 with unique metadata            | M2   |
| Course enrolments online              | 0                        | Second revenue stream contributing | M6   |
| Content published without engineering | 0%                       | 100%                               | M7   |

### 18.3 Operational

| Metric                              | Baseline    | Target                    | From |
| ----------------------------------- | ----------- | ------------------------- | ---- |
| Uptime                              | —           | 99.9%                     | M2   |
| Backup restore verified             | Never       | Monthly                   | M2   |
| Alert precision                     | —           | Under 10% false positives | M9   |
| Manual steps to deploy              | Undefined   | 0                         | M0   |
| Duplicate data entry by consultants | Every audit | 0                         | M5   |

### 18.4 Customer

| Metric                                                        | Baseline     | Target                      | From |
| ------------------------------------------------------------- | ------------ | --------------------------- | ---- |
| Clients answering "am I compliant?" without contacting CKBHSE | 0%           | Majority                    | M4   |
| Portal adoption among active clients                          | 0%           | Over 70% within one quarter | M4   |
| Course completion rate                                        | —            | Over 80% of paid enrolments | M6   |
| Time from audit issuance to client visibility                 | Manual, days | Under 1 minute              | M5   |

### 18.5 Security, performance and support

| Metric                                       | Baseline   | Target             | From |
| -------------------------------------------- | ---------- | ------------------ | ---- |
| Open critical or high vulnerabilities        | Unknown    | 0                  | M0   |
| Cross-tenant incidents                       | —          | **0, permanently** | M3   |
| Audited mutating endpoints                   | 0          | 100%               | M3   |
| Largest Contentful Paint, mobile             | Unmeasured | Under 2.5 s        | M2   |
| API p95 latency                              | —          | Under 300 ms       | M4   |
| Support tickets resolved without engineering | —          | Over 80%           | M10  |

**The one metric that must never move from zero is cross-tenant incidents.** Every other target admits degradation and recovery; this one does not, because a single incident is a confidentiality breach with regulatory and commercial consequences.

---

## 19. Post-Launch Roadmap

Sequenced by dependency and value, not designed. Document 04 §19 has already reserved namespaces for each, so none requires an information-architecture change.

### 19.1 Sequence

| Wave | Capability                             | Reserved at                                                   | Rationale                                                                                                         |
| ---- | -------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1    | **Risk Assessment Builder**            | `/staff/risk-assessments/builder`, `/portal/risk-assessments` | Namespace partly in use from M5; highest client demand; reuses the approval and versioning patterns already built |
| 1    | **Incident Reporting** (client-facing) | `/portal/incidents/new`                                       | Internal side exists from M5; client-facing reporting is the smaller half                                         |
| 1    | Compliance Dashboard                   | `/portal/compliance`                                          | Extends the M4 compliance calendar                                                                                |
| 2    | **Method Statement Builder**           | `/staff/method-statements`                                    | Same pattern as risk assessments; build second to reuse it                                                        |
| 2    | COSHH Manager                          | `/staff/coshh`, `/portal/coshh`                               | Substance register plus assessments                                                                               |
| 2    | Equipment Register                     | `/portal/equipment`, `/staff/equipment`                       | Asset records with inspection cycles                                                                              |
| 3    | **Permit-to-Work**                     | `/staff/permits`, `/portal/permits`                           | Time-bounded validity and approval workflow; more complex than it appears                                         |
| 3    | **Mobile Application**                 | `/api/v1` only                                                | No new routes; see §19.3                                                                                          |
| 4    | **AI HSEQ Assistant**                  | `/portal/assistant`, `/staff/assistant`                       | Deliberately late; see §19.2                                                                                      |
| 4    | Subscription Platform                  | Extends `/admin/subscriptions`                                | Recurring revenue; needs stable pricing and entitlements                                                          |
| 5    | **Contractor Portal**                  | `/contractor`                                                 | Needs the §19.4 data-model decision first                                                                         |
| 5    | Supplier Portal                        | `/supplier`                                                   | As above                                                                                                          |
| 5    | Customer Success                       | Folded into `/portal`                                         | An experience, not an ecosystem                                                                                   |
| 6    | API Marketplace                        | Not reserved                                                  | Deliberately unreserved (Document 04 §19.5); requires a public API product decision that does not yet exist       |

### 19.2 Why the AI Assistant is late

It is the most commercially attractive item on this list and the most likely to cause a serious incident. Document 04 §19.3 identifies it as the highest-risk future product from a security standpoint: it is cross-cutting by nature and therefore tempted to read across every domain, and it must operate strictly within the acting user's authorisation context.

It should be built after the permission model has been in production long enough to be trusted, and after permission-aware search — which solves the same problem in a simpler form — has been proven. Building it earlier means testing the authorisation model for the first time using the component least able to tolerate a mistake.

### 19.3 Mobile application

Consumes `/api/v1` and adds no front-end routes, but reopens one settled question: a native client cannot use first-party session cookies, so it needs a deliberately designed token contract. Document 03 recommends removing the unused `setAuthTokenGetter` because bearer tokens contradict the session-cookie decision; a mobile client would require a new, explicitly designed authentication path rather than a reinstatement of that code. That design work is the real cost, not the client itself.

### 19.4 Contractor and supplier portals

Both involve third-party organisations seeing a slice of a client's data. This is expressible within the existing single-organisation tenancy plus a cross-organisation grant, and **must not be implemented by relaxing tenant isolation.** The data-model implication should be settled before either is built, because getting it wrong reopens the guarantee BRS §10 depends on. Reserving the namespace was cheap; this decision is not.

---

## 20. Implementation Priority Matrix

Priority reflects **the cost of not having it**, which is why some low-visibility items rank critical and some attractive features rank low.

### 20.1 Critical

Cannot launch, or blocks everything downstream.

| Capability                          | Milestone | Why critical                                        |
| ----------------------------------- | --------- | --------------------------------------------------- |
| Schema and migrations               | M0        | No persistence exists; everything depends on it     |
| Deployment pipeline                 | M0        | Currently impossible (D19)                          |
| Enquiry persistence                 | M2        | Every submission is discarded — active revenue loss |
| Per-route metadata and prerendering | M1–M2     | 11 routes share one title; BRS §9 requires SEO      |
| Authentication and sessions         | M3        | Gates every authenticated capability                |
| Tenancy and RBAC                    | M3        | Multi-tenant isolation is a legal obligation        |
| Audit logging                       | M3        | BRS §10 mandatory; retrofitting is a rewrite        |
| Permission-aware search             | M3–M4     | Highest-severity data-leak risk                     |
| File storage                        | M0–M4     | Four features depend on one architecture            |
| Monitoring, backups, rollback       | M2        | Production readiness, not hardening                 |
| Legal and accessibility pages       | M1        | Regulatory obligation                               |

### 20.2 High

Core value; the platform is materially incomplete without them.

| Capability                               | Milestone | Why high                             |
| ---------------------------------------- | --------- | ------------------------------------ |
| Public IA and navigation                 | M1        | The entire acquisition surface       |
| Consultation booking                     | M2        | Conversion at peak intent            |
| Client portal shell, projects, documents | M4        | The client relationship              |
| Audit lifecycle and issuance             | M5        | The core service                     |
| Mobile fieldwork capture                 | M5        | Largest internal efficiency gain     |
| Course delivery and certification        | M6        | Second revenue stream                |
| Course version pinning                   | M6        | Cheap now, near-impossible later     |
| CMS content migration                    | M7        | Removes engineering from publication |
| Audit log explorer                       | M7        | Makes the audit log usable           |
| Feature flags                            | M0        | Delivery mechanism, not a feature    |

### 20.3 Medium

Real value; can follow the critical path.

CRM and lead pipeline (M8) · scheduling and capacity (M8) · unified approval queue (M8) · invoicing and payment (M8) · HR module (M8) · notifications and digests (M4) · delegated client administration (M4) · media library (M7) · operational reporting (M8) · analytics beyond the public funnel (M4+) · internal knowledge base (M7) · caching (M4, tuned M9).

### 20.4 Low

Defer without material cost.

Course discussion forums · achievements and badges · saved searches · advanced dashboard customisation · bulk operations before there is bulk · additional facet landing pages beyond the three in Document 04 §4.5 · localisation (Document 04 §14.8 keeps it available and correctly declines to build it) · a design-system workbench unless `lib/ui` growth justifies it.

### 20.5 Two priority calls worth stating plainly

**Feature flags are critical despite having no user value**, because they are what allows incomplete work to reach `main` without breaking production. Classified by delivery consequence rather than user visibility.

**Invoicing is medium despite being revenue-adjacent**, because clients can be invoiced by existing means and nothing else depends on it, while it carries the highest external-dependency risk in the platform. Deferring it removes risk from the critical path at almost no cost.

---

## 21. Team Responsibilities

### 21.1 Reference team

Estimates throughout this document are **team-weeks at this shape.** A different shape changes the elapsed time, not the sequence.

| Role                         | FTE      | Primary ownership                                                      |
| ---------------------------- | -------- | ---------------------------------------------------------------------- |
| Technical Lead / Architect   | 1        | ADRs, patterns, review, standards enforcement, critical-path decisions |
| Backend Engineer             | 2        | Schema, repositories, services, API, authorisation                     |
| Frontend Engineer            | 2        | Public site, portals, `lib/ui`, accessibility                          |
| Full-stack Engineer          | 1        | Flex across tracks; vertical slice ownership                           |
| QA Engineer                  | 0.5      | Strategy, automation, gates, regression                                |
| DevOps Engineer              | 0.5      | Environments, CI/CD, deployment, observability, backups                |
| UX Designer                  | 0.5      | Journeys, portal design, fieldwork surface                             |
| **Engineering total**        | **7.5**  |                                                                        |
| Product Owner                | 0.5      | Scope, acceptance, priority                                            |
| Content and Marketing        | business | Copy, SEO content, case studies                                        |
| Operations and Training SMEs | business | Service content, course material, domain review                        |

### 21.2 Ownership by area

| Area                               | Accountable                                    | Consulted                      |
| ---------------------------------- | ---------------------------------------------- | ------------------------------ |
| Architecture and ADRs              | Technical Lead                                 | Backend, Frontend              |
| Engineering standards enforcement  | Technical Lead                                 | All engineers                  |
| Schema and migrations              | Backend                                        | Technical Lead                 |
| Repository pattern and tenancy     | Backend                                        | Technical Lead, Security       |
| Authentication and authorisation   | Backend                                        | Technical Lead, Security       |
| Audit logging                      | Backend                                        | Technical Lead                 |
| Public website and SEO             | Frontend                                       | Marketing, Product             |
| Portal interfaces                  | Frontend                                       | UX, Product                    |
| `lib/ui`                           | Frontend                                       | All engineers                  |
| Accessibility                      | Frontend                                       | QA, UX                         |
| Prerendering pipeline              | Frontend                                       | DevOps                         |
| Test strategy and gates            | QA                                             | Technical Lead                 |
| Environments, CI/CD, observability | DevOps                                         | Technical Lead                 |
| Security review and response       | Technical Lead (until a security owner exists) | External reviewer              |
| Content and approval gates         | Marketing                                      | Operations, Directors, Counsel |
| Course content                     | Training                                       | Accrediting bodies             |
| Support processes                  | Operations                                     | Product                        |
| Technical documentation            | Whoever writes the code                        | Technical Lead                 |
| User documentation                 | Product                                        | Operations, Support            |

**Security has no dedicated owner in the reference team.** This is a real gap, mitigated by external review at M3 and M9 and by the Technical Lead holding the accountability in the interim. It should be named explicitly rather than assumed away, because unowned security work is not done.

### 21.3 AI development assistants

The brief names AI assistants as an audience, and Document 03.5 requires that AI-generated duplication be avoided. Concretely:

**Well suited.** Implementing a slice against an existing template — a new repository following the M3 pattern, a route following an established shape, a form using `lib/ui` primitives, tests following the cross-tenant template, content structures matching a Zod schema, documentation from code.

**Not suited without review by an accountable engineer.** Authentication, authorisation and tenancy code; migrations touching existing data; anything determining a permission boundary; the fieldwork offline and idempotency logic; performance-critical query paths.

**Three rules.**

1. **Every AI-generated change passes the §24 checklist and the §23 Definition of Done, unchanged.** The provenance of code does not alter its obligations.
2. **AI assistants must read `lib/ui` and the existing repository patterns before creating anything.** The single largest AI failure mode in a monorepo is recreating a primitive that already exists — the exact failure that cost 6,479 lines here.
3. **Architecture decisions are not delegated.** An AI assistant implements within Documents 03, 03.5 and 04; it does not amend them. Proposed deviations go to the Technical Lead as ADR proposals.

---

## 22. Estimated Delivery Sequence

Relative weeks, not calendar dates. Two tracks run concurrently, converging at M2 and re-diverging afterwards.

### 22.1 Sequence

| Weeks | Track A — Public & Content                                       | Track B — Platform Foundation                                  | Milestone                        |
| ----- | ---------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| 1–2   | Content model, navigation shell (P1)                             | Schema baseline, migrations, `DATABASE_URL`, deployment wiring | M0                               |
| 3–4   | Prerendering pipeline (P2)                                       | CI gates, storage ADR, `customFetch` fix, removals, seeds      | **M0 done**                      |
| 5–6   | Company, trust, commercial core (P3, P4)                         | Tenancy model, organisations, sessions                         | M1 / M3                          |
| 7–8   | Training surface, knowledge, editorial (P5, P6)                  | Authentication flows, permission catalogue                     | M1 / M3                          |
| 9–10  | Proof, careers, legal, system routes (P7, P8)                    | Authorisation middleware, audit logging                        | **M1 done** / M3                 |
| 11–12 | **Conversion: enquiry, booking, email, analytics (P9)**          | Cross-tenant test template, permission-aware query contract    | **M2 — FIRST PRODUCTION LAUNCH** |
| 13–14 | SEO monitoring, content backfill, iteration                      | MFA, external auth review, minimal user admin                  | **M3 done**                      |
| 15–18 | Client portal shell, dashboard, projects (C1–C3)                 | File storage implementation, project repositories              | M4                               |
| 19–22 | Documents, search, tasks, notifications (C4–C8)                  | Document and search repositories, depth fixes                  | **M4 done**                      |
| 23–26 | **Mobile fieldwork surface first (N3)**, internal shell (N1, N2) | Audit domain, findings, corrective actions                     | M5                               |
| 27–30 | Audits, issuance, inspections, messaging (N4–N10)                | Issuance state machine, immutability, idempotency              | **M5 done**                      |
| 31–34 | LMS shell, course authoring, catalogue (L2–L5)                   | Course model with version pinning, payment integration         | M6                               |
| 35–38 | Lesson delivery, assessment, marking (L6–L8)                     | Video delivery, progress persistence, background jobs          | M6                               |
| 39–42 | Certificates, learner dashboard, client visibility (L9–L12)      | Certificate generation, three-view consistency                 | **M6 done**                      |
| 43–46 | Admin shell, CMS migration, media (A2–A6)                        | Audit log explorer, system operations (A7, A11, A12)           | M7                               |
| 47–50 | CRM, scheduling, approvals, HR (S4–S6, S8)                       | Invoice slice, payments, reconciliation (S7)                   | M7 / M8                          |
| 51–54 | Reporting, marketing, support (S9, S10)                          | Performance tuning, index review                               | **M8 done**                      |
| 55–58 | Accessibility audit remediation                                  | Penetration test, load test, DR rehearsal, retention           | **M9 done**                      |
| 59–60 | Documentation, training, support processes                       | Launch gate verification                                       | **M10 — FULL GA**                |

**Elapsed: approximately 60 weeks.** This is the conservative reading and the one to plan against. The optimistic end of §3.1's range assumes a third stream from week 43 and no content delay in M1; treat any figure below 55 weeks as a stretch rather than a plan.

### 22.2 Where parallelism pays

**Weeks 1–14 are the highest-leverage parallel period.** Track A delivers the public website and first production launch while Track B builds identity and access. Neither blocks the other, and the outcome is a live revenue-generating site by week 12 with the platform foundation complete by week 14. Sequentially the same work reaches production around week 22.

**Weeks 15–30 parallelise front and back within a milestone**, which is more coupled and yields less. The gain is real but smaller, and it depends on API contracts being agreed before the interface is built — which the OpenAPI-first discipline already in CI supports.

**Weeks 43–54 can absorb a third stream** if capacity allows, because M7 and M8 touch largely disjoint domains. This is the only point where adding people late plausibly helps rather than hurts.

### 22.3 What compresses and what does not

**Compressible.** M1 with additional frontend capacity — P3 through P8 are genuinely independent route groups. M7 and M8 with a third stream. Content production, which is business-owned and can start immediately.

**Not compressible.** M3, because it is a coherent set of interdependent decisions where parallel work produces divergent patterns; extra people make it slower. M5's fieldwork surface, which needs iteration against real devices in real conditions and cannot be parallelised into existence. External activities — penetration testing, accreditation, counsel review — which run at their own pace and should be booked early.

**The single largest schedule lever is not engineering capacity but content readiness.** M1's critical path runs through copy, imagery and case studies, all business-owned. Starting content production in week 1 rather than week 5 is worth more than an additional engineer.

---

## 23. Definition of Done

Applies to every slice. Document 03.5 is the source; this restates it as a checklist a reviewer can apply.

### 23.1 Slice-level

**Code.** Follows Document 03.5 conventions. Repository pattern used for all data access, with no query outside a repository. Layer-based backend and feature-based frontend organisation respected. No new UI primitive outside `lib/ui`, and no `components/ui/` directory in any application. TypeScript strict with no new suppressions. Lint and format clean.

**Data access.** Tenant scope derived from the authorisation context, never from a request parameter. Migration reversible in development and expand-and-contract if it touches existing data.

**Authorisation.** Every route authorises server-side against a permission, never a role name. Navigation hiding treated as presentation only.

**Audit.** Every mutating endpoint writes an entry with actor, action, target, timestamp and before-and-after state.

**Tests.** Unit tests for domain logic. Integration tests against real Postgres. **A cross-tenant test for every tenant-scoped repository.** Authorisation tests for every route. End-to-end coverage of the journey the slice enables. All CI gates green.

**API.** OpenAPI updated; generated client in sync (CI already enforces this); error envelope used; request and response validated by shared Zod schemas.

**Accessibility.** Keyboard operable. `axe` clean of critical and serious violations. Focus moves to `<h1>` on route change. Heading hierarchy correct. `aria-current` on current location.

**Performance.** Within budget. No N+1 query introduced. Public routes prerendered where indexable.

**Security.** Inputs validated. No secret in code. Upload paths scanned. Rate limits applied to public writes.

**Documentation.** Technical documentation updated. User-facing changes documented. ADR recorded for any pattern decision.

**Review and deployment.** Reviewed by an engineer other than the author; architecture review for pattern changes. Deployed to staging and verified. Monitoring covers the new surface. Feature-flagged if incomplete. Rollback path understood.

### 23.2 Milestone-level

Every slice done; §4 acceptance criteria demonstrated to the product owner; §24 checklist signed; full regression green; no critical or high defects open; documentation current; deployed to staging and — from M2 — to production.

### 23.3 The clause most likely to be skipped

**The cross-tenant test.** It is invisible in the interface, adds no feature, and is the only thing standing between the platform and its most serious failure mode. It is listed separately from "integration tests" for that reason, and §24 checks it independently.

---

## 24. Architecture Validation Checklist

Applied at the **start** of each phase to confirm the plan conforms, and at the **end** to confirm the implementation did. Signed by the Technical Lead.

| #   | Check                                                                                               | How verified                  |
| --- | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | Architecture respected — Express single backend, React + Vite frontend, no new framework or runtime | Review                        |
| 2   | Engineering standards followed per Document 03.5                                                    | Lint, review                  |
| 3   | **Repository pattern enforced** — no data access outside a repository                               | Automated check plus review   |
| 4   | Layer-based backend, feature-based frontend                                                         | Review                        |
| 5   | **Tenant scope derived from authorisation context**, never a request parameter                      | Review plus cross-tenant test |
| 6   | **Permission checks server-side on every route**, resolving permissions not roles                   | Automated authorisation suite |
| 7   | **Audit logging active** on every mutating endpoint                                                 | Automated test                |
| 8   | **Search authorisation respected** — filtering at query time, leaking neither records nor counts    | Security test                 |
| 9   | **No duplicated components** — `lib/ui` sole source, no `components/ui/`                            | Automated check               |
| 10  | Information architecture respected — routes match Document 04, depth ceiling honoured               | Review                        |
| 11  | URL conventions and stability tiers honoured; redirects recorded for any public change              | Review                        |
| 12  | API additive or versioned; OpenAPI and client in sync                                               | CI                            |
| 13  | Migrations reversible in development; expand-and-contract where data exists                         | Review                        |
| 14  | Performance within budget; no N+1 introduced                                                        | Automated plus review         |
| 15  | Accessibility conformance maintained                                                                | `axe` plus manual             |
| 16  | Secrets absent from code; scans clean                                                               | CI                            |
| 17  | Feature flags used for incomplete work rather than long-lived branches                              | Review                        |
| 18  | Documentation and ADRs current                                                                      | Review                        |

### 24.1 Checks 3, 5, 6, 7, 8 and 9 are the load-bearing ones

They correspond exactly to the approved decisions this roadmap must respect, and each guards a failure that is expensive or impossible to correct later: data access bypassing the repository layer defeats tenancy; role-name checks calcify into conditionals that resist the permission model; missing audit entries cannot be reconstructed retrospectively; post-filtered search leaks; and duplicated components fork and drift, as they already did once here.

The remaining checks guard quality. These six guard correctness, and a phase should not proceed with any of them unverified.

---

## 25. Executive Recommendations

### 25.1 Top priorities

1. **Wire deployment and author the first migrations.** The repository cannot currently be deployed and has no schema. Everything else waits on these two.
2. **Stop losing enquiries.** Every contact submission is discarded. This is the only item on this list that is actively costing money today.
3. **Get identity and access right rather than fast.** M3 is the critical path, and it is the one milestone where spending extra time is cheaper than saving it.
4. **Treat prerendering as a named deliverable with an owner.** The Vite decision transferred an obligation onto the team that a framework would otherwise have discharged.
5. **Protect the content production timeline.** M1's critical path runs through business-owned content, and it is the highest-likelihood schedule risk in the programme.

### 25.2 Immediate next actions

| #   | Action                                                                         | Owner                  | Blocks                              |
| --- | ------------------------------------------------------------------------------ | ---------------------- | ----------------------------------- |
| 1   | Add `build` and `run` commands to `.replit`; establish edge path routing       | DevOps                 | All deployment                      |
| 2   | Author the M0 schema baseline: organisations, users, enquiries                 | Backend                | All persistence                     |
| 3   | Add `DATABASE_URL` to the env schema; wire connection and real readiness probe | Backend                | All persistence                     |
| 4   | Add Playwright, `axe`, and dependency/secret scanning to CI                    | QA / DevOps            | Quality gates                       |
| 5   | Record the file-storage ADR                                                    | Technical Lead         | M4 documents                        |
| 6   | **Select the email provider**                                                  | DevOps / Product       | **First launch**                    |
| 7   | Define the typed content model and Zod schemas                                 | Frontend / Product     | All of M1                           |
| 8   | **Begin content production**                                                   | Marketing / Operations | M1 completion                       |
| 9   | Delete `mockup-sandbox` and the duplicate `middlewares/` directory             | Any engineer           | Nothing — do it while it is trivial |
| 10  | Re-baseline §22 against the actual team shape                                  | Engineering Manager    | Any date commitment                 |

Items 1 through 5 are M0 engineering. Items 6 through 8 are procurement and content that must start now because they are slower than the code that depends on them.

### 25.3 Critical dependencies

The chain that determines the programme's shape: **deployment and schema (M0) → identity, tenancy, RBAC and audit (M3) → repository and search patterns → every portal.** Off this chain, the public website and lead capture run independently and reach production first.

The external dependency most likely to cause avoidable delay is the **email provider**, because it is small, easy to defer, and gates the first production launch.

### 25.4 Biggest delivery risks

1. **Tenant isolation flaw reaching production** — critical impact, mitigated by external review as an M3 exit criterion rather than an M9 activity.
2. **Content readiness delaying M1** — highest likelihood, least within engineering's control.
3. **Prerendering underestimated** — easy to mistake for routine frontend work; it is not.
4. **Offline fieldwork capture** — least similar to anything the team has built.
5. **Scope growth against a complete 250-route IA** — only binding exit criteria prevent it.

### 25.5 Recommended implementation order

```
M0  Foundation            -> deployable, schema, CI gates
M1  Public Website        -> 56 prerendered routes, WCAG AA        [parallel with M3]
M2  Lead Generation       -> FIRST PRODUCTION LAUNCH
M3  Identity & Access     -> auth, tenancy, RBAC, audit            [parallel with M1]
M4  Client Portal Core    -> projects, documents, search, storage
M5  Consultancy Delivery  -> fieldwork first, then audits and issuance
M6  Training Platform     -> version pinning from day one
M7  Administration & CMS  -> content source swap, audit log explorer
M8  Staff Operations      -> CRM, scheduling, approvals, invoicing
M9  Enterprise Hardening  -> penetration, load, DR, accessibility
M10 Full Platform GA      -> gates verified, documentation, support
```

### 25.6 Recommended first production milestone

**Milestone 2 — Public Website plus Lead Generation, at approximately week 12.**

The reasoning, stated plainly because this is the recommendation most likely to be questioned:

It is **independently valuable.** A site that ranks and captures enquiries generates revenue with no portal, no authentication, and no LMS.

It **stops an active loss.** Every enquiry is currently discarded. No later milestone recovers those leads.

It has **no dependency on the critical path.** M1 and M2 need the database and deployment from M0; they need nothing from M3 onward.

It **de-risks everything after it.** A live production system with real monitoring, real backups and a rehearsed rollback converts deployment readiness from a claim into an observed fact. The first production deployment is the riskiest one a team ever does, and doing it with a static marketing site is far safer than doing it with five applications, payment processing and tenant-isolated data at once.

Within M2, the **enquiry slice is the right first vertical slice** in the whole programme. It is small, it is the highest-value item, and it exercises every architectural layer end to end — form, shared validation, API route, service, repository, database, email, audit log, internal view. It proves the architecture works together before anything large is built on it, which is exactly what a first slice is for.

---

_End of document._
