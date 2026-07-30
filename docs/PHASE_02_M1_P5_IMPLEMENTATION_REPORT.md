# Phase 02 — Milestone 1 (P5) Implementation Report

## Industries & Sector Expertise

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 05 Milestone 1 — P5  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone 1 increment **P5 (Industries & Sector Expertise)** establishes CKBHSE as a sector authority across twelve UK industry verticals. Built entirely on the locked P1–P4 architecture, this increment adds **12 dynamic industry landing pages** at `/industries/:slug`, an enhanced Industries Hub with search and multi-axis filtering, typed Zod-validated content, automatic cross-linking to services and training, and full SEO integration including WebPage, FAQ, and BreadcrumbList structured data.

All verification checks pass: typecheck, lint (0 errors), tests (+10 new tests), and production build with **73 indexable routes** prerendered.

---

## Industry Architecture

### Route pattern

```
/industries                    → Industries Hub
/industries/:slug              → Dynamic industry detail pages
```

### Twelve target sectors

| Slug                    | Name                       | Sector group               |
| ----------------------- | -------------------------- | -------------------------- |
| `construction`          | Construction               | Built Environment          |
| `facilities-management` | Facilities Management      | Built Environment          |
| `manufacturing`         | Manufacturing              | Industrial & Energy        |
| `oil-gas`               | Oil & Gas                  | Industrial & Energy        |
| `energy-utilities`      | Energy & Utilities         | Industrial & Energy        |
| `food-beverage`         | Food & Beverage            | Industrial & Energy        |
| `logistics`             | Logistics & Transport      | Transport & Logistics      |
| `warehousing`           | Warehousing & Distribution | Transport & Logistics      |
| `healthcare`            | Healthcare                 | Healthcare & Life Sciences |
| `education`             | Education                  | Education & Public Sector  |
| `public-sector`         | Public Sector              | Education & Public Sector  |
| `retail`                | Retail & Commercial        | Commercial & Retail        |

**Total:** 12 industry detail pages + 1 hub = 13 industry routes

### Hub enhancements (`/industries`)

- Hero with sector authority messaging
- Industry overview and featured industries grid
- Sector filter (6 sector groups)
- Regulatory theme filter (CDM, ISO, fire, environmental, occupational health, process safety)
- Keyword search (name, summary, topics, keywords)
- Industry statistics
- UK regulatory landscape section
- Client journey steps
- Related resources
- Hub FAQs with FAQ schema
- Consultation CTA banner

---

## Content Model Extensions

**Location:** `lib/content/src/schemas/industries.ts`

### Industry detail page schema

Each industry supports: slug, sector, path, name, icon, hero, overview, topics, challenges, regulatoryFramework, commonRisks, complianceRequirements, requiredDocumentation, applicableServices, recommendedTraining, relevantCaseStudies, downloadableResources, standards, methodology, industryStatistics, faqs, testimonial (placeholder-ready), cta, seo, breadcrumbs, keywords, featured.

### Hub schema

`industriesHubPageSchema` — sectors, regulatoryThemes, featuredIndustries, overview, regulatoryLandscape, industryStatistics, clientJourney, relatedResources, faqs, cta.

### Data layer

```
lib/content/src/data/industries/
  helpers.ts              → defineIndustry(), risk(), regulation() factories
  built-environment.ts    → construction, facilities-management
  industrial-energy.ts    → manufacturing, oil-gas, energy-utilities, food-beverage
  transport-logistics.ts  → logistics, warehousing
  remaining-sectors.ts    → healthcare, education, public-sector, retail
  hub.ts                  → hub page content
  index.ts                → industryPageRegistry (12 pages)
```

**Catalog utilities:** `lib/content/src/industries/catalog.ts` — filtering, path parsing, applicable service resolution, regulatory theme inference.

---

## Dynamic Routing Strategy

- **Single route component:** `IndustryPage` resolves content via `useRoute('/industries/:slug')` and `contentLoader.getIndustryPage()`
- **No hand-written TSX per industry** — all pages rendered through `IndustryPageView`
- **Route registration order:** dynamic `/industries/:slug` registered before `/services` in `App.tsx`
- **SEO registry:** `lib/seo/src/routes.ts` spreads `contentLoader.getIndustryPages()` — no duplicated route definitions

