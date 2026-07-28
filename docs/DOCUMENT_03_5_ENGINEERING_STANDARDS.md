# Document 03.5 — Enterprise Engineering Standards & Development Conventions

**Project:** CKBHSE Enterprise Digital Platform
**Document:** 03.5 — Engineering Handbook
**Version:** 1.0
**Status:** Authoritative. Supersedes individual preference.
**Applies to:** Every engineer and every AI assistant contributing to this repository.
**Grounded in:** Document 01 (Product Vision), Document 02 (BRS), Document 03 (Architecture Review, `d0f34cf`), and the code as it stands at that commit.

**How to read this document.** Rules use **MUST**, **MUST NOT**, **SHOULD**, and **MAY** in the RFC 2119 sense. A **MUST** is enforced by tooling wherever that is possible, and by code review where it is not. A **SHOULD** may be departed from with a stated reason in the pull request. Where a rule already exists in the codebase, the file that establishes it is cited, because a standard nobody can find an example of is a standard nobody follows.

---

## 1. Executive Summary

### Why this document exists

This platform will be built over several years, by engineers who have not met each other, with substantial help from AI assistants that have no memory between sessions. Under those conditions the dominant cost is not writing code — it is **reading it**. Every hour spent deducing whether a given function may safely query the database, or where validation is supposed to happen, or which of three similar utilities is the current one, is an hour that produced nothing.

Standards exist to make that deduction unnecessary. When conventions are predictable, a reader can concentrate on whether the logic is _correct_ rather than on where the logic _lives_.

### Why consistency beats individual style

Two competing considerations arise whenever a convention is proposed: which choice is better in isolation, and which choice is already in use. **In this repository the second consideration wins**, and it is worth being explicit about why, because it is counter-intuitive to good engineers.

An inconsistent codebase imposes a cost on every future reader, forever. A slightly suboptimal but uniform convention imposes a one-time cost on the engineer who would have preferred otherwise. Single quotes are not better than double quotes; `kebab-case` filenames are not better than `PascalCase` ones. What is genuinely better is that a reader never has to wonder, and that a tool can check mechanically. This is why `.prettierrc.json` exists and why formatting is not discussed in code review: the argument was settled once, and the machine now enforces the outcome.

The corollary matters more than the rule: **when this document and the codebase disagree, raise it rather than silently following either one.** A standard that has quietly diverged from practice is worse than no standard, because it makes the document untrustworthy and every other rule in it suspect.

### What these standards optimise for, in priority order

When two of these conflict, the earlier one wins:

1. **Security and data isolation.** BRS §10 requires that every client accesses only their own data and that sensitive actions are auditable. These are legal obligations, not quality attributes. No amount of elegance justifies weakening them.
2. **Correctness that the compiler can prove.** A rule the type system enforces cannot be forgotten under deadline pressure. This is the reasoning behind Document 03's layered-package recommendation and behind the TypeScript settings in §8.
3. **Readability and consistency.** Optimising for the reader, who outnumbers the writer by a large factor over a project's lifetime.
4. **Testability.** Code that is hard to test is usually code with tangled responsibilities. Difficulty writing a test is diagnostic information, not an excuse.
5. **Performance.** Real, measured performance, treated as a product feature per BRS §9 — not speculative micro-optimisation.

### What is already true

This is not a greenfield handbook. The repository already enforces a good deal of it: Prettier and ESLint pass with zero errors, ten TypeScript projects typecheck, nine tests run, and CI verifies formatting, linting, types, tests, build, and API-contract drift on every push. Several conventions in this document are simply the codification of patterns already present in `artifacts/api-server/src`. Where a section describes something that does not yet exist, it says so.

---

## 2. Project Architecture Principles

Nine principles. Each states the rule, then the specific consequence for this codebase — a principle with no consequence is decoration.

### 2.1 Modular architecture with compiler-enforced boundaries

Modules **MUST** be separated by mechanisms the compiler understands, not by directory names. This repository uses pnpm workspace packages with TypeScript project references, so an illegal dependency is a build failure rather than a review comment.

_Consequence:_ when Document 03's `lib/data` layer is introduced, `artifacts/api-server` **MUST NOT** list it as a dependency. A route handler then physically cannot write an unscoped database query, because it has no database handle available to it. This is the difference between a rule and a guarantee.

### 2.2 Separation of concerns by layer

Four server-side layers, with a strictly one-directional dependency graph:

```
domain    → pure business rules; no I/O, no framework, no database
data      → schema and repositories; the ONLY layer that may touch Drizzle
services  → orchestration, transactions, events; consumes domain + data
transport → Express routers; HTTP mapping only, no business rules
```

_Consequence:_ if a rule needs to be tested, it belongs in `domain`, where it can be tested without a database, a server, or a mock.

### 2.3 Single responsibility, judged by reasons to change

A module **SHOULD** have one reason to change. The useful test is not size but _audience_: if a change requested by Finance and a change requested by Marketing would both edit the same file, that file has two responsibilities.

### 2.4 Composition over inheritance

Class inheritance **MUST NOT** be used to share behaviour between domain concepts. Compose functions and objects instead.

_Consequence:_ `ApiError` (`artifacts/api-server/src/lib/errors.ts`) extends `Error` because the language requires it for `throw` semantics and stack capture. That is the category of exception: interoperating with a platform primitive. It is not a licence for a `BaseService` or an `AbstractRepository`.

### 2.5 Domain-first thinking

Names in code **MUST** be the names the business uses. Document 03 §"Domain Model" defines thirty-two domains and Document 02 defines the vocabulary; both are binding. A "finding" is a finding, not a `ReportItem`.

_Consequence:_ when the business distinguishes two concepts, the code does too. Document 03 keeps `Organization` (an identity boundary) separate from `Client` (a commercial relationship) for exactly this reason, and merging them to save a table would be a regression.

### 2.6 API-first, contract-first

`lib/api-spec/openapi.yaml` is the source of truth. The contract is written first; the typed client and the Zod validators are generated from it; CI fails if generated output and specification disagree.

_Consequence:_ an endpoint **MUST NOT** be implemented before its specification exists. This is not process for its own sake — with six front ends planned, the specification is the only artifact all of them share.

### 2.7 Security-first

Security is a property of the design, not a review stage. Authorisation, tenant scoping, and audit logging **MUST** be structural, as set out in §3 and §10.

_Consequence:_ the correct question during design is never "where do we check permissions?" but "how do we make an unchecked path impossible to write?"

### 2.8 Accessibility by default

BRS §9 requires WCAG 2.2 AA. Accessibility **MUST** be part of the definition of done for every interface, not a remediation project. Detail in §16.

### 2.9 Performance as a feature

BRS §9 requires sub-two-second loads and mobile-first design. Performance budgets **SHOULD** be enforced in CI so that regressions fail a pull request rather than surfacing in production. Detail in §15.

---

## 3. Repository Pattern Standards

> **Status: not yet implemented.** `lib/db` currently exports a live `db` handle and re-exports the entire schema, and no repository layer exists. This section defines the standard that Document 03 recommendation D1 will establish. It is written now so the first repository is written correctly rather than being retrofitted.

### 3.1 The non-negotiable rules

1. **Database access outside `lib/data` is forbidden.** No Drizzle import, no SQL, no `db` handle in services, controllers, routers, or front-end code.
2. **Services MUST NOT import Drizzle.** A service that imports a query builder has become a repository with a misleading name.
3. **Every repository MUST receive an authorization context at construction.** Not per method — per instance. A repository that can be constructed without one is a repository that can be used without one.
4. **Tenant scoping MUST be applied by the repository, never by the caller.** A caller passing `organizationId` as an ordinary argument is a caller who can pass the wrong one.
5. **Audit entries MUST be written by the repository, in the same transaction as the change.**
6. **Repositories MUST return domain types, not Drizzle row types.** Leaking row types couples every consumer to the schema and makes a column rename a platform-wide change.
7. **One repository per aggregate root**, not per table. Document 03 §"Database Readiness" lists the aggregate roots; `Finding` is reached through `AuditRepository`, not through a `FindingRepository`.

### 3.2 Why scoping belongs here and nowhere else

This is the single most important standard in this document, so the reasoning is worth stating plainly.

BRS §10 requires that "every client has isolated access to their own data only." If that rule is enforced in route handlers, then it is enforced by roughly two hundred future handlers each remembering a predicate. The failure mode is not dramatic: it is one correct-looking query, written on a busy afternoon, that omits one `where` clause. It passes review, because the query looks exactly like a query should look. It passes tests, because the test fixture has one organisation in it. It is discovered by a client seeing another client's audit report.

The structural answer is that the scoping predicate is applied by code the caller does not write and cannot skip. A repository that holds an authorisation context and injects the tenant filter into every query makes the unsafe version _unexpressible_ rather than merely discouraged.

### 3.3 The authorization context

An immutable value describing who is acting, carried from session validation to data access. It **MUST** contain the acting user, their organisation scope, their resolved permission set, and the request correlation ID (the `requestId` already present in the error envelope). It **MUST NOT** be mutable, globally accessible, or reconstructible from ambient state — an ambient context is one that can be forged or defaulted.

An illustration of the shape only, not an implementation:

```
Repository(authContext) → methods that require no tenant argument
```

Every query the repository issues derives its tenant predicate from `authContext`. Callers never supply it, and therefore cannot supply it incorrectly.

### 3.4 Repository responsibilities

**A repository is responsible for:** translating between domain types and persisted rows; applying tenant scoping to every query; applying soft-delete and lifecycle-state filters; emitting audit entries for writes; managing eager loading to avoid N+1 access; and enforcing uniqueness and optimistic-concurrency checks.

**A repository is NOT responsible for:** business rules or invariants (those are `domain`); orchestrating multiple aggregates (that is `services`); opening transactions (services own transaction boundaries — a repository joins one); HTTP concerns of any kind; permission _decisions_ (it enforces the scope implied by the context, while services decide whether an action is permitted at all).

### 3.5 Soft deletes and lifecycle state

Handled per Document 03's three categories, and applied consistently:

