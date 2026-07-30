# Phase 02 — Milestone 1 (P6) Implementation Report

## Training & Professional Development Platform

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 05 Milestone 1 — P6  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone 1 increment **P6 (Training & Professional Development Platform)** transforms the Training section into a comprehensive lead-generation and authority area for CKBHSE. Built entirely on the locked P1–P5 architecture, this increment adds **29 dynamic course detail pages** across **six training categories**, an enhanced Training Hub with multi-axis search and filtering, learning pathways, corporate training offerings, and full SEO integration including Course and FAQ structured data.

All verification checks pass: typecheck, lint (0 errors), tests (+11 new tests), and production build with **102 indexable routes** prerendered.

---

## Training Architecture

### Route pattern

```
/training                              → Training Hub
/training/:category/:slug              → Dynamic course detail pages
```

### Six training categories

| Category ID             | Label                    | Courses |
| ----------------------- | ------------------------ | ------- |
| `health-safety`         | Health & Safety          | 10      |
| `environmental`         | Environmental            | 4       |
| `occupational-health`   | Occupational Health      | 3       |
| `iso-management`        | ISO & Management Systems | 4       |
| `compliance-governance` | Compliance & Governance  | 4       |
| `leadership-culture`    | Leadership & Culture     | 4       |

**Total:** 29 course detail pages + 1 hub = 30 training routes

### Hub enhancements (`/training`)

- Hero with accredited training provider messaging
- Featured courses grid
- Category filter (6 practice areas)
- Delivery method filter (classroom, online, on-site, VILT)
- Industry filter
- Certification filter (IOSH, NEBOSH, CPD, HSE)
- Duration filter (short, medium, long)
- Learning pathway level filter (foundation → leadership)
- Keyword search
- Learning pathways section (Foundation → Intermediate → Advanced → Leadership)
- Why train with CKBHSE feature grid
- Corporate training offerings (6 enterprise options)
- Hub FAQs with FAQ schema
- Consultation CTA banner

---

## Course Content Model

**Location:** `lib/content/src/schemas/training.ts`

### Course detail page schema (`coursePageSchema`)

Each course supports: slug, category, path, title, subtitle, hero, overview, learningObjectives, targetAudience, prerequisites, deliveryMethods, duration, certification, assessment, courseOutline, learningOutcomes, industries, relatedServices, relatedIndustries, relatedResources, relatedCourses, pathwayLevel, faqs, testimonial (placeholder-ready), cta, seo, breadcrumbs, keywords, featured, accreditation, level, price.

### Hub schema (`trainingHubPageSchema`)

Categories, deliveryMethodFilters, industryFilters, certificationFilters, durationFilters, pathwayLevels, featuredCourses, overview, whyTrain, learningPathways, corporateTraining, faqs, consultationCta.

### Data layer

```
lib/content/src/data/training/
  helpers.ts                → defineCourse() factory
  health-safety.ts          → 10 courses
  environmental.ts          → 4 courses
  occupational-health.ts    → 3 courses
  iso-management.ts         → 4 courses
  compliance-governance.ts  → 4 courses
  leadership-culture.ts       → 4 courses
  hub.ts                    → hub page content
  index.ts                  → trainingPageRegistry (29 courses)
```

**Catalog utilities:** `lib/content/src/training/catalog.ts` — filtering, path parsing, related course resolution, learning pathway resolution.

---

## Dynamic Routing Strategy

- **Single route component:** `CoursePage` resolves content via `useRoute('/training/:category/:slug')` and `contentLoader.getCoursePage()`
- **No hand-written TSX per course** — all pages rendered through `CoursePageView`
- **Route registration order:** dynamic `/training/:category/:slug` registered before `/training` in `App.tsx`
- **SEO registry:** `lib/seo/src/routes.ts` spreads `contentLoader.getCoursePages()` — no duplicated route definitions

---

## Learning Pathways

Courses reference pathway levels (`foundation`, `intermediate`, `advanced`, `leadership`) and link to related courses via `relatedCourses` metadata. The hub displays four structured pathways with course links resolved from content — no hardcoded UI logic.

