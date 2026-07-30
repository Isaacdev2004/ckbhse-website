# Phase 02 — Milestone 1 (P7) Implementation Report

## Resources, Knowledge Centre & Thought Leadership

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 05 Milestone 1 — P7  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone 1 increment **P7 (Resources, Knowledge Centre & Thought Leadership)** transforms the legacy Knowledge Hub stub into a scalable **Knowledge Centre** at `/resources`. Built entirely on the locked P1–P6 architecture, this increment adds **33 dynamic resource detail pages** across **seven resource types**, an enhanced hub with enterprise search and multi-axis filtering, downloadable asset support, webinar architecture, regulatory update cards, metadata-driven cross-linking, and full SEO integration including Article, NewsArticle, Event, and FAQ structured data.

All verification checks pass: typecheck, lint (0 errors), tests (+13 new tests), and production build with **135 indexable routes** prerendered. Legacy `/knowledge` redirects to `/resources` for backward compatibility.

---

## Resource Architecture

### Route pattern

```
/resources                              → Knowledge Centre hub
/resources/:type/:slug                  → Dynamic resource detail pages
/knowledge                              → Redirect to /resources (legacy)
```

### Seven route-level resource types

| Type ID        | Label           | Count |
| -------------- | --------------- | ----- |
| `articles`     | Articles        | 10    |
| `guides`       | Guides          | 5     |
| `templates`    | Templates       | 4     |
| `checklists`   | Checklists      | 3     |
| `webinars`     | Webinars        | 4     |
| `news`         | News & Updates  | 4     |
| `publications` | Publications    | 3     |

**Total:** 33 resource detail pages + 1 hub = 34 resource routes

The `resourceTypeIdSchema` enum is extensible — additional types (e.g. white papers, infographics, toolkits) can be added without routing or template redesign.

### Hub enhancements (`/resources`)

- Hero with Knowledge Centre positioning
- Featured resources grid
- Latest publications and popular downloads sections
- Trending topics
- Keyword search
- Type filter (7 resource types)
- Topic, industry, author, and reading-time filters
- Latest regulatory updates (news cards)
- Webinar spotlight (upcoming, recorded, on-demand)
- Download centre section
- Newsletter signup placeholder
- Hub FAQs with FAQ schema
- Consultation CTA banner

---

## Content Model

**Location:** `lib/content/src/schemas/resources.ts`

### Resource detail page schema (`resourcePageSchema`)

Each resource supports: slug, type, path, title, subtitle, icon, summary, author, publishDate, updatedDate, readingTime, featuredImage, body (typed content blocks), downloadableFiles, webinar details, regulatoryType, tags, industries, relatedServices, relatedTraining, relatedCourses, relatedResources, relatedCaseStudies, references, faqs, cta, seo, breadcrumbs, keywords, featured.

### Hub schema (`resourcesHubPageSchema`)

resourceTypes, topicFilters, industryFilters, authorFilters, readingTimeFilters, featuredResources, popularDownloads, trendingTopics, regulatoryUpdates, webinarSpotlight, overview, newsletterCta, downloadCentre, faqs, consultationCta.

`KnowledgePageContent` remains a backward-compatible alias for `ResourcesHubPageContent`.

### Data layer

```
lib/content/src/data/resources/
  helpers.ts                → defineResource() factory, content blocks, cross-ref helpers
  articles.ts               → 10 articles
  guides-templates.ts       → 5 guides, 4 templates, 3 checklists
  webinars-news-pubs.ts     → 4 webinars, 4 news, 3 publications
  hub.ts                    → hub page content
  index.ts                  → resourcePageRegistry (33 resources)
```

**Catalog utilities:** `lib/content/src/resources/catalog.ts` — filtering, path parsing, related resource/service/course resolution, hub section resolution.

---

## Dynamic Routing Strategy

- **Single route component:** `ResourcePage` resolves content via `useRoute('/resources/:type/:slug')` and `contentLoader.getResourcePage()`
- **No hand-written TSX per resource** — all pages rendered through `ResourcePageView`
- **Route registration order:** dynamic `/resources/:type/:slug` registered before `/resources` in `App.tsx`
- **SEO registry:** `lib/seo/src/routes.ts` spreads `contentLoader.getResourcePages()` — no duplicated route definitions
- **Legacy redirect:** `/knowledge` → `/resources` via Wouter `Redirect`

---

## Search & Filtering