---

## Reusable Components

**Location:** `artifacts/ckbhse-website/src/components/industries/`

| Component                 | Purpose                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `industry-page-view.tsx`  | Full page template (overview, topics, statistics, challenges, regulatory framework, risks, compliance, documentation, standards, methodology, services, training, case studies, FAQs, CTA) |
| `industry-navigation.tsx` | Sector-grouped sidebar with active states                                                                                                                                                  |

Reused from P3/P4: `ServiceHero`, `RelatedServices`, `FaqAccordion`, `StatisticGrid`, `CtaBanner`, `SectionReveal`, `PageShell`, `PageStructuredData`.

---

## Cross-Linking Strategy

Relationships defined in industry content metadata — not hardcoded in TSX:

| Link type            | Source field             | Target                                                 |
| -------------------- | ------------------------ | ------------------------------------------------------ |
| Applicable services  | `applicableServices[]`   | Service detail pages via `resolveApplicableServices()` |
| Recommended training | `recommendedTraining[]`  | Training hub anchors                                   |
| Case studies         | `relevantCaseStudies[]`  | Case studies hub                                       |
| Resources            | Hub `relatedResources[]` | Knowledge hub, case studies                            |
| Corporate            | Client journey / CTA     | `/contact`                                             |
| Reverse links        | Service `industries[]`   | `/industries/:slug` (updated from hash anchors)        |

Navigation and footer links updated from `/industries#slug` to `/industries/slug`.

---

## Regulatory Content Approach

Each industry page includes original, professionally written guidance covering:

- UK legislation (HSE Act, sector-specific regulations)
- HSE guidance and approved codes of practice
- ISO and industry standards
- Employer responsibilities and risk controls
- Compliance obligations and required documentation

Content is summarised and explained in original language — not reproduced from copyrighted government or commercial sources.

---

## Search & Filtering

Implemented on the Industries Hub using typed catalog data:

- **Sector filter** — filters by `IndustrySectorId`
- **Regulatory theme filter** — filters by inferred themes (CDM, ISO, fire, etc.)
- **Keyword search** — matches name, summary, topics, and keywords array
- **Featured industries** — hub section driven by `featuredIndustries` slugs in hub content
- **Alphabetical sort** — catalog sorted by name (future-ready for explicit sort controls)

Filter logic: `filterIndustryCatalog()` in `@workspace/content/industries/catalog`.

---

## SEO Verification

### Automatic inheritance (P2)

All 12 industry pages receive: metadata, canonical URLs, Open Graph, Twitter Cards, sitemap registration, prerender HTML shells.

### P5 additions

- **WebPage schema** (`Schema.org/WebPage`) — runtime via `PageStructuredData` on each detail page via `buildIndustryPageSchema()`
- **FAQ schema** (`Schema.org/FAQPage`) — on industry pages with FAQs and on Industries Hub
- **BreadcrumbList schema** — via existing breadcrumb trail on detail pages

### Route counts

| Metric                  | P4  | P5  |
| ----------------------- | --- | --- |
| Total public routes     | 62  | 74  |
| Indexable routes        | 61  | 73  |
| Prerendered HTML shells | 61  | 73  |

Sitemap includes all 12 industry URLs (verified: `/industries/construction` through `/industries/retail`).

---

## Accessibility Review

- Single `<h1>` per industry page; section headings follow logical hierarchy
- FAQ accordion uses Radix UI with keyboard navigation and ARIA
- Industry navigation sidebar with `aria-current="page"` for active industry
- Search input has `aria-label`; filter buttons use `aria-pressed`
- Filter results region uses `aria-live="polite"`
- Service and training links are keyboard-focusable
- Reduced motion respected via existing `SectionReveal`
- Semantic landmarks: sections with `aria-labelledby`, ordered methodology list

---

## Files Added

