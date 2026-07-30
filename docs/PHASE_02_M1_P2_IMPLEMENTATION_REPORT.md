# Phase 02 — Milestone 1 (P2) Implementation Report

## SEO, Prerendering & Search Discoverability

**Project:** CKBHSE Enterprise Digital Platform  
**Increment:** Document 05 Milestone 1 — P2  
**Date:** 29 July 2026  
**Status:** Complete

---

## Executive Summary

Milestone 1 increment **P2 (Prerendering pipeline and SEO infrastructure)** is implemented on top of the P1 content model and navigation shell. The existing Vite SPA architecture, visual design, and page components are **preserved**.

The platform now has:

- A reusable **`@workspace/seo`** utility library (metadata, canonical URLs, JSON-LD, sitemap, robots)
- **Runtime metadata** via `PageHead` integrated into `PageShell` on all 12 public routes
- **Build-time prerendering** — per-route static HTML shells with unique metadata and global JSON-LD
- **Automated `sitemap.xml` and `robots.txt`** generation on every production build
- **Structured data** — Organization, WebSite (global), BreadcrumbList (via breadcrumbs component)
- **Optional full-body prerender** via Puppeteer (`PRERENDER_FULL=1`)

All verification checks pass: typecheck, lint, tests, and production build with SEO post-processing.

---

## Architecture Decisions

| Decision                           | Rationale                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **`lib/seo` shared package**       | Same metadata logic for runtime (SPA) and build-time (prerender); reusable in P3–P8                          |
| **Keep Vite SPA**                  | Document 03/05 locked; prerender augments rather than replaces                                               |
| **Metadata from P1 `seo` fields**  | Document 05 §7.2 — content model is canonical; no duplicate copy                                             |
| **HTML shell prerender (default)** | Injects per-route `<head>` into `dist/public/{route}/index.html`; works on static hosts without JS execution |
| **Puppeteer prerender (optional)** | Full React render when `PRERENDER_FULL=1`; avoids heavy CI dependency by default                             |
| **`SITE_URL` env for canonicals**  | Defaults to `https://www.ckbhse.co.uk`; override per environment                                             |
| **404 excluded from sitemap**      | `noindex` via route registry; still prerendered for soft-404 metadata                                        |

---

## Metadata Framework

**Location:** `lib/seo/src/metadata.ts`

`buildPageMetadata()` composes full page metadata from P1 `SeoFields`:

- Title, description, robots directive
- Canonical URL (computed or explicit override)
- Open Graph (title, description, type, url, site_name, locale, image)
- Twitter/X cards (summary_large_image)
- Theme color, language/locale
- Alternate hreflang slots (empty, future-ready)

`PageHead` (runtime) applies metadata to `document.head` on route change using `data-seo-managed` attributes to avoid duplicate tags.

`renderMetadataHeadTags()` serialises the same metadata for build-time HTML injection.

---

## Prerender Architecture

```
pnpm build
  ├── vite build          → dist/public/index.html + assets
  └── tsx postbuild-seo.mts
        ├── generate sitemap.xml
        ├── generate robots.txt
        ├── prerenderHtmlShells()  → dist/public/{route}/index.html
        └── [optional] prerenderFullPages()  (PRERENDER_FULL=1)
```

**Output structure:**

```
dist/public/
├── index.html              (home — unique metadata)
├── services/index.html     (unique metadata)
├── industries/index.html
├── … (11 indexable routes)
├── sitemap.xml
├── robots.txt
└── assets/…
```

Static hosts serving `/{route}/index.html` for directory paths receive crawlable HTML with correct `<head>` before JavaScript executes. SPA client routing remains unchanged.

**Configuration:**

| Variable                       | Purpose                           | Default                     |
| ------------------------------ | --------------------------------- | --------------------------- |
| `SITE_URL` / `PUBLIC_SITE_URL` | Canonical base URL                | `https://www.ckbhse.co.uk`  |
| `BASE_PATH`                    | Sub-path deployment prefix        | `/`                         |
| `OG_DEFAULT_IMAGE`             | Default social share image        | `{SITE_URL}/og-default.svg` |
| `PRERENDER_FULL`               | Enable Puppeteer full-body render | unset (off)                 |
| `NODE_ENV`                     | robots.txt environment behaviour  | `production`                |

---

## Sitemap Strategy