- **Never deleted** — `AuditEntry`, issued `Invoice`, issued `Certificate`, submitted `Attempt`. Repositories for these **MUST NOT** expose a delete method at all. Absent capability beats documented prohibition.
- **Lifecycle state** — `User`, `Organization`, `Project`, `Course`. These carry a business-meaningful status, and default queries exclude non-active rows unless a caller explicitly asks for them.
- **Genuinely deletable** — drafts, expired contact requests, retention-expired job applications. Hard delete, and the deletion itself is audited.

Blanket `deleted_at` filtering across all tables is **forbidden**, for the same reason blanket tenant filtering by convention is forbidden: it produces a predicate that every query must remember, and the one that forgets shows deleted data.

### 3.6 Testing repositories

Repositories are tested against a real PostgreSQL instance, not a mock. A mocked query builder tests that the mock was called, which is worthless — the interesting failures are constraint violations, transaction semantics, and whether the tenant predicate was actually applied. **Every repository MUST have a test asserting that data from another organisation is not returned.** That test is the executable form of BRS §10.

---

## 4. Service Layer Standards

> **Status: not yet implemented.** Defined here so the first service is written correctly.

### 4.1 What belongs in a service

**Business logic and orchestration.** Multi-step operations that span aggregates: issuing an audit report, enrolling a learner once payment confirms, generating an invoice from a completed project.

**Permission decisions.** Whether the actor may perform this action on this resource, as distinct from the tenant scoping a repository applies mechanically.

**Transaction boundaries.** A service opens a transaction and passes it to the repositories it coordinates. Repositories **MUST NOT** open their own — otherwise two repository calls in one logical operation cannot be made atomic.

**Validation orchestration.** Structural validation happens at the transport boundary via generated Zod schemas. Services validate _business_ rules: sufficient seats remain, the course prerequisite is met, the invoice is not already paid.

**Event publishing.** Cross-context reactions are recorded to an outbox table within the same transaction, not invoked directly. This keeps the write small and gives asynchronous work a home.

**Idempotency enforcement** for operations that require it — payments, bookings, webhook processing.

### 4.2 What MUST NOT exist in a service

**Drizzle imports, SQL, or a database handle.** See §3.1.

**HTTP concepts.** No `req`, no `res`, no status codes, no header manipulation. A service is called by an HTTP controller today and possibly by a queue worker or a scheduled job tomorrow; anything HTTP-shaped makes that impossible. Services signal failure by throwing typed domain errors, which the transport layer maps to `ApiError` codes.

**Direct third-party SDK calls.** Payment providers, mail, and storage sit behind interfaces owned by the service layer, so they can be substituted in tests and swapped without touching business rules.

**Presentation concerns.** No formatting, no localisation, no currency rendering. Services return data; front ends present it.

**Cross-service reach-through into another context's repositories.** Contexts integrate by identifier and published interface, per Document 03 §"Bounded Contexts". A Finance service that queries consultancy tables directly has dissolved the boundary.

### 4.3 Shape and granularity

Services **SHOULD** be organised by use case rather than as one class per entity with thirty methods. A use case has a name from the business, a single reason to change, and a test that reads like a requirement. Prefer `IssueAuditReport` to `AuditService.update`.

Services **MUST** be constructed with their dependencies passed in — repositories, clocks, ID generators, and provider interfaces. A service that reaches for a module-level singleton cannot be tested at two different points in time, which matters for anything involving expiry, and this platform has certificate expiry, competency expiry, and invoice ageing.

---

## 5. API Standards

The API is the contract shared by all six planned front ends, so its conventions are more consequential than most.

### 5.1 Style: resource-oriented REST, specified first

Endpoints are declared in `lib/api-spec/openapi.yaml` before implementation. The typed React Query client and the Zod validators are generated; CI fails on drift. Hand-written API clients and hand-written request types are **forbidden** — they are precisely the drift the pipeline exists to prevent.

### 5.2 Naming

Paths use plural, kebab-case resource nouns; identifiers are path segments; sub-resources nest one level at most.

```
/api/v1/organizations
/api/v1/organizations/{organizationId}/projects
/api/v1/projects/{projectId}/audits
/api/v1/risk-assessments/{riskAssessmentId}
```

Verbs **MUST NOT** appear in paths; the HTTP method is the verb. Genuine state transitions that are not CRUD are modelled as a sub-resource that is created rather than as a verb: publishing a course creates a publication, issuing an audit report creates an issuance. This keeps the transition auditable and idempotent, which a `POST /courses/{id}/publish` call is not.

`operationId` values are `camelCase` verb-first and globally unique, because Orval derives generated hook names from them.

### 5.3 Versioning

All endpoints are served under `/api/v1`. The version segment **MUST** be introduced before the endpoint count grows — it is free now and a coordinated multi-client migration later.

The version increments only for **breaking** changes: removing or renaming a field, narrowing a type, adding a required request field, or changing an error contract. Additive changes — new optional fields, new endpoints, new enum members in responses — **MUST NOT** bump it. When `v2` arrives, `v1` remains supported for a documented deprecation window.

### 5.4 Error handling

One envelope for every failure, already implemented in `artifacts/api-server/src/middleware/error.ts` and declared in the specification:

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "details": {},
    "requestId": "..."
  }
}
```

`code` is drawn from the closed set in `artifacts/api-server/src/lib/errors.ts`: `bad_request`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `payload_too_large`, `unprocessable_entity`, `rate_limited`, `internal_error`, `service_unavailable`. Clients branch on `code`, never on `message` — messages are for humans and may be reworded or translated at any time.

`ApiError` is the only error type transport code throws. Anything else reaching the middleware is treated as an unexpected fault, logged with its stack, and reported as `internal_error` with its message withheld in production. That behaviour is deliberate and **MUST NOT** be weakened: internal messages leak schema names, file paths, and query fragments.

**Outstanding defect (Document 03, D9):** `ErrorResponse` is defined in the specification but referenced by no operation, so generated clients do not type their error channel. Every operation **MUST** declare a `default` response referencing it. New operations must comply from the outset.

### 5.5 Validation

Requests are validated at the transport boundary using the generated schemas from `lib/api-zod`, so validation and client types cannot diverge. Path and query parameters are validated with the same rigour as bodies — an unvalidated path identifier is the most commonly exploited gap in an otherwise careful API. Failures produce `unprocessable_entity` with field-level `details`.

Responses **SHOULD** also be parsed through the generated schema before sending, which is the convention `artifacts/api-server/src/routes/health.ts` already establishes. This means the server cannot drift from its published contract even if the handler changes: a divergence fails immediately and locally rather than surfacing as a client-side type error in a different repository.

### 5.6 Pagination

Keyset (cursor) pagination is the standard. Offset pagination **MUST NOT** be used for collections that grow or change: its cost increases with depth, and concurrent inserts cause items to be skipped or repeated across pages.

Requests take `cursor` and `limit`; responses return `data` plus `nextCursor`, with `nextCursor` absent on the final page. Every collection endpoint **MUST** enforce a maximum `limit` — an unbounded list endpoint is both a denial-of-service vector and a memory risk. Pagination is added when an endpoint is created, never later, because adding it afterwards is a breaking change for every existing client.

### 5.7 Filtering and sorting

Filters are explicit named query parameters with declared types (`status=active`, `issuedAfter=2026-01-01`). A generic query language **MUST NOT** be exposed — it becomes an unbounded contract that no index can serve and no permission check can reason about.

Sorting uses `sort` with a signed field name (`sort=-createdAt`). Sortable fields are an allowlist per endpoint, declared in the specification, and every one **MUST** be backed by an index that leads with `organization_id`.

### 5.8 Response envelopes

Collections are wrapped, for pagination metadata:

```json
{ "data": [ ... ], "nextCursor": "..." }
```

Single resources are returned **unwrapped**, as the resource itself. Wrapping a single resource in `{ "data": ... }` adds a level of indirection to every client for no information. Errors always use the error envelope of §5.4. These three shapes are the only response shapes in the platform.

### 5.9 Idempotency

Any non-idempotent operation with financial or scheduling consequence **MUST** accept an `Idempotency-Key` header and return the original result on replay: payments, refunds, bookings, enrolment, invoice issuance, and certificate issuance. Keys are stored with their response and scoped to the endpoint and the acting organisation.

Webhook processing **MUST** be idempotent by provider event identifier. Providers redeliver, and they deliver out of order.

### 5.10 HTTP status codes

`200` for successful reads and updates; `201` with a `Location` header for creation; `202` for accepted asynchronous work; `204` for successful deletion with no body. `400` for malformed syntax; `401` for missing or invalid authentication; `403` for authenticated but not permitted; `404` for absent — **and also for present-but-not-permitted-to-know-about**, because a `403` on another organisation's resource confirms it exists; `409` for state conflicts; `413` for oversized payloads; `422` for well-formed requests that fail validation; `429` for rate limiting. `500` for unexpected faults, never deliberately; `503` during shutdown or dependency outage.

The `401`/`403` distinction is precise: `401` means _we do not know who you are_, `403` means _we know, and the answer is no_. Conflating them makes client retry logic incorrect.

---

## 6. Folder Structure Standards

### 6.1 An asymmetry worth explaining

The brief for this document proposes a single flat feature folder containing `api/`, `repository/`, `services/`, `permissions/`, and so on side by side. **That layout is correct for front-end features and MUST NOT be used for server-side layers**, and the reason is important enough to state rather than quietly diverge.

Co-locating a repository with the controller that calls it puts them in the same package, and a package is the unit of import restriction. The moment they share a package, the controller _can_ import the repository directly, and Document 03's central recommendation — that tenant isolation is guaranteed because transport code has no database handle available — evaporates. The barrier that makes BRS §10 structural is exactly the package boundary that co-location removes.

So the platform slices vertically by domain and horizontally by layer, using packages for the horizontal cut and directories for the vertical one. A "feature" is a set of same-named directories across several packages. Front ends need no such barrier — there is no database to protect — so they use co-located feature folders, which is the right shape there.

### 6.2 Server-side: layer as package, domain as directory

```
lib/domain/src/<context>/          # entities, value objects, policies, state machines
lib/data/src/schema/<context>/     # Drizzle tables, one file per table
lib/data/src/repositories/<ctx>/   # one repository per aggregate root
lib/services/src/<context>/        # use cases, transactions, events
lib/auth/src/                      # permission catalogue, guards, context contract
artifacts/api-server/src/modules/<context>/   # router + request/response mapping
```

**Responsibilities:**

| Location                 | Owns                                           | Must not contain                     |
| ------------------------ | ---------------------------------------------- | ------------------------------------ |
| `lib/domain`             | Business rules, invariants, state transitions  | Any I/O, any framework, any Drizzle  |
| `lib/data/schema`        | Table definitions, relations, indexes          | Business rules, query logic          |
| `lib/data/repositories`  | Scoped queries, mapping, audit emission        | Business rules, transaction creation |
| `lib/services`           | Use cases, orchestration, permission decisions | Drizzle, HTTP, third-party SDKs      |
| `lib/auth`               | Permission catalogue, guard primitives         | Domain rules, data access            |
| `api-server/src/modules` | Routing, validation invocation, error mapping  | Business rules, database access      |

The dependency direction is `domain ← data ← services ← transport`, enforced by TypeScript project references. `artifacts/api-server` **MUST NOT** depend on `lib/data`.

### 6.3 Front-end: feature folders

```
artifacts/<app>/src/
  app/                    # composition root: providers, router, layouts
  features/<domain>/
    components/           # feature-specific presentational components
    hooks/                # feature-specific hooks, incl. wrapped API hooks
    pages/                # route entry points, thin
    schemas/              # form schemas (Zod), feature-local
    permissions.ts        # which permissions gate which UI affordances
    types.ts              # types not derived from the API contract
  shared/                 # cross-feature components not general enough for lib/ui
  lib/                    # app-local utilities
