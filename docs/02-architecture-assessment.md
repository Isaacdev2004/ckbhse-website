# Technical Assessment Report — Architecture Alignment against Document 02 (BRS)

**Project:** CKBHSE Enterprise Digital Platform
**Report version:** 1.0
**Scope:** Review of the existing codebase against the Business Requirements Specification. No feature work performed.
**Repository root:** `CKBHSE-Limited-Vision/` (note: nested one level below the opened workspace folder)

> **Status:** Phase 0 of §7 is complete and the architectural decisions in §8 have been taken. See §9.

---

## 1. Executive verdict

The repository is a **Replit-generated pnpm monorepo containing a well-built but entirely static public marketing website, and effectively nothing else**. Roughly 8% of the BRS scope exists in code.

Of the six ecosystems defined in BRS §4, one is partially delivered:

| BRS ecosystem | State |
| --- | --- |
| Public Website | Partially built — 8 substantive pages, 3 legal stubs, no backend |
| Client Portal | Not started |
| Learning Management System | Not started |
| Staff Portal | Not started |
| Administration Portal | Not started |
| Future Digital Products | Not started (correctly deferred) |

The critical finding is not the missing volume — that is expected at this stage — but that **none of the foundational capabilities the BRS depends on exist yet**: there is no authentication, no authorization, no database schema, no persistence, no domain modules, and no API beyond a health check. Every requirement in BRS §7 (RBAC), §9 (non-functional), and §10 (business rules) is currently unaddressed at the architecture level.

The good news: because so little has been committed to, the cost of correcting course now is low. The recommendations in §6 should be executed **before** Document 03's sitemap is implemented, because route sprawl will multiply the cost of every structural decision made from here.

---

## 2. Inventory of what actually exists

### 2.1 Workspace

pnpm workspace (`artifacts/*`, `lib/*`, `lib/integrations/*`, `scripts`), Node 24, TypeScript 5.9, shared dependency `catalog:`.

```
CKBHSE-Limited-Vision/
├── artifacts/
│   ├── api-server/        Express 5 — one endpoint (GET /api/healthz)
│   ├── ckbhse-website/    Vite + React 19 SPA — the only real product code
│   └── mockup-sandbox/    Component preview harness, empty
├── lib/
│   ├── api-spec/          OpenAPI 3.1 spec — one path, Orval codegen config
│   ├── api-client-react/  Generated React Query client + fetch wrapper
│   ├── api-zod/           Generated Zod schemas
│   └── db/                Drizzle + pg bootstrap — schema file is EMPTY
├── scripts/               hello.ts placeholder
├── attached_assets/       Document 01 (as a .txt paste)
└── replit.md              Template, unpopulated
```

### 2.2 Public website (`artifacts/ckbhse-website`)

Genuinely good work, and better than a scaffold. Stack: React 19, Vite 7, wouter, Tailwind v4, 55 shadcn/ui primitives, Framer Motion, React Hook Form + Zod (installed, unused).

Routes defined in `artifacts/ckbhse-website/src/App.tsx`:

`/`, `/services`, `/industries`, `/training`, `/knowledge`, `/case-studies`, `/careers`, `/contact`, `/privacy-policy`, `/terms-conditions`, `/cookie-policy`, plus a 404 fallback.

Branding is established and consistent: electric cyan primary (`hsl(189 94% 43%)`), deep navy secondary (`hsl(222 47% 11%)`), Outfit for display, DM Sans for body, full light/dark token sets, four hero images in `src/assets/`.

**But every page is a static array of hardcoded content.** There is no data layer:

- `QueryClientProvider` is mounted in `App.tsx` but no `useQuery` or `useMutation` is called anywhere in `src/`.
- `@workspace/api-client-react` is a declared dependency and is never imported by application code.
- The contact form in `artifacts/ckbhse-website/src/pages/contact.tsx` calls `setSubmitted(true)` and discards the user's input entirely. Every enquiry submitted today is silently lost.