- Generated at build time from `getIndexableRoutes()` in `lib/seo/src/routes.ts`
- **11 indexable routes** (excludes `/404`)
- Canonical absolute URLs via `buildCanonicalUrl()`
- `lastmod`, `changefreq`, and `priority` included
- Extensible: add routes to registry in P3+ without changing generator

---

## Structured Data Strategy

| Schema             | Where emitted                                                | Status                       |
| ------------------ | ------------------------------------------------------------ | ---------------------------- |
| **Organization**   | Global JSON-LD in prerender + `GlobalStructuredData` runtime | Active                       |
| **WebSite**        | Global JSON-LD                                               | Active                       |
| **BreadcrumbList** | `Breadcrumbs` component JSON-LD script                       | Active (Services, Knowledge) |
| **Service**        | `buildServiceSchema()` builder                               | Future-ready (P4)            |
| **Course**         | `buildCourseSchema()` builder                                | Future-ready (P5)            |
| **Article**        | `buildArticleSchema()` builder                               | Future-ready (P6)            |
| **FAQPage**        | `buildFaqSchema()` builder                                   | Future-ready                 |

Global schemas derive contact/brand data from P1 `contentLoader.getSiteConfig()` — no hardcoded duplication.

---

## Canonical URL Strategy

**Location:** `lib/seo/src/canonical.ts`

- Absolute URLs: `{SITE_URL}{BASE_PATH}{path}`
- Trailing slash normalised (root `/` only; no trailing slashes on nested paths)
- Explicit `seo.canonical` override supported in content model
- Hash fragments and query strings stripped from path normalisation

---

## SEO Utilities Created

| Module              | Export path                | Purpose                              |
| ------------------- | -------------------------- | ------------------------------------ |
| `config.ts`         | `@workspace/seo/config`    | Site URL, locale, theme, OG defaults |
| `canonical.ts`      | `@workspace/seo/canonical` | Canonical URL builders               |
| `metadata.ts`       | `@workspace/seo/metadata`  | Page metadata compose + HTML render  |
| `routes.ts`         | `@workspace/seo/routes`    | Public route registry                |
| `schema/index.ts`   | `@workspace/seo/schema`    | JSON-LD builders                     |
| `sitemap.ts`        | `@workspace/seo/sitemap`   | Sitemap XML generation               |
| `robots.ts`         | `@workspace/seo/robots`    | robots.txt generation                |
| `slug.ts`           | `@workspace/seo/slug`      | Slug/path normalisation              |
| `prerender/html.ts` | `@workspace/seo/prerender` | HTML shell prerender                 |

---

## Files Added

### `lib/seo/` (new package)

- `package.json`, `tsconfig.json`
- `src/config.ts`, `canonical.ts`, `metadata.ts`, `routes.ts`, `sitemap.ts`, `robots.ts`, `slug.ts`
- `src/schema/index.ts`
- `src/prerender/html.ts`
- `src/metadata.test.ts` (9 tests)

### `artifacts/ckbhse-website/`

- `src/components/page-head.tsx` — runtime metadata + global JSON-LD
- `src/lib/seo.ts` — website re-exports
- `scripts/postbuild-seo.mts` — build integration
- `scripts/prerender-full.ts` — optional Puppeteer prerender
- `public/og-default.svg` — social share placeholder

### Documentation

- `docs/PHASE_02_M1_P2_IMPLEMENTATION_REPORT.md` (this file)

---

## Files Modified

| File                                                      | Change                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `tsconfig.json`                                           | Added `lib/seo` project reference                            |
| `artifacts/ckbhse-website/package.json`                   | `@workspace/seo`, `tsx`; build runs postbuild-seo            |
| `artifacts/ckbhse-website/tsconfig.json`                  | SEO project reference                                        |
| `artifacts/ckbhse-website/index.html`                     | Minimal shell with `<!-- seo:inject -->`; correct fonts/lang |
| `artifacts/ckbhse-website/src/App.tsx`                    | Global Organization + WebSite JSON-LD                        |
| `artifacts/ckbhse-website/src/components/page-shell.tsx`  | `seo` + `path` props → `PageHead`                            |
| `artifacts/ckbhse-website/src/components/breadcrumbs.tsx` | JSON-LD BreadcrumbList script                                |
| `artifacts/ckbhse-website/src/pages/*.tsx`                | Pass `seo` + `path` to PageShell (12 pages)                  |
| `artifacts/ckbhse-website/src/pages/home.tsx`             | Image `loading`/`decoding` perf attrs                        |
| `artifacts/ckbhse-website/src/pages/not-found.tsx`        | noindex metadata from route registry                         |