```

**Rules.** A feature **MUST NOT** import another feature's internals; shared code moves to `shared/` or, if broadly reusable and presentational, to `lib/ui`. Pages stay thin and are lazy-loaded so each feature becomes its own chunk. Generated API hooks are consumed through a thin feature-owned wrapper rather than called directly from components, which gives one place to attach query keys, cache policy, and error handling.

Design-system primitives live only in `lib/ui`. Creating a `components/ui/` directory in an application is **forbidden** — the two apps previously each carried a copy and had forked onto different shadcn generations, which is why the app-level `components.json` files were deleted.

### 6.4 Applying this

`artifacts/ckbhse-website` predates this structure and **SHOULD NOT** be restructured for its own sake; it is eight static pages that work. The structure applies to the first portal, and to new features in the website where it fits naturally.

### 6.5 Tests

Unit tests sit beside the code they test (`errors.test.ts` next to `errors.ts`), which is the convention `artifacts/api-server/src/app.test.ts` establishes. Integration and end-to-end tests, which span modules, live in a package-level `tests/` directory. Co-location for unit tests is deliberate: a test in a distant mirror directory is a test that gets deleted rather than updated when the code moves.

---

## 7. Naming Conventions

Derived from what the codebase already does. Where the codebase is inconsistent, the majority convention wins and the exceptions are named.

### 7.1 Files and directories

| Kind             | Convention                | Example                                               |
| ---------------- | ------------------------- | ----------------------------------------------------- |
| All source files | `kebab-case`              | `alert-dialog.tsx`, `case-studies.tsx`, `security.ts` |
| Hook files       | `use-` prefix, kebab-case | `use-mobile.tsx`, `use-toast.ts`                      |
| Test files       | `<subject>.test.ts`       | `app.test.ts`                                         |
| Config files     | tool's own expected name  | `vite.config.ts`, `eslint.config.mjs`                 |
| Directories      | `kebab-case`              | `api-server`, `case-studies`                          |

Directories are **plural for collections** of like things (`components`, `routes`, `pages`, `hooks`, `repositories`) and **singular for a layer or concept** (`middleware`, `config`, `domain`, `data`). Note that `middleware` singular is the established convention here; the empty `middlewares/` directory is a scaffold artifact scheduled for removal (Document 03, D17), and **MUST NOT** be used.

**Known exceptions, not to be extended:** `App.tsx` and `main.tsx` follow universal Vite/React entry-point convention. `mockupPreviewPlugin.ts` predates the standard and does not conform; new files **MUST NOT** copy it.

### 7.2 Code identifiers

| Kind                       | Convention                            | Example                                 |
| -------------------------- | ------------------------------------- | --------------------------------------- |
| Variables, functions       | `camelCase`, verb-first for functions | `resolveMethod`, `csvToArray`           |
| Booleans                   | `is`/`has`/`should`/`can` prefix      | `isProduction`, `isShuttingDown`        |
| React components           | `PascalCase` in a kebab-case file     | `SectionReveal` in `section-reveal.tsx` |
| Hooks                      | `use` prefix, `camelCase`             | `useIsMobile`, `useToast`               |
| Types and interfaces       | `PascalCase`, **no `I` prefix**       | `ErrorCode`, `AuthContext`              |
| Type parameters            | `T`-prefixed or a descriptive word    | `TData`, `TError`                       |
| Module constants           | `SCREAMING_SNAKE_CASE`                | `DEFAULT_PORT`, `NO_BODY_STATUS`        |
| Zod schemas (hand-written) | `PascalCase` + `Schema`               | `CreateProjectSchema`                   |
| Generated schemas          | as Orval emits them                   | `HealthCheckResponse`                   |
| Repositories               | `<AggregateRoot>Repository`           | `ProjectRepository`                     |
| Services / use cases       | verb-first business name              | `IssueAuditReport`                      |
| Permissions                | `<context>.<resource>.<action>`       | `consultancy.audit.issue`               |
| Error codes                | `snake_case`, from the closed set     | `unprocessable_entity`                  |

**Enums are discouraged.** Use a union of string literals, as `ErrorCode` does. TypeScript `enum` produces a runtime object, does not narrow as cleanly in exhaustive checks, and interoperates poorly with Zod and generated types. `const` objects with `as const` are acceptable where a runtime value list is genuinely needed.

**Interfaces vs type aliases:** prefer `type`. Use `interface` only for object shapes intended to be implemented by classes or augmented by declaration merging.

### 7.3 Routes, tables, and environment

| Kind                  | Convention                        | Example                                 |
| --------------------- | --------------------------------- | --------------------------------------- |
| API paths             | plural kebab-case nouns           | `/api/v1/risk-assessments`              |
| Path parameters       | `camelCase`                       | `{organizationId}`                      |
| Query parameters      | `camelCase`                       | `?issuedAfter=&limit=`                  |
| Front-end routes      | kebab-case, matching the API noun | `/case-studies`                         |
| Database tables       | `snake_case`, **plural**          | `audit_findings`                        |
| Database columns      | `snake_case`                      | `issued_at`                             |
| Foreign keys          | `<singular_target>_id`            | `organization_id`                       |
| Timestamps            | `<verb>_at`, past tense           | `created_at`, `deleted_at`              |
| Booleans (DB)         | `is_`/`has_` prefix               | `is_published`                          |
| Indexes               | `idx_<table>__<cols>`             | `idx_projects__organization_id__status` |
| Migrations            | Drizzle's generated names         | as emitted                              |
| Environment variables | `SCREAMING_SNAKE_CASE`            | `RATE_LIMIT_WINDOW_MS`                  |

Environment variables **MUST** be declared in the Zod schema at `artifacts/api-server/src/config/env.ts` and documented in `.env.example`. Reading `process.env` anywhere else is **forbidden**: it bypasses validation, produces `string | undefined` where a typed value is available, and hides configuration from the boot-time failure that makes misconfiguration obvious.

Units belong in the name. `RATE_LIMIT_WINDOW_MS` is unambiguous; `RATE_LIMIT_WINDOW` invites a caller to guess seconds.

---

## 8. TypeScript Standards

### 8.1 Current state and the required change

`tsconfig.base.json` does **not** set `strict: true`. It enables flags individually, and the gaps are material: `strictFunctionTypes` is explicitly `false`, `noUnusedLocals` and `noImplicitOverride` are `false`, and `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are absent entirely.

`noUncheckedIndexedAccess` is the significant omission. Without it, array and record access is typed as though it always succeeds, so `rows[0]` is `Row` rather than `Row | undefined`. That is exactly the assumption that produces a runtime `undefined` in code handling invoices and certificates — and it is invisible in review, because the code looks correct.

### 8.2 Required compiler settings

```jsonc
{
  "strict": true, // supersedes the individual flags
  "noUncheckedIndexedAccess": true, // array/record access may be undefined
  "exactOptionalPropertyTypes": true, // `?:` and `| undefined` are different
  "noUnusedLocals": true,
  "noUnusedParameters": true, // with the ^_ escape hatch ESLint uses
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true, // already set — keep
  "noImplicitReturns": true, // already set — keep
  "useUnknownInCatchVariables": true, // already set — keep
  "isolatedModules": true, // already set — keep
  "verbatimModuleSyntax": true, // recommended: aligns with the ESLint
  // consistent-type-imports rule
}
```

`skipLibCheck` stays `true` — it is a pragmatic concession to third-party type quality, not a weakening of our own.

**This change MUST be made before the domain layer is built** (Document 03, D5). Enabling it across thirty domains later is a large mechanical change; enabling it now costs a small, contained number of genuine fixes in existing code. Those fixes are the point, not a side effect.

### 8.3 `any` is forbidden

`any` **MUST NOT** appear in application code. It does not merely weaken one expression — it silently disables checking everywhere the value flows.

Use `unknown` at boundaries where the type is genuinely unknown, then narrow. `useUnknownInCatchVariables` is already enabled, so caught errors arrive as `unknown` and **MUST** be narrowed before use. Third-party types that force `any` are isolated in a single adapter module with a comment stating why.

Type assertions (`as`) are a **SHOULD NOT**, permitted only where narrowing is genuinely impossible, with a comment explaining why the assertion is sound. `as unknown as T` is forbidden outright. `@ts-expect-error` is preferred over `@ts-ignore` when suppression is unavoidable, because it fails when the underlying error disappears — and it **MUST** carry a reason.

### 8.4 `readonly` and immutability

Domain entities, value objects, and the authorization context **MUST** be deeply readonly. `ApiError` already models this: `code`, `status`, and `details` are `readonly`.

Function parameters that are not mutated **SHOULD** be `readonly` arrays or `Readonly<T>`. This is not ceremony: a mutated argument is invisible at the call site and is a recurring source of defects in orchestration code that passes the same object to several collaborators.