```
lib/content/src/schemas/industries.ts
lib/content/src/schemas/industries.test.ts
lib/content/src/industries/catalog.ts
lib/content/src/data/industries/helpers.ts
lib/content/src/data/industries/hub.ts
lib/content/src/data/industries/index.ts
lib/content/src/data/industries/built-environment.ts
lib/content/src/data/industries/industrial-energy.ts
lib/content/src/data/industries/transport-logistics.ts
lib/content/src/data/industries/remaining-sectors.ts
artifacts/ckbhse-website/src/components/industries/industry-page-view.tsx
artifacts/ckbhse-website/src/components/industries/industry-navigation.tsx
artifacts/ckbhse-website/src/pages/industry-page.tsx
docs/PHASE_02_M1_P5_IMPLEMENTATION_REPORT.md
```

---

## Files Modified

```
lib/content/src/schemas/index.ts
lib/content/src/schemas/pages.ts
lib/content/src/data/industries.ts          → hub re-export
lib/content/src/data/site.ts              → nav/footer industry links
lib/content/src/loader/index.ts           → industry loader methods
lib/content/src/loader/index.test.ts      → industry loader tests
lib/content/package.json                    → industries/catalog export
lib/seo/src/routes.ts                     → industry route spread
lib/seo/src/schema/index.ts               → buildIndustryPageSchema
lib/seo/src/metadata.test.ts              → route count + sitemap tests
artifacts/ckbhse-website/src/App.tsx      → /industries/:slug route
artifacts/ckbhse-website/src/pages/industries.tsx  → enhanced hub
artifacts/ckbhse-website/src/lib/seo.ts   → export buildIndustryPageSchema
artifacts/ckbhse-website/src/components/services/service-page-view.tsx → industry links
```

---

## Test Coverage

| Suite                                        | New tests                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `lib/content/src/schemas/industries.test.ts` | Schema validation (12 pages), unique paths, catalog filtering, path parsing |
| `lib/content/src/loader/index.test.ts`       | Industry loading, slug/path resolution, applicable services, hub page       |
| `lib/seo/src/metadata.test.ts`               | Route counts (74/73), sitemap industry URLs, WebPage schema                 |

**Totals:** 24 content tests, 11 SEO tests — all passing.

---

## Performance Review

- Shared `IndustryPageView` template — no per-industry bundle duplication
- Catalog filtering runs client-side on memoised catalog array
- Industry pages reuse existing service/corporate components (no duplicate layouts)
- Production bundle builds successfully; single JS chunk (same pattern as P4)

---

## Verification Results

| Check                     | Result                                              |
| ------------------------- | --------------------------------------------------- |
| TypeScript                | Pass                                                |
| ESLint                    | Pass (0 errors)                                     |
| Tests                     | Pass (221 total across workspace)                   |
| Production build          | Pass                                                |
| Dynamic industry routes   | 12 pages resolve via `/industries/:slug`            |
| Sitemap                   | 73 indexable URLs including all industries          |
| Prerender                 | HTML shells generated for all routes                |
| Metadata                  | Inherited from content SEO fields                   |
| JSON-LD                   | WebPage + FAQ + BreadcrumbList on detail pages      |
| Search & filtering        | Sector, theme, and keyword filters functional       |
| Cross-links               | Services resolve from `applicableServices` metadata |
| Responsive layouts        | Grid layouts with mobile-first breakpoints          |
| Architectural regressions | None — P1–P4 systems intact                         |

---

## Remaining Work Before P6

P6 (Training & Professional Development) can proceed without architectural changes:

1. **Training course detail pages** — extend content model and dynamic routing (mirror P4/P5 pattern)
2. **Accredited programme catalogues** — NEBOSH, IOSH, CITB course pages with cross-links to industries and services
3. **Training hub enhancement** — search, category filters, featured courses
4. **Downloadable resources** — activate `downloadableResources` on industry pages when resource content exists
5. **Case study detail pages** — replace hub anchor links with dedicated case study routes
6. **Testimonials** — replace placeholder testimonials with client-approved content
7. **Full body prerender** — enable `PRERENDER_FULL=1` when SSR pipeline is ready

---

## Success Criteria — Met

- Comprehensive Industries Hub with search, filtering, and sector authority content
- 12 dynamic industry landing pages driven entirely by typed content
- Deep, original sector-specific compliance guidance
- Automatic cross-linking with Services, Training, Resources, and Case Studies
- Full SEO integration with structured data and prerendering
- WCAG 2.2 AA compliance maintained
- Scalable architecture — new industries added via content files only