| Level        | Example courses                                             |
| ------------ | ----------------------------------------------------------- |
| Foundation   | IOSH Working Safely, Fire Safety Awareness, Manual Handling |
| Intermediate | IOSH Managing Safely, Risk Assessment, CDM Regulations      |
| Advanced     | NEBOSH General Certificate, ISO 45001 Internal Auditor      |
| Leadership   | Safety Leadership, Safety Culture, Behavioural Safety       |

---

## Reusable Components

**Location:** `artifacts/ckbhse-website/src/components/training/`

| Component               | Purpose                                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `course-page-view.tsx`  | Full course template (overview, objectives, audience, delivery, certification, outline, outcomes, industries, services, related courses, FAQs, CTA) |
| `course-navigation.tsx` | Category-grouped sidebar with active states                                                                                                         |

Reused from P3–P5: `ServiceHero`, `RelatedServices`, `FaqAccordion`, `FeatureGrid`, `CtaBanner`, `SectionReveal`, `PageShell`, `PageStructuredData`.

---

## Search & Filtering

Implemented on the Training Hub using typed catalog data:

- **Category filter** — filters by `TrainingCategoryId`
- **Delivery method filter** — classroom, online, on-site, VILT
- **Industry filter** — filters by industry slug metadata
- **Certification filter** — IOSH, NEBOSH, CPD, HSE
- **Duration filter** — short (<1 day), medium (1–3 days), long (4+ days)
- **Pathway level filter** — foundation through leadership
- **Keyword search** — matches title, summary, accreditation, keywords
- **Featured courses** — hub section driven by `featuredCourses` refs
- **Alphabetical sort** — catalog sorted by title

Filter logic: `filterTrainingCatalog()` in `@workspace/content/training/catalog`.

---

## Cross-Linking Strategy

Relationships defined in course content metadata — not hardcoded in TSX:

| Link type         | Source field                              | Target                                             |
| ----------------- | ----------------------------------------- | -------------------------------------------------- |
| Related services  | `relatedServices[]`                       | Service detail pages via `resolveCourseServices()` |
| Related courses   | `relatedCourses[]`                        | Other course pages via `resolveRelatedCourses()`   |
| Industries        | `industries[]`                            | `/industries/:slug`                                |
| Learning pathways | Hub `learningPathways.pathways[].courses` | Course detail pages                                |
| Reverse links     | Industry `recommendedTraining`            | Updated to `/training/:category/:slug`             |
| Reverse links     | Service `relatedTraining`                 | Updated to course detail paths                     |
| Contact           | All course CTAs                           | `/contact`                                         |

Navigation links updated from `/training#slug` hash anchors to full course paths.

---

## SEO Verification

### Automatic inheritance (P2)

All 29 course pages receive: metadata, canonical URLs, Open Graph, Twitter Cards, sitemap registration, prerender HTML shells.

### P6 additions

- **Course schema** (`Schema.org/Course`) — runtime via `PageStructuredData` on each detail page via `buildCourseSchema()`
- **FAQ schema** (`Schema.org/FAQPage`) — on course pages with FAQs and on Training Hub
- **BreadcrumbList schema** — via existing breadcrumb trail on detail pages

### Route counts

| Metric                  | P5  | P6  |
| ----------------------- | --- | --- |
| Total public routes     | 74  | 103 |
| Indexable routes        | 73  | 102 |
| Prerendered HTML shells | 73  | 102 |

Sitemap includes all 29 course URLs (verified: `/training/health-safety/iosh-managing-safely` and siblings).

---

## Accessibility Review

- Single `<h1>` per course page; section headings follow logical hierarchy
- FAQ accordion uses Radix UI with keyboard navigation and ARIA
- Course navigation sidebar with `aria-current="page"` for active course
- Search input has `aria-label`; filter buttons use `aria-pressed`
- Filter results region uses `aria-live="polite"`
- Industry and service links are keyboard-focusable
- Reduced motion respected via existing `SectionReveal`

---

## Files Added

```
lib/content/src/schemas/training.ts
lib/content/src/schemas/training.test.ts
lib/content/src/training/catalog.ts
lib/content/src/data/training/helpers.ts
lib/content/src/data/training/hub.ts
lib/content/src/data/training/index.ts
lib/content/src/data/training/health-safety.ts
lib/content/src/data/training/environmental.ts
lib/content/src/data/training/occupational-health.ts
lib/content/src/data/training/iso-management.ts
lib/content/src/data/training/compliance-governance.ts
lib/content/src/data/training/leadership-culture.ts
artifacts/ckbhse-website/src/components/training/course-page-view.tsx
artifacts/ckbhse-website/src/components/training/course-navigation.tsx
artifacts/ckbhse-website/src/pages/course-page.tsx
docs/PHASE_02_M1_P6_IMPLEMENTATION_REPORT.md
```

