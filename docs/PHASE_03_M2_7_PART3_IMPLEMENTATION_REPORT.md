# Phase 03 — Milestone 2.7 Part 3 Implementation Report

**Content-source swap + media/SEO foundations**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after Part 2:** 546 tests  
**After Part 3:** 557 tests passing, typecheck pass

---

## Summary

Part 3 connects the CMS database to the public website through a snapshot-based content loader, adds public read APIs, and delivers admin surfaces for media uploads and SEO metadata editing.

The public website continues to consume synchronous `contentLoader` — no React async refactor required. Build-time and SEO scripts can opt into database snapshots via `CONTENT_SOURCE` / `CMS_SNAPSHOT_PATH`.

---

## Delivered

### Database (`0011_cms_media.sql`)

- `cms_media_assets` table (key, filename, mime type, storage key, public URL, alt/caption)
- Global feature flag seed: `cms.database_content` (default `false`)

### Public content read path

- Store methods: `listPublishedEntries`, `getPublishedByPath`, `listSeoSummaries`, `updateEntrySeo`
- `PublicContentRepository` + `PublicContentService`
- Public API (no auth):
  - `GET /api/v1/content/entries`
  - `GET /api/v1/content/snapshot`
  - `GET /api/v1/content/by-path?path=…`

### Content-source swap

- `CmsContentSnapshot` builder with `/resources` alias when `/knowledge` hub exists
- `DatabaseContentLoader` — full `ContentSource` implementation from snapshot JSON
- `CompositeContentLoader` — CMS snapshot primary, file fallback
- Delegating `contentLoader` + `configureContentLoader()` / `bootstrapContentLoaderFromEnv()`
- `scripts/build-cms-snapshot.mts` — exports published CMS rows to `.cms-snapshot.json`
- `postbuild-seo.mts` bootstraps loader from env before sitemap/prerender

**Env vars**

| Variable | Purpose |
|----------|---------|
| `CONTENT_SOURCE` / `VITE_CONTENT_SOURCE` | `file` (default), `database`, or `composite` |
| `CMS_SNAPSHOT_PATH` / `VITE_CMS_SNAPSHOT_PATH` | Snapshot JSON path (default: `.cms-snapshot.json`) |

**Typical CMS build flow**

1. Run migration `0011_cms_media.sql`
2. Import/publish content in admin CMS
3. `pnpm exec tsx scripts/build-cms-snapshot.mts`
4. Build website with `CONTENT_SOURCE=composite` (or `database`)

### Media library

- `DrizzleCmsMediaStore` + `CmsMediaRepository` + `CmsMediaService`
- Admin API:
  - `GET /api/v1/admin/cms/media`
  - `POST /api/v1/admin/cms/media` (base64 upload → local storage)
- Admin portal: `/cms/media`

### SEO administration

- `listSeoSummaries` / `updateEntrySeo` on CMS store
- Admin API:
  - `GET /api/v1/admin/cms/seo`
  - `PATCH /api/v1/admin/cms/seo/{entryId}`
- Admin portal: `/cms/seo` (edit title/description per entry)

### OpenAPI + codegen

New paths/schemas for public content, media, and SEO. Orval hooks regenerated for admin portal.

---

## File map

| Area | Key paths |
|------|-----------|
| DB | `lib/db/migrations/0011_cms_media.sql`, `lib/db/src/schema/cms.ts` |
| Content | `lib/content/src/snapshot/*`, `loader/database-content-loader.ts`, `loader/composite-content-loader.ts` |
| Data | `drizzle-cms-media.store.ts`, `public-content.repository.ts`, `cms-media.repository.ts` |
| Services | `public-content.service.ts`, `cms-media.service.ts` |
| API | `routes/v1/content.ts`, extended `admin-cms.ts` |
| Build | `scripts/build-cms-snapshot.mts`, `artifacts/ckbhse-website/scripts/postbuild-seo.mts` |
| Portal | `artifacts/admin-portal/src/pages/cms/media.tsx`, `seo.tsx` |

---

## Still deferred (Part 4+)

1. Visual CMS editor (structured section forms)
2. Client approval workflow UI
3. Scheduled publish + review-due notifications
4. Production object storage integration for media (S3/R2)
5. Runtime async content fetching in the website (currently snapshot/build-time)

---

## Verification checklist

- [x] Media migration + Drizzle schema
- [x] Public published-content store/service/API
- [x] `DatabaseContentLoader` + `CompositeContentLoader` + snapshot builder
- [x] SEO + media admin APIs and portal pages
- [x] OpenAPI paths + Orval codegen
- [x] Website SEO build loader bootstrap
- [x] 557 tests passing
- [x] Typecheck pass

**Milestone 2.7 Part 3: COMPLETE**

**Next:** M2.7 Part 4 — visual editor + client approval workflow (or M2.8 per roadmap)