### 8.5 Discriminated unions and exhaustive switches

Model states as discriminated unions rather than as objects with optional fields and implied combinations. An `Invoice` with `status` plus optional `paidAt`, `voidedAt`, and `creditedAt` permits states the business does not have; a union on `status` permits exactly the real ones.

Switches over a union **MUST** be exhaustive, with a `never`-typed default branch so that adding a union member becomes a compile error at every site that handles it. This is how a new invoice state or a new error code is guaranteed to be considered everywhere rather than silently defaulting.

### 8.6 Typed errors and typed responses

Failures **MUST** be typed. Services throw domain errors; transport maps them to `ApiError` codes. Throwing a bare `Error` or a string is forbidden — the former is indistinguishable from a genuine fault and gets its message withheld from clients, and the latter loses the stack entirely.

Responses **MUST** be typed from the generated contract. Hand-written response interfaces duplicating the OpenAPI specification are forbidden.

Functions that can fail in an _expected_ way **SHOULD** return a result union rather than throw. Exceptions are for exceptional conditions; "this course is full" is a normal Tuesday and is better modelled in the return type, where the caller cannot forget it.

### 8.7 Imports

Type-only imports use inline syntax (`import { type Foo }`), enforced by the `consistent-type-imports` ESLint rule. Cross-package imports use the package's public subpath exports (`@workspace/ui/components/button`), never a deep relative path into another package's `src`. Barrel files that re-export an entire package are discouraged: they defeat tree-shaking and create import cycles. `lib/ui` deliberately exposes per-component subpaths for this reason.

---

## 9. Error Handling Standards

### 9.1 Five categories, five behaviours

| Category           | Origin                               | Code                            | Logged at          | Message to user                  |
| ------------------ | ------------------------------------ | ------------------------------- | ------------------ | -------------------------------- |
| **Validation**     | Malformed or invalid request         | `unprocessable_entity`          | `debug`            | Field-level detail, safe to show |
| **Authentication** | Missing/invalid/expired session      | `unauthorized`                  | `info`             | Generic; never "user not found"  |
| **Authorization**  | Known actor, insufficient permission | `forbidden` / `not_found`       | `warn`             | Generic; never name the resource |
| **Application**    | Violated business rule               | `conflict`, `bad_request`, etc. | `info`             | Specific and actionable          |
| **Unexpected**     | Bug, dependency failure              | `internal_error`                | `error` with stack | Generic + `requestId`            |

The distinction that matters most: **application errors are expected and their messages are useful; unexpected errors are bugs and their messages are dangerous.** The middleware at `artifacts/api-server/src/middleware/error.ts` already implements this split, withholding internal messages in production. That behaviour **MUST NOT** be weakened for debugging convenience — internal messages leak schema names, file paths, and query fragments to anyone who can trigger them.

### 9.2 Authorization errors and information disclosure

When an actor requests a resource that exists but belongs to another organisation, the response **MUST** be `404`, not `403`. A `403` confirms the resource exists, which is itself a cross-tenant information leak and permits enumeration. `403` is reserved for resources the actor may legitimately know about but not act upon.

Similarly, authentication failures **MUST NOT** distinguish "unknown user" from "wrong password", and password reset **MUST NOT** reveal whether an address is registered. Both are account-enumeration vectors.

### 9.3 Throwing and catching

Throw `ApiError` (or a domain error that maps to one) — never a bare `Error`. Catch only where you will do something: translate, add context, or handle. A `catch` that logs and rethrows the same error produces duplicate log entries and obscures the origin.

When wrapping, **MUST** preserve the original via the `cause` option. ESLint's `preserve-caught-error` rule enforces this. A wrapped error without a cause has destroyed the only evidence of the actual failure.

Never swallow silently. An empty `catch {}` is forbidden; if an error is genuinely ignorable, log at `debug` with a comment explaining why.

### 9.4 Front-end error handling

Every route-level boundary needs an error boundary — an uncaught render error must not blank the application. React Query's retry and error state are configured once centrally rather than per hook, including a single handler for `unauthorized` so session expiry is dealt with in one place. Users see the `message` from the envelope for expected errors, and a generic message plus the `requestId` for `internal_error`, so a support conversation can begin with a correlatable identifier.

Clients branch on `error.code`, never on `message` text.

### 9.5 Diagnostics

Every error response carries a `requestId`, already wired through `pino-http`. That identifier is the correlation key across application logs, audit entries, and support tickets, and it is the reason a user-facing "something went wrong" is acceptable: the detail exists, it is simply not in the response body.

---

## 10. Authentication & Authorization Standards

> **Status: not yet implemented.** No authentication exists. These standards constrain how it will be built, per Document 03 §"Authentication Review".

### 10.1 RBAC, expressed as permissions

BRS §6 defines eleven roles and BRS §7 their capabilities. The implementation rule is absolute: **application code MUST check permissions, never role names.**

`if (user.role === 'admin')` is forbidden. Role checks scatter authorisation logic across the codebase, make BRS §7's capability lists unauditable, and break the moment a role's definition changes or a user holds two roles. Permissions are named `<context>.<resource>.<action>`, roles are named bundles of permissions, and the catalogue is seeded through migrations so it is versioned, reviewable in pull requests, and diffable.

### 10.2 Every check is a permission plus a scope

A permission alone is insufficient. A consultant may issue audits _for their assignments_; a client may view projects _for their organisation_. Every authorisation decision therefore answers: **may this actor perform this action on this resource?**

Scopes required by BRS §7: platform-wide (Admin, Super Admin), organisation (Client, Student), assignment (Consultant), and course (Trainer).

Object-level checks are mandatory, not just endpoint-level. The most common real-world authorisation flaw is an endpoint that correctly requires a permission and then operates on an identifier taken from the URL without confirming the actor may touch _that_ object.

### 10.3 The authorization context

Constructed once per request during session validation and passed explicitly down through services to repositories. It **MUST** be immutable, and it **MUST NOT** be ambient — no module-level mutable current-user, no async-local fallback that can default to something permissive. Code that needs identity receives it as a parameter, which also makes it trivially testable with different actors.

### 10.4 Sessions

Server-side sessions with opaque identifiers in cookies, backed by a sessions table. Chosen over stateless JWTs specifically for **instant revocation**: a dismissed consultant must lose access on their next request, not at token expiry.

Cookies **MUST** be `HttpOnly`, `Secure` in production, and `SameSite=Lax` at minimum. Sessions carry both idle and absolute expiry, are rotated on privilege change, and record device and IP for the security log. `SESSION_SECRET` and equivalents **MUST** be mandatory in production via the environment schema — a defaulted session secret is a total authentication bypass.

Multi-factor authentication is **mandatory** for internal roles (Consultant, Trainer, HR, Finance, Operations Manager, Marketing, Admin, Super Admin) and optional for Client and Student, following the BRS §6 access levels rather than being applied uniformly. Passwords use Argon2id with parameters stored alongside the hash so they can be raised over time.

### 10.5 Multi-tenant isolation

Enforced at the data-access layer, per §3. Restating the rule because it is the one that matters most: **a route handler MUST NOT be able to write an unscoped query.** Not "should remember not to" — must not be able to.

PostgreSQL row-level security **SHOULD** be evaluated as a second, independent layer when the first tenant-scoped table is designed. It costs little and means an application-layer bug does not become a breach.

### 10.6 CSRF

Cookie authentication combined with a credentialed CORS allowlist **requires** CSRF defence. Without it, an allowlisted origin can cause authenticated state changes, and simple form-encoded requests do not even require an allowlisted origin.

Minimum: `SameSite=Lax` cookies, a required custom header on all unsafe methods, and origin verification. Webhook routes are exempt and **MUST** instead be authenticated by provider signature over the raw body.

This is currently absent and is the most consequential gap authentication will introduce (Document 03, D3).

### 10.7 Client-side guards are not security

Route guards in the front ends are user experience: they prevent a confusing screen. **Every request is authorised server-side regardless.** A client-side guard is a suggestion, and a permission set delivered to the browser is a UI hint, never an enforcement point.

### 10.8 Two existing defects

`customFetch` in `lib/api-client-react/src/custom-fetch.ts` does not set `credentials`, so it defaults to `same-origin`. This works only behind the dev proxy and will silently fail cross-origin, presenting as a login that appears to succeed. It **MUST** be set to `include` before the first authenticated endpoint.

`setAuthTokenGetter` attaches `Authorization: Bearer`, contradicting the session-cookie decision, and its own comment says it must never be used on the web. A capability that must not be used **SHOULD** be removed rather than documented.

---

## 11. Security Standards

OWASP Top 10 is the baseline. This section states how each concern is handled here specifically.

### 11.1 Input validation

All external input is untrusted: bodies, path and query parameters, headers, cookies, file metadata, and third-party webhook payloads. Validation happens at the boundary using generated Zod schemas, so it cannot drift from client types.

Validate by allowlist, never by denylist. Reject unknown fields rather than ignoring them — silently accepting extra properties permits mass-assignment attacks, where a client supplies `organizationId` or `role` on an update.

### 11.2 Output encoding and XSS

React escapes text by default; do not defeat it. `dangerouslySetInnerHTML` is **forbidden** without sanitisation through a vetted library, and its use requires explicit review. This matters concretely because BRS §7 gives Marketing and Trainers content-authoring capability, so rich text authored by users will be rendered — stored XSS is a real path here, not a theoretical one.

User-controlled URLs **MUST** be validated against an allowlist of schemes; `javascript:` in an `href` is script execution.

The front ends currently have **no** Content-Security-Policy. The API's policy is correctly restrictive via Helmet, but the SPAs are the surface that matters for XSS, and a policy **SHOULD** be added when they are first served from production infrastructure.

### 11.3 Secrets management

Secrets **MUST NOT** appear in source, logs, error messages, client bundles, or commit history. All configuration is read through the validated schema in `config/env.ts`; `process.env` access elsewhere is forbidden.

The environment schema **MUST** distinguish development from production: variables that may safely default locally — `CORS_ORIGINS`, and any future session secret — **MUST** be mandatory in production and the process **MUST** refuse to boot without them. This is currently not the case and is a required change.