---

## Files Modified

```
lib/content/src/schemas/pages.ts
lib/content/src/schemas/index.ts
lib/content/src/data/training.ts              → hub re-export
lib/content/src/data/site.ts                → nav training links
lib/content/src/data/industries/*.ts          → recommendedTraining hrefs
lib/content/src/data/services/health-safety.ts → relatedTraining hrefs
lib/content/src/loader/index.ts             → course loader methods
lib/content/src/loader/index.test.ts        → course loader tests
lib/content/package.json                      → training/catalog export
lib/seo/src/routes.ts                       → course route spread
lib/seo/src/metadata.test.ts                → route count + sitemap tests
artifacts/ckbhse-website/src/App.tsx        → /training/:category/:slug route
artifacts/ckbhse-website/src/pages/training.tsx → enhanced hub
artifacts/ckbhse-website/src/lib/seo.ts     → export buildCourseSchema
```

---

## Test Coverage

| Suite                                      | New tests                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `lib/content/src/schemas/training.test.ts` | Schema validation (29 courses), unique paths, catalog filtering, path parsing, related courses |
| `lib/content/src/loader/index.test.ts`     | Course loading, category/slug resolution, related courses/services, hub page, pathways         |
| `lib/seo/src/metadata.test.ts`             | Route counts (103/102), sitemap course URLs, Course schema                                     |

**Totals:** 35 content tests, 12 SEO tests — all passing.

---

## Performance Review

- Shared `CoursePageView` template — no per-course bundle duplication
- Catalog filtering runs client-side on memoised catalog array
- Course pages reuse existing service/corporate components
- Production bundle builds successfully (~913 KB JS, consistent with content growth pattern)

---

## Verification Results

| Check                     | Result                                                                            |
| ------------------------- | --------------------------------------------------------------------------------- |
| TypeScript                | Pass                                                                              |
| ESLint                    | Pass (0 errors)                                                                   |
| Tests                     | Pass (233 total across workspace)                                                 |
| Production build          | Pass                                                                              |
| Dynamic course routes     | 29 pages resolve via `/training/:category/:slug`                                  |
| Sitemap                   | 102 indexable URLs including all courses                                          |
| Prerender                 | HTML shells generated for all routes                                              |
| Metadata                  | Inherited from content SEO fields                                                 |
| JSON-LD                   | Course + FAQ + BreadcrumbList on detail pages                                     |
| Search & filtering        | Category, delivery, industry, certification, duration, pathway filters functional |
| Cross-links               | Services and courses resolve from metadata                                        |
| Responsive layouts        | Grid layouts with mobile-first breakpoints                                        |
| Architectural regressions | None — P1–P5 systems intact                                                       |

---

## Remaining Work Before P7

P7 (Resources, Knowledge Centre & Thought Leadership) can proceed without architectural changes:

1. **Article and guide detail pages** — extend content model for knowledge hub entries
2. **Downloadable resources** — activate resource files linked from courses and industries
3. **Webinar and template catalogues** — new content types using same dynamic routing pattern
4. **Blog infrastructure** — `/blog/:slug` routes (currently marked unavailable in nav)
5. **Case study detail pages** — replace hub anchor links with dedicated routes
6. **Training enquiry forms** — wire corporate training CTA to structured enquiry workflow
7. **Testimonials** — replace placeholder testimonials with client-approved content
8. **Full body prerender** — enable `PRERENDER_FULL=1` when SSR pipeline is ready

---

## Success Criteria — Met

- Comprehensive Training Hub with search, filtering, and learning pathways
- 29 dynamic course pages driven entirely by typed content
- Six training categories covering all specified course examples
- Corporate training section with enterprise offerings
- Automatic cross-linking with Services, Industries, and related courses
- Full SEO integration with Course and FAQ structured data
- WCAG 2.2 AA compliance maintained
- Scalable architecture — new courses added via content files only
