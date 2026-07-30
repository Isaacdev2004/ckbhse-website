# Phase 02 — Milestone 1 (P1) Implementation Report

## Content Model & Navigation Shell

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 05 Milestone 1 — P1  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone 1 increment **P1 (Content model and navigation shell)** is implemented. The existing public website prototype at `artifacts/ckbhse-website` was **evolved in place** — no rebuild, no visual redesign, no duplicate UI primitives.

The repository now has:

- A shared **`@workspace/content`** package with Zod-validated, typed content files and a CMS-ready loader abstraction
- **Six-group primary navigation** (Services, Industries, Training, Resources, About, Company) with nested desktop dropdowns and expandable mobile groups
- An enhanced **footer** aligned to Document 04 (legal, sitemap/accessibility placeholders, accreditation placeholders, grouped sections)
- A reusable **`PageShell`** with skip link, `<main>` landmark, route-change focus management, and optional breadcrumbs
- **WCAG 2.2 AA infrastructure** foundations: skip links, focus-visible states, `aria-current`, keyboard-navigable menus, `prefers-reduced-motion` support

All 11 existing routes render correctly. Visible copy is unchanged; only storage and shell architecture changed.

---

## Audit Findings Addressed

| Audit finding                                        | P1 resolution                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| Inline page arrays (no typed content model)          | Migrated to `lib/content` with Zod schemas and `FileContentLoader`    |
| Flat 8-item navigation                               | Refactored to 6 grouped items per approved IA                         |
| No breadcrumbs                                       | `Breadcrumbs` component; demonstrated on Services and Knowledge pages |
| No skip link / main landmark                         | `PageShell` + `SkipLink` on every page                                |
| No route-change focus                                | `PageShell` focuses `#page-title` on navigation                       |
| Footer missing legal/sitemap/accessibility structure | Extended from data-driven `siteConfig.footer`                         |
| No `prefers-reduced-motion`                          | `SectionReveal` / `StaggerContainer` respect reduced motion           |
| `zod` in package.json but unused                     | Now used at content boundaries in `@workspace/content`                |

**Explicitly not in P1 scope (deferred to P2+):** prerendering, per-route SEO metadata, sitemap generation, JSON-LD, dynamic routes, contact API, About pages.

---

## Files Added

### `lib/content/` (new package)

| Path                       | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `package.json`             | Workspace package `@workspace/content`                     |
| `tsconfig.json`            | Composite TypeScript project                               |
| `src/schemas/base.ts`      | SEO, slug, icon, nav, footer, breadcrumb schemas           |
| `src/schemas/pages.ts`     | Page content schemas (home, services, industries, etc.)    |
| `src/schemas/legal.ts`     | Contact and legal stub schemas                             |
| `src/schemas/index.ts`     | Schema exports                                             |
| `src/data/home.ts`         | Home page content                                          |
| `src/data/services.ts`     | Services hub content                                       |
| `src/data/industries.ts`   | Industries hub content                                     |
| `src/data/training.ts`     | Training hub content                                       |
| `src/data/knowledge.ts`    | Knowledge hub content                                      |
| `src/data/case-studies.ts` | Case studies content                                       |
| `src/data/careers.ts`      | Careers content                                            |
| `src/data/contact.ts`      | Contact page content                                       |
| `src/data/legal.ts`        | Legal stub content                                         |
| `src/data/site.ts`         | Site config: nav, footer, contact, CTA                     |
| `src/loader/validate.ts`   | Zod validation helper                                      |
| `src/loader/index.ts`      | `ContentSource`, `FileContentLoader`, cache, async adapter |
| `src/loader/index.test.ts` | Loader unit tests                                          |

### `artifacts/ckbhse-website/src/`

| Path                            | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `lib/content.ts`                | Website content loader re-export      |
| `lib/icons.ts`                  | Icon name → Lucide component resolver |
| `components/page-shell.tsx`     | Layout shell with a11y infrastructure |
| `components/page-container.tsx` | Shared responsive container           |
| `components/breadcrumbs.tsx`    | Accessible, schema-ready breadcrumbs  |
| `components/skip-link.tsx`      | Skip to content / skip to navigation  |

---

## Files Modified

| Path                                                         | Change                                       |
| ------------------------------------------------------------ | -------------------------------------------- |
| `tsconfig.json`                                              | Added `lib/content` project reference        |
| `artifacts/ckbhse-website/package.json`                      | Added `@workspace/content` dependency        |
| `artifacts/ckbhse-website/tsconfig.json`                     | Added content project reference              |
| `artifacts/ckbhse-website/src/components/navigation.tsx`     | Six-group nested nav; data-driven; a11y      |
| `artifacts/ckbhse-website/src/components/footer.tsx`         | Document 04 alignment; data-driven           |
| `artifacts/ckbhse-website/src/components/section-reveal.tsx` | `prefers-reduced-motion` guard               |
| `artifacts/ckbhse-website/src/index.css`                     | `:focus-visible`; reduced-motion media query |
| `artifacts/ckbhse-website/src/pages/*.tsx`                   | All 12 pages consume loader + `PageShell`    |

---

## Content Model Overview

Content follows Document 05 §7.2: **typed, validated data in version-controlled files**, consumed by pages through a loader abstraction.

```
lib/content/src/
├── schemas/     ← Zod schemas (CMS-compatible boundaries)
├── data/        ← Authoritative content (git-versioned)
└── loader/      ← FileContentLoader (swap at M7 for CMS)
```