Implemented on the Knowledge Centre hub using typed catalog data:

| Filter            | Implementation                                      |
| ----------------- | --------------------------------------------------- |
| Keyword search    | Title, summary, author, tags, keywords              |
| Type              | `ResourceTypeId` route segment                      |
| Topic             | Tag match against resource metadata                 |
| Industry          | Industry slug metadata                              |
| Author            | Author name match                                   |
| Publication year  | Parsed from `publishDate`                           |
| Reading time      | Short (≤5 min), medium (5–10 min), long (>10 min)   |
| Downloadable only | Resources with `downloadableFiles`                  |
| Featured only     | Resources with `featured: true`                     |

Filter logic: `filterResourceCatalog()` in `@workspace/content/resources/catalog`.

---

## Downloads

Downloadable assets are modelled via `downloadableFileSchema`:

- Supported file types: PDF, DOCX, XLSX, ZIP
- Fields: name, description, fileType, url, size
- No backend upload system — URLs reference static asset paths designed for future storage integration (S3, CDN, CMS media library)

Examples in content: risk assessment template (DOCX), site safety checklist (XLSX), toolbox talk pack (ZIP).

---

## Webinars

Webinar resources support `webinarDetailsSchema`:

| Status       | Purpose                          |
| ------------ | -------------------------------- |
| `upcoming`   | Scheduled live sessions          |
| `recorded`   | Past live sessions with replay   |
| `on-demand`  | Always-available recordings      |

Fields: status, scheduledDate, duration, registrationUrl. Architecture only — no booking backend. Event schema applied at runtime for upcoming webinars with scheduled dates.

---

## Regulatory Updates

News resources support `regulatoryType` classification:

- `legislation`
- `hse-guidance`
- `iso-update`
- `best-practice`

Hub `regulatoryUpdates` section resolves news items into reusable update cards. News detail pages receive NewsArticle structured data.

---

## Cross-Linking Strategy

Relationships defined in resource content metadata — not hardcoded in TSX:

| Link type            | Source field           | Target resolution                     |
| -------------------- | ---------------------- | ------------------------------------- |
| Related resources    | `relatedResources[]`   | `resolveRelatedResources()`           |
| Related services     | `relatedServices[]`    | `resolveResourceServices()`           |
| Related courses      | `relatedCourses[]`     | `resolveResourceCourses()`            |
| Industries           | `industries[]`         | `/industries/:slug`                   |
| Case studies         | `relatedCaseStudies[]` | `/case-studies` (P8 expansion)        |
| Hub featured sections| Typed refs             | `resolveHubResources()`               |

Navigation and footer updated from `/knowledge` to `/resources`. Industry hub quick link updated to Knowledge Centre.

---

## SEO Verification

### Automatic inheritance (P2)

All 33 resource pages receive: metadata, canonical URLs, Open Graph, Twitter Cards, sitemap registration, prerender HTML shells.

### P7 additions

- **Article schema** — guides, articles, templates, checklists, publications, recorded webinars
- **NewsArticle schema** — news and regulatory update resources
- **Event schema** — upcoming webinars with scheduled dates
- **FAQ schema** — on resource detail pages and hub
- **BreadcrumbList schema** — via existing breadcrumb trail on detail pages

### Route counts

| Metric                  | P6  | P7  |
| ----------------------- | --- | --- |
| Total public routes     | 103 | 136 |
| Indexable routes        | 102 | 135 |
| Prerendered HTML shells | 102 | 135 |

Sitemap includes all 33 resource URLs plus `/resources` hub (verified: `/resources/articles/understanding-cdm-2015` and siblings).

---

## Accessibility Review

- Single `<h1>` per resource page; section headings follow logical hierarchy via typed content blocks
- FAQ accordion uses Radix UI with keyboard navigation and ARIA
- Resource navigation sidebar with active states
- Search input has `aria-label`; filter buttons use `aria-pressed`
- Filter results region uses `aria-live="polite"`
- Download links include descriptive text and file type indicators
- Reduced motion respected via existing `SectionReveal`

---

## Reusable Components

**Location:** `artifacts/ckbhse-website/src/components/resources/`

| Component                 | Purpose                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `resource-page-view.tsx`  | Full resource template (body, downloads, webinar details, cross-links, FAQs, JSON-LD, CTA)   |
| `resource-body.tsx`       | Renders paragraph, heading, and list content blocks                                          |
| `resource-navigation.tsx` | Type-grouped sidebar with active states                                                      |