Anything embedded in a front-end bundle is public by definition. Vite's `import.meta.env` exposes only prefixed variables, and that prefix **MUST NOT** be used for anything sensitive.

Secret scanning **SHOULD** be added to CI, and a rotation procedure documented. If a secret is ever committed, rotate it — removing it from history does not un-disclose it.

### 11.4 Rate limiting

Two limiters exist in `artifacts/api-server/src/middleware/security.ts`: a general budget and a strict one for credential endpoints (10 attempts per 15 minutes, successful requests not counted). `authRateLimiter` is defined but **currently mounted nowhere**, and **MUST** be mounted on every login, password reset, and MFA endpoint as they are built.

Counters are in-memory and therefore per-instance. Under autoscale the effective limit is the configured limit multiplied by the instance count, so credential limiting **MUST** move to shared storage for the limit to mean anything.

`TRUST_PROXY` **MUST** match the production topology. Misconfigured, it either keys every client to the proxy's IP — so one user exhausts everyone's budget — or lets a client spoof `X-Forwarded-For` and bypass limits entirely.

### 11.5 File uploads

Nothing exists yet, and this will be the highest-risk surface the platform adds — one of its paths (job applications) is unauthenticated. Required standards:

Uploads go **directly from browser to object storage via a short-lived pre-signed URL**, so bytes never occupy an API process. Content type is determined by inspecting the file, never by trusting the extension or the client-supplied MIME type. Size limits are enforced at the storage provider, not only in the application. Files are scanned for malware before being marked available. Storage is private with no public access, served only through signed, expiring URLs. Stored filenames are generated, never derived from user input. Image EXIF is stripped. Downloads are served with `Content-Disposition: attachment` and a restrictive content type, so an uploaded HTML or SVG file cannot execute in a victim's browser.

Every download is an auditable event under BRS §10: the API issues the access grant even when the CDN serves the bytes.

### 11.6 CORS

An explicit allowlist from `CORS_ORIGINS`, with `credentials: true`. Wildcard origins are **forbidden**, and `credentials: true` with a reflected origin is forbidden — that combination is equivalent to no policy at all. An unlisted origin receives a `403`.

### 11.7 Dependency management

`pnpm-lock.yaml` is committed and CI installs with `--frozen-lockfile`. Automated dependency auditing **SHOULD** be added to CI. New dependencies require justification in the pull request: maintenance status, transitive weight, and whether the workspace already solves the problem. A dependency for something the standard library or an existing dependency does is a permanent liability for a temporary convenience.

### 11.8 Additional OWASP-aligned requirements

Insecure direct object reference is prevented by object-level authorisation (§10.2) and by returning `404` rather than `403` for other tenants' resources (§9.2). Server-side request forgery is prevented by allowlisting any outbound URL derived from user input. Injection is prevented by parameterised queries — raw SQL with interpolated values is **forbidden**; Drizzle's query builder or explicitly parameterised statements only. Security logging per §13. Deserialisation of untrusted input into executable structures is forbidden.

---

## 12. Database Standards

No schema is defined here, per the constraints. These are the rules the first migration must follow.

### 12.1 Migration policy

`drizzle-kit generate` then `migrate`. **`push` MUST NOT be run against any shared database** — it mutates schema leaving no history, which cannot satisfy BRS §10's audit and rollback requirements. It remains available only for throwaway local databases.

Migrations are committed, reviewed, and forward-only. Destructive changes require a documented rollback plan. Column changes follow **expand-then-contract** — add, backfill, switch reads, then remove in a later migration — so no deploy requires simultaneous schema and code cutover.

`pnpm --filter @workspace/db run check` **MUST** be added to CI with the first table. It is deliberately absent now only because the schema directory is empty.

### 12.2 Naming

Per §7.3: `snake_case` throughout, plural tables, `<singular>_id` foreign keys, `<verb>_at` timestamps, `is_`/`has_` booleans, `idx_<table>__<cols>` indexes.

### 12.3 Indexes

**Every index on a tenant-scoped table MUST lead with `organization_id`.** This is the difference between an index that serves tenant-filtered queries and one the planner ignores.

Every foreign key gets an index — PostgreSQL does not create them automatically, and their absence makes joins and cascade checks slow in ways that appear only under load. Sortable and filterable fields exposed by the API (§5.7) **MUST** be indexed. Unique constraints belong in the database, not only in application checks: an application-level uniqueness check is a race condition.

Indexes are justified in the migration's review, not added speculatively — each one costs write throughput and storage.

### 12.4 Foreign keys and referential integrity

Foreign keys are always declared and enforced. `ON DELETE RESTRICT` is the default; `CASCADE` only where a child genuinely cannot outlive its parent, such as invoice lines under an invoice. Application-level referential integrity is not acceptable — concurrent requests will violate it.

Polymorphic references (a corrective action arising from a finding, an incident, or a risk assessment) cannot be foreign-key enforced as a type-plus-id pair. Where the owner set is small and known, separate nullable columns with a check constraint **SHOULD** be preferred, because that version is enforceable.

### 12.5 Transactions

Services own transaction boundaries; repositories join them (§4.1). A transaction wraps one logical business operation, including its audit entries and outbox events, so that a change and its audit trail cannot become inconsistent.

Keep transactions short and never perform I/O inside one — no HTTP calls, no file uploads, no email. An open transaction holds locks and a connection, both of which are scarce under autoscale.

### 12.6 Soft deletes

Per §3.5 and Document 03's three categories: never-deleted legal records, lifecycle state, and genuinely deletable rows. Blanket `deleted_at` on every table is **forbidden**. GDPR erasure is a distinct mechanism that redacts personal fields in place while preserving referential structure and financial records.

### 12.7 Audit columns and timestamps

Every table carries `created_at` and `updated_at` as `timestamptz`. **All timestamps are `timestamptz`, stored in UTC** — `timestamp without time zone` is forbidden. This is not pedantry: the platform is UK-based with daylight saving, and compliance deadlines, booking slots, and certificate expiry all become wrong twice a year otherwise.

`created_by` and `updated_by` are carried where the actor is meaningful. They complement rather than replace the audit log: the columns answer "who last touched this", the log answers "what happened, in order".

The audit log itself is append-only, and `UPDATE` and `DELETE` **MUST** be revoked from the application's database role. Immutability guaranteed by permissions is immutability; immutability guaranteed by discipline is a hope. Audit entries are written in the same transaction as the change they record, and the table is planned for time-based partitioning with a retention policy.

### 12.8 UUID policy

Primary keys are **UUIDv7**. Non-guessable, so identifiers in URLs neither leak volume nor permit enumeration, while remaining time-ordered and therefore index-friendly — which UUIDv4 is not, because random keys scatter B-tree inserts.

The exceptions are legally sequential human-facing numbers: invoice numbers and BRS §10's project reference numbers. These come from database sequences, are gap-free, and are **separate columns from the primary key**. Generating them by counting existing rows is forbidden; it produces duplicates under concurrency.

### 12.9 Multi-tenancy

Shared-schema with an `organization_id` discriminator, per the recorded single-organisation-per-client-user decision.

`organization_id` is denormalised onto **every** tenant-scoped table even where derivable by joining. This is deliberate: it makes the isolation predicate cheap, index-friendly, and uniformly applicable by a repository base class rather than reasoned about per query.

Should a client ever require physical isolation, the migration path is schema-per-tenant or database-per-tenant. Keeping all tenant filtering inside the repository layer is what preserves that option — application code that never mentions tenancy does not need to change.

---

## 13. Logging Standards

### 13.1 Four log types

**Application logs** — operational events, via the `pino` logger at `artifacts/api-server/src/lib/logger.ts`. Structured JSON in production, pretty-printed in development. Transient and sampled; not a system of record.

**Audit logs** — BRS §10's immutable record, in the database, not in log output. A log stream is not an audit trail: it is rotated, sampled, and not transactionally consistent with the change it describes.

**Security logs** — authentication successes and failures, authorisation denials, permission and role changes, session revocations, rate-limit breaches, CORS rejections. Emitted as application logs at `warn` or above **and** recorded as audit entries where a sensitive action occurred.

**Performance logs** — request duration, database query counts and timings for slow requests, background job duration. Sampled rather than universal.

### 13.2 Levels

| Level   | Use                                    | Example                                                        |
| ------- | -------------------------------------- | -------------------------------------------------------------- |
| `fatal` | Process cannot continue                | Invalid environment at boot                                    |
| `error` | Unexpected fault needing investigation | Unhandled exception, dependency failure                        |
| `warn`  | Expected but notable                   | Authorisation denial, rate limit hit, deprecated endpoint used |
| `info`  | Significant business events            | Service started, invoice issued, shutdown initiated            |
| `debug` | Diagnostic detail                      | Validation failure detail, query shapes                        |
| `trace` | Very verbose, local only               | Request/response bodies                                        |

Default is `info` in production and `debug` locally, via `LOG_LEVEL`. A validation failure is `debug`, not `error` — a user typing an invalid email is not a system fault, and treating it as one trains everyone to ignore the error level.

### 13.3 Structure

Log structured objects, never interpolated strings: `logger.info({ projectId, organizationId }, 'Project created')` rather than a formatted sentence. Structured fields are queryable; sentences are not.

Every log line within a request **MUST** carry the `requestId`, which `pino-http` already attaches. Field names are consistent across the platform — `organizationId`, not `orgId` in one module and `organisation_id` in another — because inconsistent keys make cross-service queries impossible.

`console.log` is forbidden in application code, enforced by the `no-console` ESLint rule, with an explicit exemption for scripts, build files, and `config/env.ts`, which legitimately write to stdout before a logger exists.

### 13.4 Sensitive data

**MUST NOT** be logged, at any level: passwords, session tokens, API keys, full card details, MFA secrets, or password reset tokens. Personal data is minimised — log an identifier rather than an email address, so that log retention does not become a GDPR liability.

`logger.ts` already redacts `authorization` and `cookie` request headers and `set-cookie` on responses. That redaction list **MUST** be extended as new sensitive fields appear; it is a standing obligation, not a completed task.

Request and response bodies **MUST NOT** be logged at `info` or above. They contain personal data by default and card or credential data by accident.

---

## 14. Testing Standards

### 14.1 Philosophy