**Not modified:** P1 content schemas/data, navigation structure, page layouts, branding.

---

## Test Coverage

| Package                | Tests | Status                                                      |
| ---------------------- | ----: | ----------------------------------------------------------- |
| `lib/seo`              |     9 | Pass — canonical, metadata, routes, sitemap, robots, schema |
| `lib/content`          |     3 | Pass (unchanged)                                            |
| `lib/platform`         |   151 | Pass (unchanged)                                            |
| `artifacts/api-server` |    35 | Pass (unchanged)                                            |

---

## Performance Impact

| Area           | Change                                                         | Impact             |
| -------------- | -------------------------------------------------------------- | ------------------ |
| Runtime bundle | +`@workspace/seo` (~657 KB total JS, +~7 KB gzip vs P1)        | Minimal            |
| Build time     | +postbuild-seo (~2s for 11 routes)                             | Acceptable         |
| Fonts          | Aligned index.html with Outfit/DM Sans (removed unused Inter)  | Slight improvement |
| Images         | `loading="lazy"` + `decoding="async"` on below-fold hero image | Minor LCP help     |
| Puppeteer      | Opt-in only                                                    | No default CI cost |

No regressions observed in build output size warnings (pre-existing chunk size advisory).

---

## Verification Results

| Check                                               | Result                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm run typecheck`                                | Pass                                                             |
| `pnpm run lint`                                     | Pass (0 errors)                                                  |
| `pnpm run test`                                     | Pass (198 total across workspace)                                |
| `pnpm --filter @workspace/ckbhse-website run build` | Pass                                                             |
| Per-route HTML prerender                            | 11 routes with unique `<title>` verified (`services/index.html`) |
| `sitemap.xml`                                       | Generated with 11 canonical URLs                                 |
| `robots.txt`                                        | Allows `/`, blocks `/api/`, references sitemap                   |
| Unique metadata                                     | No duplicate titles across routes                                |
| P1 content model                                    | Unchanged                                                        |
| Navigation                                          | Unchanged                                                        |

---

## Brand Assets — Production Supply

Replace before launch:

| Asset            | Current                               | Production action                               |
| ---------------- | ------------------------------------- | ----------------------------------------------- |
| OG default image | `public/og-default.svg` (placeholder) | Supply 1200×630 PNG/JPG; set `OG_DEFAULT_IMAGE` |
| Favicon          | `public/favicon.svg`                  | Supply brand favicon set if required            |
| Twitter handle   | unset                                 | Set `TWITTER_HANDLE` env var                    |
| Site URL         | `https://www.ckbhse.co.uk`            | Confirm `SITE_URL` in production env            |

---

## Remaining Work Before P3

P3 (Company and trust — `/about` and children) builds directly on this SEO layer:

1. **Add routes to registry** — `getPublicRoutes()` + sitemap auto-includes new pages
2. **Per-page `seo` in content data** — same pattern as existing hubs
3. **Breadcrumb rollout** — reuse `Breadcrumbs` + JSON-LD on depth ≥ 3 routes
4. **Service/Course/Article JSON-LD** — activate builders when detail pages land (P4–P6)
5. **Full Puppeteer prerender in CI** — enable `PRERENDER_FULL=1` when Chrome available; add crawl verification gate
6. **Legal URL migration** — `/legal/*` redirects (P8); update route registry
7. **HTML sitemap page** — `/sitemap` human-readable (P8); enable footer link
8. **axe/Lighthouse CI** — formal accessibility/SEO audit gates per Document 05 §7.3

The SEO architecture does not require revisiting for subsequent route expansion.

---

## Success Criteria — Met

- Reusable metadata framework
- Automated prerendering for public routes (HTML shells + optional full render)
- Build-time XML sitemap generation
- Production-ready robots.txt
- Reusable JSON-LD structured data
- Canonical URL infrastructure
- Social sharing metadata (OG + Twitter)
- SEO utility library (`@workspace/seo`)
- Automated build integration
- Tests validating SEO infrastructure
- P1 architecture preserved; SPA routing intact
