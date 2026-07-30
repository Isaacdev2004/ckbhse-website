# Phase 02 — Milestone 1 (P4) Implementation Report

## Services & Consultancy Expansion

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 05 Milestone 1 — P4  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone 1 increment **P4 (Services & Consultancy Expansion)** transforms the Services section into the primary conversion engine of the CKBHSE public website. Built entirely on the locked P1–P3 architecture, this increment adds **38 dynamic service detail pages** across **six practice categories**, an enhanced Services Hub with search and filtering, reusable enterprise service components, and full SEO integration including Service and FAQ structured data.

All verification checks pass: typecheck, lint (0 errors), tests (+8 new tests), and production build with 61 indexable routes prerendered.

---

## Service Architecture

### Route pattern

```
/services                              → Services Hub
/services/:category/:slug              → Dynamic service detail pages
```

### Six practice categories

| Category ID             | Label                           | Services |
| ----------------------- | ------------------------------- | -------- |
| `health-safety`         | Health & Safety Consultancy     | 8        |
| `environmental`         | Environmental Consultancy       | 7        |
| `occupational-health`   | Occupational Health             | 5        |
| `iso-management`        | ISO & Management Systems        | 6        |
| `compliance-regulatory` | Compliance & Regulatory Support | 6        |
| `business-risk`         | Business Risk & Consultancy     | 6        |

**Total:** 38 service detail pages + 1 hub = 39 service routes

### Hub enhancements (`/services`)

- Hero with conversion-focused messaging
- Service overview and featured services
- Category filter (6 practice areas)
- Industry filter (6 sectors)
- Keyword search (title, summary, keywords)
- Why choose CKBHSE feature grid
- Delivery methodology timeline
- Engagement process steps
- Hub FAQs with FAQ schema
- Retainer CTA banner

---

## Content Model Extensions

**Location:** `lib/content/src/schemas/services.ts`

### Service detail page schema

Each service supports: slug, category, path, title, subtitle, hero, summary, overview, objectives, keyBenefits, industries, regulations, methodology, deliverables, timeline, expectedResults, faqs, relatedServices, relatedTraining, relatedCaseStudies, testimonial (placeholder-ready), cta, seo, breadcrumbs, keywords, featured.

### Hub schema

`servicesHubPageSchema` — categories, industry filters, featured services, overview, whyChoose, methodology, engagementProcess, faqs, retainerCta.

### Shared schema refactor

`pageHeroSchema` and `statItemSchema` moved to `base.ts` to resolve circular imports between pages, corporate, and services schemas.

### Data layer

```
lib/content/src/data/services/
  helpers.ts              → defineService() factory
  health-safety.ts        → 8 services
  environmental.ts        → 7 services
  occupational-health.ts  → 5 services
  iso-management.ts       → 6 services
  compliance-regulatory.ts→ 6 services
  business-risk.ts        → 6 services
  hub.ts                  → hub page content
  index.ts                → servicePageRegistry
```

**Catalog utilities:** `lib/content/src/services/catalog.ts` — filtering, path parsing, related service resolution.

---

## Dynamic Routing Strategy

- **Single route component:** `ServicePage` resolves content via `useRoute('/services/:category/:slug')` and `contentLoader.getServicePage()`
- **No hand-written TSX per service** — all pages rendered through `ServicePageView`
- **Route registration order:** dynamic `/services/:category/:slug` registered before `/services` in `App.tsx`
- **SEO registry:** `lib/seo/src/routes.ts` spreads `contentLoader.getServicePages()` — no duplicated route definitions

---

## Reusable Components

**Location:** `artifacts/ckbhse-website/src/components/services/`

| Component                  | Purpose                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `service-hero.tsx`         | Service detail hero banner                                                                     |
| `service-page-view.tsx`    | Full page template (overview, benefits, regulations, methodology, deliverables, FAQs, related) |
| `service-navigation.tsx`   | Category-grouped sidebar with active states                                                    |
| `faq-accordion.tsx`        | Accessible Radix accordion for FAQs                                                            |
| `related-services.tsx`     | Cross-linked service cards from metadata                                                       |
| `page-structured-data.tsx` | Per-page JSON-LD injection (Service, FAQ, BreadcrumbList)                                      |

Reused from P3: `FeatureGrid`, `CtaBanner`, `SectionReveal`, `PageShell`, `PageHead`.

---

## Search & Filtering

Implemented on the Services Hub using typed catalog data:

- **Category filter** — filters by `ServiceCategoryId`
- **Industry filter** — filters by industry slug metadata on each service
- **Keyword search** — matches title, summary, and keywords array
- **Featured services** — hub section driven by `featuredServices` refs in hub content
- **Alphabetical sort** — catalog sorted by title (future-ready for explicit sort controls)

Filter logic: `filterServiceCatalog()` in `@workspace/content/services/catalog`.

---

## Cross-Linking Strategy

Relationships defined in service content metadata — not hardcoded in TSX:

| Link type        | Source field           | Target                     |
| ---------------- | ---------------------- | -------------------------- |
| Related services | `relatedServices[]`    | Other service detail pages |
| Industries       | `industries[]`         | `/industries#{slug}`       |
| Training         | `relatedTraining[]`    | Training hub anchors       |
| Case studies     | `relatedCaseStudies[]` | Case studies hub           |
| Corporate        | Hub whyChoose CTA      | `/about/why-choose-us`     |
| Contact          | All service CTAs       | `/contact`                 |