Tests exist to make change safe. A test that breaks whenever an implementation detail changes, without a behaviour change, is a liability — it trains the team to update tests reflexively rather than to read failures. **Test behaviour through public interfaces, not internals.**

The current suite is nine tests in `artifacts/api-server/src/app.test.ts`, covering health and readiness probes, the error envelope, the CORS allowlist, and security headers. It is a good model to follow: it exercises the real application through HTTP with no mocking of the code under test.

### 14.2 Unit tests

Vitest, co-located as `<subject>.test.ts`. Required for all `lib/domain` logic, pure functions and utilities, permission resolution, and validation schemas.

Domain logic **MUST** be testable without a database, an HTTP server, or a mock — if it is not, it is in the wrong layer, and the difficulty is the diagnosis. Mock at architectural boundaries only (third-party providers, clocks, ID generators), never internal collaborators.

### 14.3 Integration tests

Required for every repository, against a **real PostgreSQL instance** with migrations applied. Mocking a query builder tests the mock; the interesting failures are constraint violations, transaction semantics, and whether the tenant predicate actually applied.

**Every repository MUST have a test proving that data belonging to another organisation is not returned.** This is the executable form of BRS §10 and is the single most valuable test in the platform. It **MUST NOT** be skipped or marked pending.

Service tests use real repositories against a test database, with only external providers substituted.

### 14.4 API tests

Supertest against the real Express application, as `app.test.ts` already does. Every endpoint needs coverage of the success path, validation failure, unauthenticated access, insufficient permission, and cross-tenant access denial. Those last three are not optional extras — they are the requirements most likely to regress silently, because the happy path keeps working.

Response shapes are asserted against the generated schemas, so a test fails if the implementation drifts from the contract.

### 14.5 End-to-end tests

Playwright, deliberately **deferred** in Phase 1 because there were no authenticated flows or persisted forms to exercise, and browser tests over static marketing copy assert nothing of value. E2E arrives with the first real user journey.

Scope stays small and durable: authentication, one critical journey per ecosystem (enrol in a course, view an audit report, submit an enquiry), and payment flows against provider test modes. E2E tests are slow and flaky in proportion to their number; they are for journeys, not for coverage.

### 14.6 Accessibility tests

Automated `axe` checks on every page and major component, in CI, per BRS §9's WCAG 2.2 AA requirement. Automation catches perhaps half of real accessibility defects, so keyboard-only and screen-reader passes are part of manual review for new interfaces (§16).

### 14.7 Smoke and regression tests

Smoke: after every deploy, verify `/healthz` and `/readyz`, one authenticated read, and one static page. Fast enough to gate a rollback.

Regression: **every fixed bug gets a test that fails before the fix and passes after.** No exceptions. This is the cheapest test to write, because the reproduction already exists at that moment, and it is the only mechanism that reliably prevents recurrence.

### 14.8 Coverage expectations

Coverage is a diagnostic, not a target. Gaming a percentage produces assertion-free tests that execute lines.

Expectations by layer: `lib/domain` near-complete, because it is pure and cheap to test; repositories complete for tenant scoping specifically; services covering every business rule and failure path; API endpoints covering the five cases in §14.4; front end focused on logic, forms, and permission-gated rendering rather than markup.

Untested code **MUST NOT** handle money, permissions, or personal data.

### 14.9 Test data

Factories over fixtures — fixtures accumulate incidental detail that tests then accidentally depend on. Every test is independent and order-independent, creating and cleaning its own data. Tests **MUST NOT** share mutable state, and **MUST NOT** depend on the current wall-clock time: inject a clock, or expiry tests fail at midnight and pass again the next morning.

---

## 15. Performance Standards

BRS §9 requires sub-two-second loads on broadband, mobile-first. Performance is a feature with a budget, not a phase.

### 15.1 Code splitting and lazy loading

**Current state: none.** All eleven routes are eagerly imported in `App.tsx`, producing a single 576.53 kB JavaScript chunk (179.52 kB gzipped). A visitor to the contact page downloads every page on the site.

Route-level lazy loading with a Suspense boundary **MUST** be the default for every portal from its first route, not a later optimisation. Portal bundles will include charting, rich text editing, calendars, and video players; a single eager chunk will reach several megabytes.

Heavy dependencies are loaded on demand at the point of use. Framer Motion in particular is substantial and **MUST NOT** sit in a portal's critical path.

A bundle-size budget **SHOULD** be enforced in CI so a regression fails a pull request instead of being discovered in production.

### 15.2 Caching

**Server:** ETags on cacheable reads — the generated client already handles conditional requests. Public marketing content is cached at the CDN and invalidated on publish rather than expiring. Settings and entitlement lookups, read on nearly every request, are cached in process with explicit invalidation.

**Client:** `QueryClient` is currently constructed with no options, so every hook inherits library defaults. It **MUST** be configured deliberately and centrally: `staleTime` per data class, a retry policy that does not retry non-idempotent mutations, and one handler for `unauthorized`. Query keys follow a documented convention so invalidation is predictable rather than guesswork.

Cache invalidation is designed alongside each mutation, not added when staleness is reported as a bug.

### 15.3 Memoisation

Applied to measured problems, not applied prophylactically. `useMemo` and `useCallback` have a cost, and wrapping everything makes code harder to read while making it slower. Justified for genuinely expensive computation, for referential stability that a dependency array actually needs, and for large lists. Prefer reducing work — better data shapes, less state, narrower components — over memoising the same work.

### 15.4 Images

Currently unoptimised: two hero JPEGs at 126.52 kB and 151.31 kB, with no responsive variants and no modern formats, so mobile visitors download desktop-sized images against a mobile-first requirement.

Standard: a build-time pipeline producing AVIF and WebP at several widths; `srcset` and `sizes` on every content image; explicit `width` and `height` to prevent layout shift; lazy loading below the fold and eager loading with high priority for the hero. User-uploaded images are processed on upload, never resized in the browser at render time.

### 15.5 Database query performance

**N+1 access is the most common cause of slow enterprise dashboards**, and Drizzle makes it easy to write accidentally. Prevention belongs in the repository layer, where query shape is decided. Query counts **SHOULD** be asserted in tests for the heaviest endpoints — an assertion catches the regression that observation misses.

Every query must be servable by an index (§12.3). New query patterns are checked with `EXPLAIN` during review, not after a production slowdown. Only required columns are selected: `SELECT *` through an ORM is how a large text column ends up in a list endpoint.

Analytics and reporting **MUST NOT** run against the transactional path. Materialised views on a refresh schedule first, then a read replica.

### 15.6 API performance

Every collection endpoint is paginated with a maximum page size (§5.6). Long-running work — certificate generation, bulk enrolment, report export — returns an accepted-job reference rather than blocking a request. Response payloads carry what the client needs; a chatty screen is fixed by shaping the endpoint, not by adding a caching layer.

Connection pool size **MUST** be set explicitly, derived from the instance ceiling and the database's connection limit. The default of ten per process multiplied by autoscale instances exhausts a standard PostgreSQL limit at moderate traffic, and it presents as intermittent timeouts unrelated to data volume.

### 15.7 Measurement

Core Web Vitals budgets in CI. Structured performance logging for slow requests. Optimisation follows measurement; a change justified only by intuition is not a performance improvement, it is a change.

---

## 16. Accessibility Standards

BRS §9 requires **WCAG 2.2 AA**. This is a contractual obligation and, for a UK company selling compliance services, a matter of credibility.

### 16.1 Semantic HTML first

Use the element that means what you intend. A `<button>` is focusable, keyboard-activated, and announced as a button; a `<div>` with a click handler is none of those and requires four attributes and a keydown handler to imitate one badly.

Every page has one `<h1>` and a heading hierarchy with no skipped levels. Landmarks (`<nav>`, `<main>`, `<aside>`, `<footer>`) are present, with a skip-to-content link. Lists are lists, tables are tables with proper headers and scopes, and forms use real `<label>` elements associated with their controls — placeholder text is not a label.

### 16.2 Keyboard navigation

Every interactive element **MUST** be reachable and operable by keyboard alone. Tab order follows visual order; positive `tabindex` values are forbidden. Modals and drawers trap focus while open, restore it to the trigger on close, and close on `Escape`. No keyboard trap exists anywhere. Custom widgets implement the keyboard interactions their ARIA pattern specifies — arrow keys in menus and tabs, `Home`/`End` in lists.

The `lib/ui` primitives are built on Radix, which provides correct keyboard behaviour. **That is a reason to use them rather than hand-rolling interactive components**, and it is a reason not to defeat their behaviour with custom event handlers.

### 16.3 ARIA

The first rule of ARIA is not to use it: prefer native semantics. Where it is needed, use a documented pattern rather than improvising, since incorrect ARIA is worse than none — it actively misinforms assistive technology.

Icon-only controls need accessible names. Decorative images take empty `alt`; meaningful images take descriptive `alt`. Dynamic updates — toasts, validation errors, loading completion — are announced via live regions. State is conveyed with `aria-expanded`, `aria-selected`, `aria-current`, and `aria-invalid`, kept in sync with actual state.

### 16.4 Focus management

Focus is always visible; removing outlines without an equivalent replacement is **forbidden**. Route changes move focus to the new page's heading, or a screen-reader user hears nothing and remains oriented to the previous page. Focus never moves unexpectedly during typing. Newly revealed content receives focus when it is the natural continuation of the interaction.

### 16.5 Colour and contrast

Text meets 4.5:1, large text 3:1, and interactive boundaries and focus indicators 3:1. Colour is never the only carrier of meaning — a red border needs accompanying text, since colour-blind users and greyscale printouts both lose it. Both light and dark themes are verified; contrast is not preserved automatically by inverting a palette, which is one reason each application owns its own palette against the shared `lib/ui` structural layer.

### 16.6 Reduced motion

`prefers-reduced-motion` **MUST** be respected. The marketing site uses Framer Motion and scroll-reveal animations, which are exactly the effects that trigger vestibular discomfort. Under reduced motion, transforms and parallax are removed rather than merely shortened; opacity transitions are acceptable. No animation flashes more than three times per second.

### 16.7 Verification

Automated `axe` checks in CI catch roughly half of real defects. New interfaces additionally require a keyboard-only pass and a screen-reader pass before merge, plus verification at 200% zoom and at 320 px width. Accessibility is on the merge checklist (§21), not on a remediation backlog.