Reused from P3–P6: `ServiceHero`, `RelatedServices`, `FaqAccordion`, `CtaBanner`, `SectionReveal`, `PageShell`, `PageStructuredData`.

---

## Tests

### New tests

| File                                          | Coverage                                              |
| --------------------------------------------- | ----------------------------------------------------- |
| `lib/content/src/schemas/resources.test.ts`   | Schema validation, unique paths, catalog filtering    |
| `lib/content/src/loader/index.test.ts`        | Resource loading, resolution, hub alias               |
| `lib/seo/src/metadata.test.ts`                | Route count (136/135), sitemap URLs, Article/Event/NewsArticle schema |

### Test results

```
lib/content   47 tests passed (+13)
lib/seo       13 tests passed (+1)
lib/platform  151 tests passed
artifacts     35 tests passed
```

---

## Performance

- Resource pages share a single `ResourcePageView` bundle — no duplicated page implementations
- Content validated once at load time via Zod and cached in `FileContentLoader`
- Catalog filtering operates on lightweight `ResourceCatalogItem` projections
- Production build completes successfully with 33 additional prerender shells

---

## Verification

| Check              | Result |
| ------------------ | ------ |
| TypeScript         | Pass   |
| ESLint             | Pass (0 errors) |
| Unit tests         | Pass   |
| Production build   | Pass   |
| Sitemap            | Pass — `/resources` + 33 detail URLs |
| Prerender          | Pass — 135 HTML shells |
| Metadata           | Pass — all resource pages inherit SEO fields |
| Structured data    | Pass — Article, NewsArticle, Event, FAQ, BreadcrumbList |
| Search & filters   | Pass — catalog utilities tested |
| Dynamic routes     | Pass — `/resources/:type/:slug` |
| Cross-linking      | Pass — metadata-driven resolution tested |
| Responsive layouts | Pass — hub and detail pages use existing grid patterns |
| Legacy redirect    | Pass — `/knowledge` → `/resources` |

---

## Remaining Work before P8

P8 (Case Studies, Testimonials, Client Success & Conversion Platform) should build on this foundation:

1. **Case study detail pages** — `relatedCaseStudies` refs on resources already point to future `/case-studies/:slug` routes
2. **Testimonial integration** — resource and case study schemas have placeholder-ready testimonial fields
3. **Conversion CTAs** — hub and resource CTAs currently route to `/contact`; P8 may add dedicated conversion landing pages
4. **CMS integration** — content loader `AsyncContentSource` interface ready; resource registry pattern mirrors training/services
5. **Full body prerender** — enable `PRERENDER_FULL=1` when content volume warrants static HTML bodies
6. **Additional resource types** — extend `resourceTypeIdSchema` for white papers, infographics, videos without architectural change
7. **Newsletter backend** — hub placeholder ready for subscription integration
8. **Webinar booking** — registration URLs in content; booking backend deferred
9. **Download analytics** — static URLs ready for future CDN/storage with download tracking

---

## Files Added / Modified (Summary)

### Added

- `lib/content/src/schemas/resources.ts`
- `lib/content/src/schemas/resources.test.ts`
- `lib/content/src/resources/catalog.ts`
- `lib/content/src/data/resources/*` (helpers, content files, registry)
- `artifacts/ckbhse-website/src/pages/resources.tsx`
- `artifacts/ckbhse-website/src/pages/resource-page.tsx`
- `artifacts/ckbhse-website/src/components/resources/*`

### Modified

- `lib/content/src/loader/index.ts` — resource loader methods
- `lib/content/src/schemas/pages.ts` — hub type aliases
- `lib/content/src/data/site.ts` — navigation to `/resources`
- `lib/content/src/data/knowledge.ts` — re-exports hub
- `lib/seo/src/routes.ts` — resource route spread
- `lib/seo/src/schema/index.ts` — NewsArticle, Event builders
- `artifacts/ckbhse-website/src/App.tsx` — resource routes
- `artifacts/ckbhse-website/src/pages/knowledge.tsx` — redirect
- `artifacts/ckbhse-website/src/lib/seo.ts` — schema exports

---

**P7 complete.** The platform now has a scalable enterprise Knowledge Centre ready for hundreds or thousands of resources through a single content architecture, fully prepared for **M1 – P8: Case Studies, Testimonials, Client Success & Conversion Platform**.
