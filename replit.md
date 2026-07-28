# CKBHSE Enterprise Digital Platform

An HSEQ consultancy platform for CKBHSE Limited (UK): a public marketing site today, growing into a client portal, LMS, staff portal, and administration portal.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm run verify` — **what CI runs**: format check, lint, typecheck, test
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm run lint` / `pnpm run lint:fix` — ESLint across the workspace
- `pnpm run format` / `pnpm run format:check` — Prettier
- `pnpm run test` — all package test suites
- `pnpm --filter @workspace/ckbhse-website run dev` — public website (defaults to port 5180)
- `pnpm --filter @workspace/api-server run dev` — build + run the API server (defaults to port 5000)
- `pnpm --filter @workspace/mockup-sandbox run dev` — component preview sandbox (defaults to port 5181)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run generate` — generate a migration from schema changes (no database needed)
- `pnpm --filter @workspace/db run migrate` — apply pending migrations
- `pnpm --filter @workspace/db run check` — verify migration consistency
- `pnpm --filter @workspace/db run push` — push schema without a migration (throwaway dev databases only)

Env: copy `.env.example` to `.env`. Nothing is required for the website or API server locally — all values have defaults. `DATABASE_URL` becomes required as soon as anything imports `@workspace/db`.

The website's dev server proxies `/api` to the API server, so run both and use a single origin at `http://localhost:5180`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Quality gates: ESLint 10 (flat config), Prettier, Vitest + supertest, GitHub Actions
- Website: Vite 7 + React 19 + wouter + Tailwind v4 + shadcn/ui + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (API, ESM bundle), Vite (frontends)

## Where things live

- `artifacts/ckbhse-website` — the public marketing site. Routes are declared in `src/App.tsx`; the CKBHSE brand palette lives in `src/index.css`.
- `artifacts/api-server` — Express app. `src/app.ts` wires middleware, `src/routes/` holds routers.
- `artifacts/mockup-sandbox` — component preview harness; drop components in `src/components/mockups/` and open `/preview/<name>`.
- `lib/ui` — **the shared design system**, and the only copy of the shadcn/ui primitives. `src/components/` holds the 55 primitives, `src/hooks/`, `src/utils.ts` (`cn`), and `src/styles/base.css` for the Tailwind theme mapping and interaction utilities.
- `lib/api-spec/openapi.yaml` — **source of truth for API contracts.** Edit here, then run codegen.
- `lib/db/src/schema/` — **source of truth for the DB schema**, one file per table. Currently empty.
- `lib/api-client-react`, `lib/api-zod` — generated; do not hand-edit.
- `docs/02-architecture-assessment.md` — architecture review against the BRS, including the recommended target structure and refactor sequence.

## Using the design system

Import primitives by subpath, never through a barrel, so unused components stay out of the bundle:

```ts
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/utils";
import { useToast } from "@workspace/ui/hooks/use-toast";
```

A new app opts in with three lines of CSS, in this order, then declares its own palette:

```css
@import "tailwindcss";
@import "@workspace/ui/styles/base.css";
@source '../../../lib/ui/src'; /* Tailwind does not scan node_modules */
```

`base.css` owns the structural layer — the `@theme inline` mapping, the `elevate` interaction utilities, and the base resets. Each app owns only colour, font and radius values, declared as `--background`, `--primary`, `--app-font-sans` and friends on `:root` and `.dark`. That split is what lets the client portal, LMS and admin portal look different while sharing one component library.

To add a primitive, run `shadcn add` from `lib/ui`, which is where the only `components.json` lives.

## Architecture decisions

- **Vite SPA, not Next.js.** Document 01 specified Next.js App Router; we kept the existing Vite SPA and will meet the SEO requirement with prerendering plus per-route metadata rather than a framework migration. Document 01 is amended accordingly.
- **Drizzle, not Prisma.** Also a divergence from Document 01, kept because Drizzle is already wired into the Zod/Orval codegen chain.
- **Single-organisation tenancy.** A client user belongs to exactly one organisation. Organisation scoping is the boundary for the BRS data-isolation rule and must be enforced in the data-access layer, not in route handlers.
- **In-house authentication.** Session cookies, Argon2id hashing, MFA for internal roles. Chosen over a managed provider for full control over the eleven-role model and audit requirements. Note `lib/api-client-react/src/custom-fetch.ts` still exposes `setAuthTokenGetter`, which presumes bearer tokens — revisit when auth lands.
- **Permission-based authorization, never role string checks.** Roles map to permissions; guards resolve a permission plus a resource scope. Users may hold multiple roles.
- **One design system in `lib/ui`, colours owned by each app.** The BRS calls for four more front ends; the primitives are shared and the palette is per-app, so a portal can be visually distinct without forking components.

## Product

Live today: a public marketing website with Home, Services, Industries, Training, Knowledge, Case Studies, Careers and Contact pages, plus legal stubs. All content is currently hardcoded and no form submission is persisted.

Not built yet: client portal, LMS, staff portal, administration portal, and all authentication. See `docs/02-architecture-assessment.md` for the gap analysis.

## Gotchas

- **Prefer `generate` + `migrate` over `push`.** `push` mutates a database with no recorded history, which cannot satisfy the BRS audit and rollback requirements. It is kept only for throwaway dev databases.
- **No migrations exist yet** because `lib/db/src/schema/` is still empty, so `generate` and `check` are deliberately not yet part of CI. Add them once the first table lands.
- **The contact form discards input.** `artifacts/ckbhse-website/src/pages/contact.tsx` shows a success message without sending anything. Do not ship to a live domain until it is wired up.
- **CORS is an explicit allowlist.** Set `CORS_ORIGINS` (comma-separated) for any browser origin that is not same-origin. An unlisted origin gets a 403, which looks like a server bug if you forget.
- **`index.html` still has placeholder SEO metadata** and every route shares one title and description.
- **shadcn/ui primitives are treated as vendored code** in `eslint.config.mjs`: linted for genuine faults but exempt from React-idiom and stylistic rules, so `shadcn add` does not require re-patching. Do not "fix" lint in those files; fix it in our own code.
- **Never add a `components/ui/` directory to an app.** The primitives live only in `lib/ui`. The two apps previously each carried a copy and had already forked onto different shadcn generations; the app-level `components.json` files were deleted so that `shadcn add` cannot silently recreate the fork.
- **`lib/ui` deliberately defines no colours.** It maps Tailwind's theme onto custom properties that each app must supply. Adding a token to `base.css` without adding it to _every_ app's palette produces `hsl()` with an empty argument, which fails silently — the element just renders unstyled.
- **`'use client'` on 13 primitives is inert** in a Vite SPA and makes Rollup emit a "module level directives cause errors when bundled" warning during the website build. It is upstream shadcn code, left untouched so `shadcn add` stays clean.
- **Windows native binaries matter.** `pnpm-workspace.yaml` prunes platform binaries to keep Replit's store small, but win32-x64 is deliberately kept so local Windows development works. Do not re-add the win32-x64 exclusions.
- **Line endings are normalised to LF** via `.gitattributes`. Without it, every file touched on Windows shows as fully rewritten.
- **Vite ports are pinned with `strictPort`.** Defaults are 5180/5181 rather than Vite's 5173 to avoid colliding with other local Vite projects.
- The website bundles to a single ~577 kB JS chunk with no route-level code splitting.

## User preferences

- Development is document-driven. Numbered specification documents are the contract; align code to them and record divergences here.
- The user acts as Solution Architect, Product Owner, and Technical Lead; architectural decisions are escalated to them rather than assumed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