### 2.3 API and data layer

`artifacts/api-server/src/routes/health.ts` is the entire API surface. `lib/db/src/schema/index.ts` contains only commented-out example code and `export {}`. `DATABASE_URL` is required at import time but no schema, no migration, and no query exists.

---

## 3. Folder structure validated against the planned modules

The monorepo shape is sound and worth keeping. What is missing is any expression of the BRS's **domain boundaries**. Today there is one deployable frontend and one monolithic Express app with a flat `routes/` directory — a structure that will not survive five portals and eleven roles.

Assessment of the current structure against BRS §4:

| Requirement | Current structure | Verdict |
| --- | --- | --- |
| Six independently evolving ecosystems | One SPA, one flat Express app | Inadequate |
| Shared design system across portals | `ui/` primitives duplicated in two artifacts, no shared package | Will diverge |
| Role-scoped access boundaries | No concept of a user | Absent |
| Modular domain logic (consultancy, training, compliance, finance…) | No domain layer at all; no service layer between routes and DB | Absent |
| Versioned schema evolution | `lib/db` exposes only `push` and `push-force` — no migration history | Inadequate for §10 |

The `ui/` duplication is worth calling out specifically: 55 shadcn primitives exist twice, in `ckbhse-website` and `mockup-sandbox`, and will need to exist a third, fourth, and fifth time as portals are added. This must become `lib/ui` before the second portal is built.

---

## 4. Gap analysis against the BRS

### 4.1 Public website (BRS §8)

| BRS requirement | Status |
| --- | --- |
| Responsive navigation | Done |
| Service catalogue | Static content only, not a catalogue |
| Industry solutions | Static content only |
| Case studies | Static content only |
| Blog | **Missing** — `/knowledge` exists but there is no article model, no post routes, no CMS |
| Resources (downloadable compliance documents) | **Missing** |
| Contact forms | UI only — submits nowhere |
| Consultation booking | **Missing** — the CTA links to the contact form; there is no availability, scheduling, or reference number |
| Careers | Static listings; no application submission (BRS requires applicants track status) |
| Testimonials | **Missing** as a page |
| FAQ | **Missing** |
| Newsletter subscription | **Missing** |
| Global search | **Missing** |
| About | **Missing** — required by BRS §4, not present in routes or navigation |

Note also that the three legal pages are one-line "under construction" stubs, which is a GDPR exposure the moment the site collects a single form submission.

### 4.2 Cross-cutting foundations — all absent

- **Authentication.** No login, no registration, no session or token handling, no password reset. BRS §4 lists "Client authentication entry points" in Phase 1 scope (Document 01 §13); none exist.
- **Authorization.** All eleven roles in BRS §6 and every permission in §7 are unimplemented. There is no user, role, or permission table.
- **Tenant isolation.** BRS §10 mandates that "every client has isolated access to their own data only." There is no organisation/account concept to scope against, which is the single most consequential thing to get right before any portal code is written.
- **Audit logging.** BRS §10 mandates an immutable audit log. Not present.
- **Payments.** BRS §10 gates premium content on confirmed payment. No payment integration.
- **Content versioning and rollback.** BRS §10 requires versioned public content. Not possible against hardcoded arrays.

### 4.3 Non-functional requirements (BRS §9)