Loader method `resolveRelatedServices()` resolves related service refs to full page content.

---

## SEO Implementation

### Automatic inheritance (P2)

All 38 service pages receive: metadata, canonical URLs, Open Graph, Twitter Cards, sitemap registration, prerender HTML shells.

### P4 additions

- **Service schema** (`Schema.org/Service`) — runtime via `PageStructuredData` on each detail page
- **FAQ schema** (`Schema.org/FAQPage`) — on service pages with FAQs and on Services Hub
- **BreadcrumbList schema** — via existing breadcrumb trail on detail pages

### Route counts

| Metric                  | P3  | P4  |
| ----------------------- | --- | --- |
| Total public routes     | 24  | 62  |
| Indexable routes        | 23  | 61  |
| Prerendered HTML shells | 23  | 61  |

---

## Accessibility Review

- Single `<h1>` per service page; section headings follow logical hierarchy
- FAQ accordion uses Radix UI with keyboard navigation and ARIA
- Service navigation sidebar with `aria-current="page"` for active service
- Search input has `aria-label`; filter buttons use `aria-pressed`
- Filter results region uses `aria-live="polite"`
- Industry links and related service cards are keyboard-focusable
- Reduced motion respected via existing `SectionReveal`

---

## Files Added

```
lib/content/src/schemas/services.ts
lib/content/src/schemas/services.test.ts
lib/content/src/services/catalog.ts
lib/content/src/data/services/helpers.ts
lib/content/src/data/services/hub.ts
lib/content/src/data/services/index.ts
lib/content/src/data/services/health-safety.ts
lib/content/src/data/services/environmental.ts
lib/content/src/data/services/occupational-health.ts
lib/content/src/data/services/iso-management.ts
lib/content/src/data/services/compliance-regulatory.ts
lib/content/src/data/services/business-risk.ts
artifacts/ckbhse-website/src/components/page-structured-data.tsx
artifacts/ckbhse-website/src/components/services/*.tsx (5 files)
artifacts/ckbhse-website/src/pages/service-page.tsx
docs/PHASE_02_M1_P4_IMPLEMENTATION_REPORT.md
```

---

## Files Modified

```
lib/content/src/schemas/base.ts           — pageHeroSchema, statItemSchema moved here
lib/content/src/schemas/pages.ts          — removed legacy hub service list schema
lib/content/src/schemas/corporate.ts      — import hero from base
lib/content/src/schemas/legal.ts          — import hero from base
lib/content/src/schemas/index.ts          — export services schemas
lib/content/src/data/services.ts          — re-export hub data
lib/content/src/data/site.ts              — nav/footer links to dynamic routes
lib/content/src/loader/index.ts           — service loader methods
lib/content/src/loader/index.test.ts      — service tests
lib/content/package.json                  — catalog export
lib/seo/src/routes.ts                     — service routes from loader
lib/seo/src/metadata.test.ts              — updated counts + schema tests
artifacts/ckbhse-website/src/App.tsx      — dynamic service route
artifacts/ckbhse-website/src/pages/services.tsx — enhanced hub
artifacts/ckbhse-website/src/lib/seo.ts   — export Service/FAQ schema builders
```

---

## Test Coverage

| Package       | Tests added/updated                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| `lib/content` | Service schema validation (38 pages), catalog filtering, path parsing, loader resolution, related services |
| `lib/seo`     | Route count 62/61, sitemap service URLs, Service + FAQ schema builders                                     |

**Totals:** 14 content tests, 10 SEO tests — all passing.

---

## Performance Review

- **Shared template** — one `ServicePageView` for all 38 services; no per-service JS bundles
- **Catalog computed once** — loader caches service pages and catalog
- **Client-side filtering** — no network requests for search/filter on hub
- **Build output** — main JS ~785 kB (+75 kB from P3; acceptable for 38 additional pages)
- **Prerender** — 38 additional HTML shells at build time

Future optimisation: code-split `ServicePageView` if bundle size becomes a concern.

---

## Verification Results

| Check                                   | Result |
| --------------------------------------- | ------ |
| TypeScript passes                       | ✅     |
| Lint passes (0 errors)                  | ✅     |
| Tests pass                              | ✅     |
| Production build passes                 | ✅     |
| Dynamic routes resolve correctly        | ✅     |
| Sitemap includes 38 service URLs        | ✅     |
| Prerender generates service HTML shells | ✅     |
| Metadata correct per service            | ✅     |
| Service + FAQ JSON-LD at runtime        | ✅     |
| Breadcrumbs on detail pages             | ✅     |
| Navigation updated (no redesign)        | ✅     |
| No duplicated page templates            | ✅     |
| P1–P3 preserved                         | ✅     |

---

## Remaining Work Before P5

P5 (Industries & Sector Expertise) can build on this foundation:

1. **Industry detail pages** — `/industries/:slug` using same dynamic pattern
2. **Industry–service cross-links** — bidirectional links from industry pages to relevant services
3. **Service comparison table** — schema-ready; UI component stubbed for future
4. **Testimonial carousel** — placeholder field exists; carousel UI for P5+
5. **Full-body prerender** — optional `PRERENDER_FULL=1` for service page content in HTML
6. **CMS migration** — swap `servicePageRegistry` for CMS source without changing components

---

_End of P4 Implementation Report_