---

## 17. Git Standards

### 17.1 Branch naming

```
feat/<short-description>      fix/<short-description>
refactor/<short-description>  docs/<short-description>
chore/<short-description>     spike/<short-description>
```

Lower-case, hyphenated, descriptive. Include a tracker reference where one exists. Branches are short-lived: a branch open for weeks is a merge conflict accruing interest.

### 17.2 Commit messages

The established convention in this repository, which **MUST** be followed:

**Subject:** imperative mood, sentence case, no trailing full stop, at most 72 characters, describing the change's _purpose_ rather than its mechanics. Existing history is the reference: _"Harden the API and put schema changes under version control"_, _"Extract the shadcn primitives into a shared lib/ui design system"_, _"Make the workspace buildable and runnable outside Replit"_.

**Body:** wrapped prose explaining **why**, what was considered and rejected, and any consequence a future reader would not infer from the diff. The diff shows what changed; the body must supply what the diff cannot. A commit whose body restates the subject has wasted the only opportunity to record intent.

Commits are logically atomic. Mechanical changes — formatting, renames — are separated from behavioural ones, so that a large formatting pass does not obscure a security fix. This is why Phase 1 split its formatting commit from its functional commit.

### 17.3 Pull requests

One concern per pull request. A description stating what changed, why, how it was verified, and anything a reviewer should look at especially closely. Screenshots or recordings for user-visible change. Explicit callouts for schema migrations, permission or role changes, new dependencies, and configuration additions — these are the changes with consequences beyond the diff.

**CI MUST be green.** `pnpm run verify` — format, lint, typecheck, test — plus build and API-contract drift. Failing checks are not merged with a promise to fix afterwards.

### 17.4 Code review checklist

Reviewers confirm:

- **Correctness** — does it do what it claims, including edge cases and failure paths?
- **Authorisation** — is every path permission-checked and tenant-scoped, at the object level and not merely the endpoint level?
- **Layer discipline** — no database access outside repositories, no HTTP in services, no business rules in controllers?
- **Types** — no `any`, no unexplained assertions, exhaustive switches?
- **Errors** — typed, correctly categorised, no internal detail leaked?
- **Tests** — behaviour covered, including denial paths and the cross-tenant case?
- **Accessibility** — keyboard, focus, contrast, semantics, for any UI change?
- **Performance** — no N+1, pagination present, no unnecessary bundle weight?
- **Security** — input validated, output encoded, no secret exposure?
- **Logging** — significant events logged, sensitive data redacted, audit entries for sensitive actions?
- **Documentation** — `replit.md` and the relevant document updated if a convention or decision changed?
- **Conventions** — naming and structure consistent with this handbook?

Review comments distinguish blocking concerns from suggestions. Approving code you do not understand is not a favour to anyone.

### 17.5 Release strategy and versioning

`main` is always deployable. Releases are tagged. **Migrations are backward-compatible with the currently deployed application version** (expand-then-contract, §12.1), so a rollback does not require a schema rollback — the case where this matters is the one where everything is already going wrong.

Packages are private and versioned together; the API is versioned separately and independently under `/api/v1` (§5.3), because its consumers are external to its release cycle. Tags follow semantic versioning, with a changelog entry per release (§18).

---

## 18. Documentation Standards

### 18.1 Where documentation lives

| Artifact                | Location                    | Purpose                                           |
| ----------------------- | --------------------------- | ------------------------------------------------- |
| Operating handbook      | `replit.md`                 | How to run, where things live, decisions, gotchas |
| Numbered specifications | `docs/`                     | The contract: Documents 01–03.5 onward            |
| API contract            | `lib/api-spec/openapi.yaml` | Source of truth; generates clients                |
| Decision records        | `docs/adr/`                 | Individual architectural decisions                |
| Changelog               | `CHANGELOG.md`              | Release-visible change                            |

`replit.md` is the entry point and **MUST** be updated in the same pull request as any change to how the project is run, where things live, or which conventions apply. Documentation updated later is documentation not updated.

### 18.2 The numbered documents

Documents 01 onward are the contract. Code aligns to them, and **divergences are recorded rather than absorbed silently** — the "Architecture decisions" section of `replit.md` exists for exactly this. The Vite-instead-of-Next.js and Drizzle-instead-of-Prisma decisions are recorded there because an undocumented divergence becomes an unexplainable inconsistency within months.

Where a document is superseded, say so in the document rather than leaving readers to discover it. Document 03's assessment sections are the current architectural position; this handbook is the current engineering position.

### 18.3 API documentation

The OpenAPI specification is the documentation, and it **MUST** carry `summary`, `description`, and realistic examples for every operation and schema — a specification that only names its fields is a type definition, not documentation. Descriptions explain _why_ and _when_, as `openapi.yaml` already does for `/healthz` and `/readyz`, both of which explain the liveness-versus-readiness distinction rather than restating the path.

### 18.4 Inline comments

**Comment on why, never on what.** The code states what it does; a comment restating it adds maintenance burden and drifts into inaccuracy.

Legitimate comments: a non-obvious constraint, a rejected alternative and the reason, a workaround with a link to the underlying issue, a security-relevant invariant, or a warning about a surprising consequence. The existing codebase models this well — `logger.ts` explains why `hsts` is production-only (it would pin localhost to HTTPS for months), and `custom-fetch.ts` explains why strict equality is used for the body check (React Native reports `undefined` even for populated responses). Neither fact is inferable from the code.

Comments **MUST NOT** narrate the change being made, address a reviewer, or record history. `// changed this to fix the bug` is meaningless once merged; git carries that.

`TODO` comments include an owner and a tracker reference, or they are forbidden. An unattributed `TODO` is a wish.

### 18.5 JSDoc

Required on every exported function, type, and constant in `lib/*` packages, since consumers see them without opening the file. Document purpose, non-obvious parameters, thrown errors, and constraints. Do not restate what the signature already says — a `@param userId` reading "the user id" is noise. `ApiError` in `errors.ts` is the model: it documents the _policy_ that it is the only error type handlers should throw, which is exactly what a caller cannot infer.

Internal application code does not require JSDoc where names and types are self-explanatory.

### 18.6 Architecture Decision Records

Every significant, hard-to-reverse decision gets an ADR in `docs/adr/NNNN-short-title.md`, covering context, the decision, alternatives considered with the reason for rejection, consequences including negative ones, and status.

An ADR is warranted for anything that would prompt a future engineer to ask "why on earth is it done this way": framework and library selection, data modelling approaches, authentication design, tenancy strategy, and deployment topology. The five decisions currently in `replit.md` **SHOULD** be promoted to ADRs, because a table row records the outcome but not the reasoning, and the reasoning is what a reader needs in order to know whether the decision still applies.

ADRs are immutable once accepted. A reversal is a new ADR superseding the old one, so the history of thinking survives.

### 18.7 Changelog

`CHANGELOG.md` in Keep a Changelog format, written for the humans operating and using the platform rather than derived mechanically from commits. Breaking changes, migrations requiring operator action, and new configuration are called out explicitly.

---

## 19. AI Development Standards

This platform is being built with substantial AI assistance. That is a legitimate engineering approach with specific, predictable failure modes, and these standards exist to constrain them. Every rule below addresses something that actually goes wrong.

### 19.1 AI MUST NOT invent architecture

Architecture is decided in the numbered documents and recorded in `replit.md`. An assistant asked to build a feature **MUST** implement it within the existing architecture, not propose and silently adopt a different one.

If the architecture appears to prevent a correct solution, the assistant **MUST** say so and stop, rather than working around it. A workaround around an architectural boundary is worse than the boundary being wrong, because it leaves the codebase with both.

_The failure mode:_ asked for a feature, an assistant introduces a new state management library, a second HTTP client, or a parallel folder convention, because each is individually reasonable. Three of those and the codebase has no architecture at all.

### 19.2 AI MUST preserve existing conventions

Before writing code, an assistant **MUST** read comparable existing code and follow it: naming, file placement, error handling, import style, test structure. This handbook is the reference; the code is the tiebreaker.

Where this document and the code disagree, **raise it rather than picking one.** A silent divergence makes the handbook untrustworthy, and an untrustworthy handbook stops being read.

### 19.3 AI MUST NOT duplicate

Before creating a component, hook, utility, type, or schema, an assistant **MUST** search for an existing one and reuse or extend it.

This is not a hypothetical concern here. The two front ends previously carried independent copies of all 55 shadcn primitives, which had forked onto different generations — one file's `textarea` had materially different sizing and focus behaviour from the other's. That duplication produced 6,479 deleted lines when it was resolved, and the whole class of problem is why `lib/ui` exists and why creating a `components/ui/` directory in an application is forbidden.

Specifically: primitives come from `lib/ui`; `cn` comes from `@workspace/ui/utils`; API types and hooks are generated from `openapi.yaml`, never hand-written; validation schemas come from `lib/api-zod`.

### 19.4 AI MUST reuse before creating

A new dependency, a new abstraction, or a new pattern requires justification against what already exists. The workspace already provides routing, data fetching and caching, validation, a design system, logging, error handling, and testing. A proposal to add a second of any of these needs a reason beyond preference.

### 19.5 AI MUST explain significant changes

Any refactor touching multiple files, any change to a shared package, any schema or migration change, and any change to authentication, authorisation, or security **MUST** be explained before or alongside the change: what is changing, why, what the risk is, and how it was verified.

Verification means evidence, not assertion. "This should work" is not verification. Running the tests, exercising the endpoint, comparing build output — those are. When the design system was extracted, the compiled CSS from the previous commit was rebuilt in a parallel worktree and diffed to prove no visual change; that is the standard for a change with invisible failure modes.

### 19.6 AI-generated code requires human review

No exception. The Technical Lead is accountable for merged code regardless of who or what wrote it.

Review AI output **more** sceptically than human output in three specific places, because these are where it is most confidently wrong: authorisation and tenant scoping, where plausible-looking code omits a predicate; error handling, where failure paths get less attention than happy paths; and anything where a subtly wrong version looks exactly like the right one.

### 19.7 AI MUST NOT weaken safeguards to make things pass