| Requirement | Assessment |
| --- | --- |
| WCAG 2.2 AA | Partial by inheritance — Radix primitives are accessible, but there is no axe/Lighthouse gate, no skip-link, and animation does not respect `prefers-reduced-motion` |
| SEO optimization | **At risk.** This is a client-rendered SPA with a single static `<title>` and description in `index.html` — still the Replit placeholder text ("built on Replit. Update this description…"). Every route shares identical metadata. There is no sitemap.xml, no canonical URLs, no structured data. This directly conflicts with Document 01's "organic search traffic" and "keyword rankings" KPIs |
| Page load < 2s / Lighthouse ≥ 95 | **At risk, now measured.** A production build emits a single **576.51 kB** JS chunk (179.51 kB gzip) plus a 129.70 kB CSS file — all 11 pages and 55 primitives in one bundle, with no route-level code splitting. Google Fonts are loaded via a blocking `<link>` |
| Enterprise-grade security | **Not met.** `app.use(cors())` in `artifacts/api-server/src/app.ts` allows every origin. No `helmet`, no rate limiting, no CSRF protection, no body size limits |
| GDPR-compliant data handling | Not met — no consent mechanism, no cookie banner, legal pages are stubs |
| Audit logging | Not met |
| Automated backups | Not addressed |
| Horizontal scalability | Structurally fine (stateless Express, autoscale target), untested |
| Modular architecture | Not met — see §3 |
| High availability | Not addressed; no health/readiness distinction, no graceful shutdown |

No test framework, no linter (only Prettier), and no CI pipeline exist anywhere in the repository.

---

## 5. Blocking risks

Ordered by urgency. The first four should be resolved this week, before any Document 03 work.

**R1 — The entire website is untracked in git.** `git status` reports `?? artifacts/ckbhse-website/` against a single "Initial commit". Several hundred lines of hand-built pages, the brand token system, and four hero images exist only in the working directory. One bad `git clean` loses all of it.

**R2 — Stack divergence from Document 01.** Document 01 §"Replit AI Instructions" specifies **Next.js App Router + Prisma**. What was built is **Vite SPA + wouter + Express + Drizzle**. This is not a cosmetic difference: it is the reason the SEO and metadata gaps in §4.3 exist, and it determines whether server rendering is available for the marketing and knowledge-hub pages the business is counting on for organic traffic. This needs an explicit architectural decision now — see §8.

**R3 — Dependencies are not installed.** There is no `node_modules`. Nothing in this repository has been built, typechecked, or run in this environment, so no claim about its correctness has been verified locally.

**R4 — Replit coupling blocks local development.** `artifacts/ckbhse-website/vite.config.ts` throws unless both `PORT` and `BASE_PATH` are set; the same is true of the API server's `PORT`. Three `@replit/*` Vite plugins are wired in, and cross-artifact routing is handled by Replit's `.replit-artifact/artifact.toml` base-path mechanism rather than by anything in the codebase. Moving to Cursor as the primary environment requires local `.env` defaults and a real dev proxy or unified server.

**R5 — Schema evolution has no history.** `lib/db` offers `drizzle-kit push` only. `push` mutates a database to match the current schema with no recorded migration, which is acceptable for prototyping and unacceptable for a platform whose BRS requires audit trails and rollback. Versioned `generate`/`migrate` must be in place before the first table is created.

**R6 — Design system will fork.** 55 duplicated UI primitives across two artifacts, with a third portal imminent.

**R7 — Nested repository root.** The workspace is opened at `Downloads/CKBHSE-Limited-Vision/` but the git repository, `package.json`, and all source live one directory deeper. This will misdirect tooling, rules files, and CI paths.

---

## 6. Recommended architecture

### 6.1 Domain-modular boundaries

Replace the flat `artifacts/api-server/src/routes/` directory with domain modules, each owning its own routes, service layer, schema slice, and permissions. Every module maps to a BRS business area:

```
lib/
├── ui/                     Shared design system (extracted from ckbhse-website)
├── db/
│   └── src/schema/         One file per table, per the existing convention
├── auth/                   Sessions, password hashing, token issuance
├── authz/                  Permission catalogue, role→permission map, guards
├── audit/                  Append-only audit log writer
└── modules/
    ├── identity/           Users, organisations, roles, invitations
    ├── crm/                Enquiries, leads, consultation bookings
    ├── consultancy/        Projects, assignments, milestones, reports
    ├── training/           Courses, lessons, enrolments, assessments, certificates
    ├── compliance/         Documents, resources, compliance calendar
    ├── content/            Pages, blog posts, case studies, testimonials, FAQ (versioned)
    ├── billing/            Invoices, payments, refunds
    ├── careers/            Vacancies, applications
    └── messaging/          Threads, notifications
```

