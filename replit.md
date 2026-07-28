# CKBHSE Enterprise Digital Platform

An HSEQ consultancy platform for CKBHSE Limited (UK): a public marketing site today, growing into a client portal, LMS, staff portal, and administration portal.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/ckbhse-website run dev` — public website (defaults to port 5180)
- `pnpm --filter @workspace/api-server run dev` — build + run the API server (defaults to port 5000)
- `pnpm --filter @workspace/mockup-sandbox run dev` — component preview sandbox (defaults to port 5181)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only; see Gotchas)

Env: copy `.env.example` to `.env`. Nothing is required for the website or API server locally — all values have defaults. `DATABASE_URL` becomes required as soon as anything imports `@workspace/db`.

The website's dev server proxies `/api` to the API server, so run both and use a single origin at `http://localhost:5180`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Website: Vite 7 + React 19 + wouter + Tailwind v4 + shadcn/ui + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (API, ESM bundle), Vite (frontends)

## Where things live

- `artifacts/ckbhse-website` — the public marketing site. Routes are declared in `src/App.tsx`; brand design tokens live in `src/index.css`.
- `artifacts/api-server` — Express app. `src/app.ts` wires middleware, `src/routes/` holds routers.
- `artifacts/mockup-sandbox` — component preview harness; drop components in `src/components/mockups/` and open `/preview/<name>`.
- `lib/api-spec/openapi.yaml` — **source of truth for API contracts.** Edit here, then run codegen.
- `lib/db/src/schema/` — **source of truth for the DB schema**, one file per table. Currently empty.
- `lib/api-client-react`, `lib/api-zod` — generated; do not hand-edit.
- `docs/02-architecture-assessment.md` — architecture review against the BRS, including the recommended target structure and refactor sequence.

## Architecture decisions

- **Vite SPA, not Next.js.** Document 01 specified Next.js App Router; we kept the existing Vite SPA and will meet the SEO requirement with prerendering plus per-route metadata rather than a framework migration. Document 01 is amended accordingly.
- **Drizzle, not Prisma.** Also a divergence from Document 01, kept because Drizzle is already wired into the Zod/Orval codegen chain.
- **Single-organisation tenancy.** A client user belongs to exactly one organisation. Organisation scoping is the boundary for the BRS data-isolation rule and must be enforced in the data-access layer, not in route handlers.
- **In-house authentication.** Session cookies, Argon2id hashing, MFA for internal roles. Chosen over a managed provider for full control over the eleven-role model and audit requirements. Note `lib/api-client-react/src/custom-fetch.ts` still exposes `setAuthTokenGetter`, which presumes bearer tokens — revisit when auth lands.
- **Permission-based authorization, never role string checks.** Roles map to permissions; guards resolve a permission plus a resource scope. Users may hold multiple roles.

## Product

Live today: a public marketing website with Home, Services, Industries, Training, Knowledge, Case Studies, Careers and Contact pages, plus legal stubs. All content is currently hardcoded and no form submission is persisted.

Not built yet: client portal, LMS, staff portal, administration portal, and all authentication. See `docs/02-architecture-assessment.md` for the gap analysis.

## Gotchas

- **`lib/db` has no migrations.** Only `push`/`push-force` exist, which mutate the database with no recorded history. Move to versioned `generate`/`migrate` before creating the first table — the BRS requires audit trails and rollback.
- **The contact form discards input.** `artifacts/ckbhse-website/src/pages/contact.tsx` shows a success message without sending anything. Do not ship to a live domain until it is wired up.
- **CORS is wide open.** `app.use(cors())` in `artifacts/api-server/src/app.ts` allows all origins. Replace with an allowlist before any authenticated endpoint exists.
- **`index.html` still has placeholder SEO metadata** and every route shares one title and description.
- **Windows native binaries matter.** `pnpm-workspace.yaml` prunes platform binaries to keep Replit's store small, but win32-x64 is deliberately kept so local Windows development works. Do not re-add the win32-x64 exclusions.
- **Line endings are normalised to LF** via `.gitattributes`. Without it, every file touched on Windows shows as fully rewritten.
- **Vite ports are pinned with `strictPort`.** Defaults are 5180/5181 rather than Vite's 5173 to avoid colliding with other local Vite projects.
- The website bundles to a single ~577 kB JS chunk with no route-level code splitting.

## User preferences

- Development is document-driven. Numbered specification documents are the contract; align code to them and record divergences here.
- The user acts as Solution Architect, Product Owner, and Technical Lead; architectural decisions are escalated to them rather than assumed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