Under pressure to get a build green, the tempting moves are all forbidden: adding a rule to the ESLint ignore list, loosening a TypeScript setting, adding `as any`, marking a test as skipped, or broadening the vendored-code exemption to cover our own code.

If a safeguard blocks progress, the safeguard has found something. Fix the cause or escalate. The vendored-code exemption in `eslint.config.mjs` is scoped deliberately to upstream shadcn files, and **MUST NOT** be widened to include application code.

### 19.8 AI MUST state uncertainty

An assistant that does not know **MUST** say so rather than producing confident-sounding output. Guessing at a business rule, a permission boundary, or a compliance requirement is worse than asking, because a guess that looks like knowledge gets built upon.

Business rules come from Document 02. If Document 02 is silent, the answer is a question for the Product Owner, not an invention.

### 19.9 Scope discipline

Do what was asked. Opportunistic reformatting, renaming, or "while I was in here" improvements make a diff unreviewable and bury the actual change. Note the observation and propose it separately.

### 19.10 Documentation obligations

An assistant **MUST** update `replit.md` when it changes how the project runs or what the conventions are, update `.env.example` when it adds a configuration variable, update `openapi.yaml` before implementing an endpoint, and propose an ADR for a significant decision. Documentation is part of the change, not a follow-up task.

---

## 20. Technical Debt Policy

### 20.1 What debt is

Deliberate debt is a considered trade-off: a simpler implementation now, knowingly incurring future cost, recorded so the decision can be revisited. That is a legitimate engineering tool.

What is not debt is unrecorded mess. Debt requires three things — a reason, a record, and a trigger for repayment. Without them it is not a loan, it is a leak.

### 20.2 Acceptable debt

- **Hardcoded content ahead of a CMS.** The marketing site's content is in components. Correct: a CMS is a later phase and the content is stable.
- **Deferring work that needs a prerequisite.** Playwright, accessibility budgets, and Core Web Vitals gates were deferred in Phase 1 because they need a running application with a real user journey. Recorded in Document 03 §10.1 with a stated trigger.
- **A simple implementation of a rare operation.** An admin action run monthly does not need the optimisation a user-facing endpoint needs.
- **Keeping the `artifacts/` directory name.** Non-standard, but changing it risks the deployment platform for a cosmetic gain. Recorded and declined.
- **Not splitting the marketing site's bundle yet.** Eight pages at 179 kB gzipped is acceptable; the standard binds portals from their first route.

### 20.3 Unacceptable shortcuts

These are never acceptable, at any deadline. Each corresponds to a failure with legal, financial, or security consequence:

- Skipping a permission check, or scoping tenancy in a handler instead of a repository.
- Omitting audit logging for a sensitive action.
- `any`, `as unknown as T`, or a disabled type check to make something compile.
- A skipped or deleted failing test, or a test asserting current behaviour rather than intended behaviour.
- Secrets in source, configuration read outside the validated schema, or a production default for a security-critical variable.
- `drizzle-kit push` against a shared database.
- Raw SQL with interpolated user input.
- Logging personal data, credentials, or tokens.
- Widening the vendored-code lint exemption to cover application code.
- A new copy of a shared component.
- An endpoint implemented before its specification.

The distinction is principled rather than arbitrary: acceptable debt costs _time later_, unacceptable shortcuts cost _correctness now_ in areas where the failure is a breach, a mis-billing, or an unauditable action.

### 20.4 Recording and repaying

Debt is recorded in the technical debt register in Document 03 §"Technical Debt", with severity, cost of delay, and the trigger that makes it urgent. New debt is added there in the same pull request that incurs it.

Repayment is triggered by the recorded condition, not by spare capacity — which never arrives. Debt whose trigger has fired takes priority over new feature work, because cost-of-delay multipliers are why D1 through D5 are scheduled before the first domain table rather than after thirty of them.

The register is reviewed at each phase boundary, and every entry is either scheduled, re-justified, or accepted permanently with a reason.

### 20.5 Refactoring expectations

Refactoring is continuous and small, in separate commits from behavioural change (§17.2). Leave code better than you found it _within the scope of your change_ — a wholesale improvement of surrounding code makes a diff unreviewable (§19.9).

Large refactors need a stated goal, a verification strategy proportionate to the risk, and incremental steps that each leave the build green. Prefer strangling — introduce the new path, migrate callers, remove the old — over big-bang replacement, which cannot be reviewed or reverted in pieces.

### 20.6 Deprecation

Removing something with consumers follows: mark deprecated with a JSDoc `@deprecated` naming the replacement; migrate internal callers; announce in the changelog; remove after a stated window. For the API, deprecation is a version concern (§5.3) — an endpoint with external consumers is not removed inside a major version. Log usage of a deprecated path at `warn` so that "is anyone still using this" is answerable with data.

### 20.7 Migration policy

Data migrations are reversible or have a documented recovery plan; are tested against production-shaped data volumes, because a migration fast on ten rows can lock a table on ten million; run in batches with progress logging when large; and follow expand-then-contract so application and schema are never required to deploy simultaneously (§12.1).

---

## 21. Engineering Checklist

Every feature satisfies this before merge. It is a gate, not a suggestion, and the reviewer confirms rather than trusts.

### Contract and types

- [ ] `openapi.yaml` updated **before** implementation; codegen run and committed
- [ ] Every operation declares a `default` response referencing `ErrorResponse`
- [ ] No `any`; no unexplained type assertions; switches over unions are exhaustive
- [ ] Request and response types come from generated code, not hand-written duplicates

### Layer discipline

- [ ] No database access outside `lib/data`; no Drizzle import in services or transport
- [ ] Business rules in `domain` or `services`, not in controllers or components
- [ ] Transaction boundaries owned by services
- [ ] Repository returns domain types, not raw rows

### Security and authorisation

- [ ] Every endpoint has an explicit permission requirement — permissions, never role names
- [ ] Object-level authorisation verified, not just endpoint-level
- [ ] Tenant scoping applied by the repository; a cross-tenant test proves it
- [ ] Other tenants' resources return `404`, not `403`
- [ ] Input validated at the boundary, including path and query parameters; unknown fields rejected
- [ ] No secrets in source, logs, or client bundle; new configuration in the env schema **and** `.env.example`
- [ ] CSRF respected for cookie-authenticated mutations; webhooks signature-verified instead
- [ ] Any new upload path follows §11.5 in full

### Data

- [ ] Migration generated (not pushed), reviewed, forward-only, expand-then-contract
- [ ] `organization_id` present on tenant-scoped tables; every index leads with it
- [ ] Foreign keys declared and indexed; unique constraints in the database
- [ ] `timestamptz` for all timestamps; audit columns present
- [ ] Soft-delete category chosen deliberately per §3.5

### Errors and logging

- [ ] Typed errors, correctly categorised; no internal detail leaked in production
- [ ] Caught errors preserve `cause`; nothing swallowed silently
- [ ] Significant events logged as structured objects with `requestId`
- [ ] Sensitive fields redacted; no bodies logged at `info` or above
- [ ] Audit entries written for every sensitive action, in the same transaction

### Tests

- [ ] Unit tests for domain logic, runnable without a database
- [ ] Integration tests against real PostgreSQL for every repository
- [ ] API tests covering success, validation failure, unauthenticated, unauthorised, and cross-tenant
- [ ] A regression test for every bug fixed
- [ ] No skipped tests; no dependence on wall-clock time or test order

### Accessibility

- [ ] Semantic HTML; one `<h1>`; landmarks present
- [ ] Keyboard-only pass completed; focus visible; focus managed on route change and in modals
- [ ] Accessible names on icon-only controls; dynamic updates announced
- [ ] Contrast verified in both themes; colour not the sole carrier of meaning
- [ ] `prefers-reduced-motion` respected
- [ ] Automated `axe` check passes

### Performance

- [ ] Routes lazy-loaded; no unjustified addition to bundle weight
- [ ] Collection endpoints paginated with a maximum page size
- [ ] No N+1 access; queries served by an index; only needed columns selected
- [ ] Images responsive, in modern formats, with dimensions set
- [ ] Cache policy and invalidation decided for new data

### Documentation and process

- [ ] `replit.md` updated if running, structure, or conventions changed
- [ ] ADR added for any significant decision
- [ ] JSDoc on new exports from `lib/*`
- [ ] Changelog entry for user- or operator-visible change
- [ ] New debt recorded in the register with severity and trigger
- [ ] Commit messages explain **why**; mechanical and behavioural changes separated
- [ ] `pnpm run verify` green, plus build and codegen drift check
- [ ] Human review completed, regardless of how the code was produced

---

## Appendix A — Quick Reference

| Need                   | Command                                           |
| ---------------------- | ------------------------------------------------- |
| Everything CI runs     | `pnpm run verify`                                 |
| Typecheck all projects | `pnpm run typecheck`                              |
| Lint / autofix         | `pnpm run lint` / `pnpm run lint:fix`             |
| Format / check         | `pnpm run format` / `pnpm run format:check`       |
| Tests                  | `pnpm run test`                                   |
| Regenerate API client  | `pnpm --filter @workspace/api-spec run codegen`   |
| New migration          | `pnpm --filter @workspace/db run generate`        |
| Apply migrations       | `pnpm --filter @workspace/db run migrate`         |
| Website (port 5180)    | `pnpm --filter @workspace/ckbhse-website run dev` |
| API (port 5000)        | `pnpm --filter @workspace/api-server run dev`     |

## Appendix B — Authoritative Sources

| Question                               | Source                        |
| -------------------------------------- | ----------------------------- |
| What should the platform do?           | Document 02 (BRS)             |
| Why is the architecture this way?      | Document 03, and `docs/adr/`  |
| How should I write this code?          | This document                 |
| How do I run it? What are the gotchas? | `replit.md`                   |
| What does this endpoint accept?        | `lib/api-spec/openapi.yaml`   |
| What is the current debt?              | Document 03 §"Technical Debt" |

## Appendix C — Standards Referencing Unbuilt Layers

For clarity, these sections describe standards for code that does not exist yet, and exist so the first instance is correct rather than retrofitted: §3 (repositories), §4 (services), §10 (authentication and authorisation), §12 (database), and parts of §11 (file uploads). Sections describing existing code cite the files that establish the convention.

---

_End of document._
