# Phase 03 — Milestone 2.7 Part 2 — CMS Foundation

**Project:** CKBHSE Enterprise Digital Platform  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

M2.7 Part 2 delivers the **CMS foundation**: versioned public content in PostgreSQL, admin APIs under `/api/v1/admin/cms/*`, a file-to-database import path from `lib/content`, and admin portal pages for content governance. The public website continues to use `FileContentLoader` until Part 3 swaps the content source.

**Verification:** typecheck pass, **546 tests** passing (537 baseline + 9 CMS guards/unit tests).

---

## Delivered Capabilities

### Database (`0010_cms.sql`)
- `cms_entries` — typed content records with slug, path, SEO, status, published/current version pointers, client-approval flag
- `cms_entry_versions` — immutable JSON payloads with version numbers and change summaries
- Status lifecycle: `draft` → `scheduled` → `published` → `archived`

### Domain & Data Layer
- `@workspace/domain/cms` — dashboard, entry summaries, detail/version types, import result
- `DrizzleCmsStore` — CRUD, draft saves, publish, archive, rollback, dashboard counts
- `CmsRepository` — RBAC via `CONTENT_READ`, `CONTENT_MANAGE`, `CONTENT_PUBLISH`

### Service Layer
- `CmsService` — list/get/create, draft updates, publish, archive, rollback, dashboard
- `collectCmsImportRecords()` — walks `FileContentLoader` and maps all M1 content types (hubs, services, industries, courses, resources, case studies, testimonials, legal, etc.)
- `importFromFiles()` — bulk upsert as **published** entries (skip-existing by default)

### API Routes (`/api/v1/admin/cms`)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard` | CMS KPI counts |
| GET | `/entries` | Filterable entry list |
| POST | `/entries` | Create entry + v1 |
| GET | `/entries/:entryId` | Detail + version history |
| PATCH | `/entries/:entryId/draft` | Save new draft version |
| POST | `/entries/:entryId/publish` | Publish current draft |
| POST | `/entries/:entryId/archive` | Archive entry |
| POST | `/entries/:entryId/rollback` | Roll back to prior version (new draft) |
| POST | `/import-from-files` | Import from `lib/content` |

### Admin Portal
- `/cms` — dashboard, import button, draft shortcuts
- `/cms/entries` — searchable/filterable directory
- `/cms/entries/:entryId` — payload preview, publish/archive, version rollback

### OpenAPI & Codegen
- CMS paths and schemas in `openapi.yaml`
- Generated hooks: `useAdminCmsDashboard`, `useAdminCmsListEntries`, `useAdminCmsGetEntry`, `useAdminCmsPublishEntry`, etc.
- OpenAPI coverage guards for M2.7 Part 2 CMS routes

---

## Content Import

Run migration `0010_cms.sql`, then in the admin portal:

1. Open **http://localhost:5185/admin/cms**
2. Click **Import from files**

Or via API:

```bash
POST /api/v1/admin/cms/import-from-files
{ "skipExisting": true }
```

Imports 50+ records from the existing M1 file pipeline (home, hubs, services, industries, training, resources, case studies, testimonials, legal, corporate). Case studies and testimonials are flagged `requiresClientApproval: true` for future approval workflow.

---

## Architecture Notes

- **Draft vs live:** `currentVersionId` holds the working copy; `publishedVersionId` remains live until publish — published pages stay live while drafts are edited
- **Permissions:** reuses seed permissions `cms.content.read`, `cms.content.manage`, `marketing.content.publish` (platform_admin has all three)
- **No website swap yet:** `artifacts/ckbhse-website` still reads `contentLoader` — Part 3 will introduce `DatabaseContentLoader` / feature-flagged source swap
- **Media library & SEO admin:** deferred to Part 3+

---

## Files Added / Changed (Key)

| Area | Files |
|------|-------|
| DB | `lib/db/migrations/0010_cms.sql`, `lib/db/src/schema/cms.ts` |
| Domain | `lib/domain/src/cms/index.ts` |
| Data | `drizzle-cms.store.ts`, `cms.repository.ts`, data layer wiring |
| Services | `lib/services/src/cms/*` (service, import, tests) |
| API | `artifacts/api-server/src/routes/v1/admin-cms.ts`, mounted under `/admin/cms` |
| OpenAPI | CMS paths/schemas, regenerated clients |
| Portal | `artifacts/admin-portal/src/pages/cms/*`, nav update |

---

## Deferred to M2.7 Part 3+

1. Public website content-source swap (`DatabaseContentLoader`)
2. Visual CMS editor (structured section forms vs JSON preview)
3. Client approval workflow UI for case studies/testimonials
4. Media library and SEO administration
5. Scheduled publish and review-due notifications

---

## Verification Checklist

- [x] CMS migration + Drizzle schema
- [x] Versioned entry store with publish/rollback
- [x] CmsService + file import from `lib/content`
- [x] `/api/v1/admin/cms/*` routes + auth tests
- [x] OpenAPI CMS paths + Orval codegen
- [x] Admin portal CMS pages
- [x] 546 tests passing
- [x] Typecheck and builds pass

**Milestone 2.7 Part 2: COMPLETE**

**Next:** M2.7 Part 3 — content-source swap for public website + media/SEO foundations