Rules to enforce from day one: modules may depend on `lib/*` infrastructure but **never** on each other's internals — cross-module interaction goes through a published service interface. Routes contain no business logic and no direct database access.

### 6.2 Authentication

Recommend session-based auth with HTTP-only, `Secure`, `SameSite=Lax` cookies over a JWT-in-localStorage approach: the platform is browser-first, needs immediate revocation for staff accounts, and must satisfy an audit requirement. Note that `lib/api-client-react/src/custom-fetch.ts` already exposes `setAuthTokenGetter`, which presumes bearer tokens — this should be revisited rather than inherited by default.

Required from the outset: Argon2id password hashing, email verification, password reset with single-use expiring tokens, TOTP MFA for every internal role (BRS §7 grants Admin and Super Admin destructive powers), server-side session revocation, and rate limiting on all credential endpoints.

### 6.3 Authorization — permissions, not role checks

Do not scatter `if (user.role === 'admin')` through the codebase. BRS §6 defines eleven roles and §10 permits users to hold several simultaneously, so the model must be:

- `users` — identity only, no role column
- `organisations` — the client tenant; the boundary for BRS §10 data isolation
- `roles` — the eleven named roles
- `user_roles` — many-to-many, satisfying "users may hold multiple roles"; records the approving Super Admin
- `permissions` — fine-grained verbs (`project.read`, `report.upload`, `invoice.issue`, `course.publish`, `user.manage`)
- `role_permissions` — the mapping that encodes BRS §7

Authorization is then a single guard resolving a permission plus a resource scope. Critically, **tenant isolation must be enforced in the data-access layer, not in route handlers** — a repository that cannot be called without an organisation scope makes the BRS §10 isolation rule structurally true rather than a thing every future developer must remember.

Every state-changing action writes to an append-only `audit_log` (actor, role used, action, resource, before/after, IP, timestamp) with no `UPDATE` or `DELETE` grant on that table.

### 6.4 Frontend composition

Split the SPA into separately routed surfaces sharing `lib/ui` and a shared auth context: the public marketing site, the client portal, the LMS, the staff portal, and the admin portal. Introduce route-level code splitting immediately, and per-route metadata regardless of which decision is taken on R2.

---

## 7. Recommended refactor sequence

Nothing here is feature work; all of it is foundation that Documents 03 onward depend on.

**Phase 0 — stabilise (this week)**
1. Commit `artifacts/ckbhse-website/` and `attached_assets/`; add a `.env.example` and local defaults so `pnpm dev` works on Windows without Replit variables.
2. Install dependencies and get `pnpm typecheck` and `pnpm build` green. Establish the baseline.
3. Resolve the nested-directory problem (R7).
4. Decide R2 and R5 (see §8) and record both in `replit.md` under "Architecture decisions."

**Phase 1 — foundations**
5. Extract `lib/ui` from `ckbhse-website`; delete the duplicated primitives in `mockup-sandbox`.
6. Add ESLint, Vitest, Playwright, and a CI workflow running typecheck, lint, test, and a Lighthouse/axe budget.
7. Harden the API: `helmet`, an explicit CORS allowlist, rate limiting, request body limits, error normalisation, readiness vs liveness endpoints, graceful shutdown.
8. Switch `lib/db` to versioned migrations.

**Phase 2 — identity and access**
9. Implement `identity`, `auth`, `authz`, and `audit` per §6.2–6.3, including the seeded role/permission matrix from BRS §7 and MFA for internal roles.
10. Add per-route metadata, `sitemap.xml`, `robots.txt` rules, canonical URLs, and JSON-LD.