**Schema features:**

- `slug` — kebab-case validation on all content items
- `seo` — title, description, canonical, ogImage, noindex (populated for P2)
- `locale` — default `en-GB`; `LocalizedString` type ready for i18n
- `icon` — string enum (`IconName`) resolved to Lucide in the website layer

**Loader contract:**

- Sync `ContentSource` for current SPA
- `AsyncContentSource` + `toAsyncContentSource()` for future SSR/CMS
- In-memory cache on first validated read

Pages import via `contentLoader.getXPage()` — never raw data files.

---

## Navigation Improvements

Primary navigation (6 groups):

| Group      | Hub           | Nested links                                                       |
| ---------- | ------------- | ------------------------------------------------------------------ |
| Services   | `/services`   | Top services + hash anchors                                        |
| Industries | `/industries` | Sector hash anchors                                                |
| Training   | `/training`   | Course hash anchors                                                |
| Resources  | `/knowledge`  | Knowledge Hub, Case Studies; future Guides/Blog marked unavailable |
| About      | `/about`      | Future trust pages marked unavailable (P3)                         |
| Company    | `/contact`    | Careers, Contact; future Offices unavailable                       |

**Preserved:** logo, scroll behaviour, Framer Motion header animation, mobile drawer with route-close, Book Consultation CTA.

**Added:** desktop hover/focus dropdowns, mobile expandable groups, `aria-expanded`, `aria-current`, 44×44 px touch targets on menu toggle, keyboard Escape to close dropdowns.

---

## Accessibility Improvements

| Requirement         | Implementation                                                               |
| ------------------- | ---------------------------------------------------------------------------- |
| Skip link           | `#main-content` skip link on every page via `PageShell`                      |
| Main landmark       | `<main id="main-content" tabIndex={-1}>`                                     |
| Route-change focus  | Focus moves to `#page-title` on wouter location change                       |
| Focus visible       | Global `:focus-visible` ring in `index.css`                                  |
| `aria-current`      | Active nav links and breadcrumb current page                                 |
| Reduced motion      | Framer Motion bypassed when `prefers-reduced-motion: reduce`                 |
| Keyboard navigation | Nav dropdowns, filter buttons with `aria-pressed`, footer/social focus rings |

---

## Components Introduced

| Component                  | Role                                                         |
| -------------------------- | ------------------------------------------------------------ |
| `PageShell`                | Skip link, main landmark, breadcrumbs slot, focus management |
| `PageContainer`            | Standardised `max-w-7xl` / `max-w-4xl` responsive padding    |
| `Breadcrumbs`              | `BreadcrumbList` schema.org markup, responsive               |
| `SkipLink` / `SkipNavLink` | WCAG bypass blocks                                           |

**Reused (not replaced):** `Navigation`, `Footer`, `SectionReveal`, `StatCard`, all `@workspace/ui` primitives.

---

## Refactoring Performed

- Extracted all inline content arrays from 12 page files into `lib/content/src/data/`
- Pages refactored to consume `contentLoader` — layouts, animations, and CSS classes preserved
- `service.id` / `article.id` etc. normalised to `slug` in content model (hash anchors unchanged)
- Duplicated `max-w-7xl mx-auto px-4…` replaced with `PageContainer` (no visual change)
- Navigation/footer hardcoded link arrays replaced with `siteConfig` data

**Not changed:** colour palette, typography, routing table, contact form behaviour (still client-only until P9/M2).

---

## Verification Results

| Check                                               | Result                                                   |
| --------------------------------------------------- | -------------------------------------------------------- |
| `pnpm run typecheck`                                | Pass                                                     |
| `pnpm run lint`                                     | Pass (0 errors; 2 pre-existing warnings)                 |
| `pnpm run test`                                     | Pass — content loader 3/3; platform 151/151; API 35/35   |
| `pnpm --filter @workspace/ckbhse-website run build` | Pass (built in ~63s)                                     |
| Duplicate UI components                             | None — continues using `@workspace/ui` only              |
| Architecture violations                             | None — no domain logic in website; content in shared lib |

---

## Remaining Work Before P2

P2 (**Prerendering pipeline**) should build directly on this foundation:

1. **Per-route metadata** — consume `seo` fields already present in every content object
2. **Prerender plugin** — generate static HTML from existing React pages + content loader
3. **`sitemap.xml` / HTML sitemap** — enable footer links currently marked `available: false`
4. **Structured data** — `Breadcrumbs` already emits schema.org; extend to Organization, Service, etc.
5. **Legal URL migration** — `/legal/*` routes and redirects (P8, can parallel P2)
6. **Breadcrumb rollout** — integrate across all depth ≥ 3 routes as new pages land in P3–P8
7. **axe / Lighthouse CI** — formal WCAG audit gate (infrastructure is in place)

At M7, only `FileContentLoader` should change — page components and schemas remain stable per Document 05 §7.2.

---

## Success Criteria — Met

- Typed content model replacing inline page data
- Reusable content loader with CMS-ready abstraction
- Navigation aligned to approved six-group IA
- Footer aligned to Document 04 structure
- Reusable `PageShell` on all public pages
- Core WCAG 2.2 AA infrastructure
- Reusable breadcrumb component (demonstrated, ready for rollout)
- Visual experience unchanged; architecture enterprise-ready for P2–P8