**Phase 3 — make the public site real**
11. Move page content out of hardcoded arrays into the `content` module with versioning and rollback (BRS §10).
12. Wire the contact form and consultation booking to the `crm` module, with a unique reference number per enquiry (BRS §10), server-side validation via the shared Zod schemas, spam protection, and confirmation email.
13. Build the missing public routes identified in §4.1 (About, Blog, Resources, FAQ, Testimonials, Booking) and replace the three legal stubs with reviewed content.

Only then should Document 03's full sitemap be implemented against a foundation that can carry it.

---

## 8. Decisions taken by the Architect

Recorded in `replit.md` under "Architecture decisions."

| # | Decision | Outcome |
| --- | --- | --- |
| 1 | Framework | **Keep the Vite SPA.** Meet the SEO requirement with prerendering plus per-route metadata rather than migrating to Next.js. Document 01 is amended. |
| 2 | ORM | **Keep Drizzle.** Document 01's Prisma instruction is amended. |
| 3 | Tenancy | **Single organisation per client user.** Organisation scoping is the data-isolation boundary. |
| 4 | Identity | **Build authentication in-house** per §6.2, with MFA for internal roles. |
| 5 | Hosting | Deferred. |

Because decision 1 keeps a client-rendered SPA, the SEO obligations in BRS §9 now rest entirely on explicit engineering work rather than on framework defaults. Phase 2 step 10 is therefore load-bearing, not optional: per-route metadata, prerendered HTML for every public route, `sitemap.xml`, canonical URLs, and JSON-LD. This should be treated as a launch gate.

---

## 9. Phase 0 outcome

Completed:

1. **R1 resolved.** The website, hero assets, and Document 01 are committed (`6674f57`). The working tree is clean.
2. **R3 resolved.** Dependencies install, and `pnpm run typecheck` and `pnpm run build` both pass across all nine workspace projects. This is the first verified baseline.
3. **R4 resolved.** Local development now works on Windows without Replit's environment:
   - `PORT` and `BASE_PATH` fall back to defaults instead of throwing, in both Vite configs and the API server.
   - The API server's `dev` script no longer uses the bash-only `export` syntax, which could never have run on Windows. `NODE_ENV` was redundant there — `logger.ts` already defaults to pretty output.
   - The API server loads `../../.env` via `--env-file-if-exists`, so a missing file is not fatal.
   - The Vite dev server proxies `/api` to the API server, keeping the browser on one origin — which also means cookies will be first-party once auth lands.
   - Default ports are 5180 (website), 5181 (sandbox) and 5000 (API), avoiding Vite's contended 5173 default under `strictPort`.
   - **A latent blocker was found and fixed:** `pnpm-workspace.yaml` pruned *all* win32 native binaries ("replit uses linux-x64 only"), which would have made `rollup`, `esbuild`, `lightningcss`, and `@tailwindcss/oxide` unloadable on any Windows machine. The win32-x64 entries are now retained; the rest remain pruned.
   - Verified end to end: `GET http://localhost:5180/api/healthz` returns `{"status":"ok"}` proxied to Express. This is the first time the two artifacts have communicated.
4. **Line-ending normalisation added.** `.gitattributes` pins the repository to LF. Without it, every file touched on Windows appeared as a full rewrite. `.env` is now git-ignored and `.env.example` is the tracked template.
5. **`replit.md` populated** with the run book, repo map, the five decisions, and the known gotchas.

Outstanding:

- **R7 requires an action outside the codebase.** The git repository and all source live at `Downloads/CKBHSE-Limited-Vision/CKBHSE-Limited-Vision/`, one level below the opened workspace folder. Moving ~40,000 installed files and pnpm's link farm is not worth the risk; instead the workspace should simply be reopened at the inner folder so that tooling, rules, and CI paths align with the repository root.
- **R5 and R6 are Phase 1 work** and are not yet started.
- No linting, tests, or CI exist yet (Phase 1 steps 6–8).

---

*End of report.*
