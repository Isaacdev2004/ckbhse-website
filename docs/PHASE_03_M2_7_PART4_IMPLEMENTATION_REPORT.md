# Phase 03 — Milestone 2.7 Part 4 Implementation Report

**CMS visual editor, client approval workflow, S3 media, database content by default**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after M2.8 Part 5:** 628 tests  
**After Part 4:** 634 tests passing, typecheck pass

---

## Summary

Part 4 completes the CMS editorial workflow deferred from Part 3: structured visual editing, client approval gates, scheduled publish, production S3 storage for media, and composite database content as the default content source.

---

## Delivered

### Database (`0017_cms_part4.sql`)

- Enables global feature flag `cms.database_content` (default `true`)

### S3-compatible object storage

- `S3StorageProvider` — AWS S3, Cloudflare R2, MinIO via `@aws-sdk/client-s3`
- `createStorageProvider()` — env-driven factory (`STORAGE_PROVIDER`, `S3_BUCKET`, `S3_REGION`, credentials, optional endpoint/path-style)
- Data layer uses factory instead of hard-coded local storage
- API container wires `dataLayer.storage` (S3 in production, local filesystem in dev)
- CMS media uploads/list refresh signed read URLs when storage is S3

**Env vars**

| Variable | Purpose |
|----------|---------|
| `STORAGE_PROVIDER` | `local` (default) or `s3` |
| `S3_BUCKET` / `STORAGE_BUCKET` | Bucket name |
| `S3_REGION` / `AWS_REGION` | Region (default `eu-west-2`) |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Credentials (optional with IAM role) |
| `S3_ENDPOINT` | R2/MinIO endpoint |
| `S3_FORCE_PATH_STYLE` | Path-style URLs for compatible providers |

### Client approval workflow

- Publish blocked when `requiresClientApproval && !clientApprovedAt`
- `approveClientEntry` store/repo/service method
- Dashboard metric: `pendingClientApprovalEntries`
- List filter: `pendingClientApproval=true`
- Admin API:
  - `POST /api/v1/admin/cms/entries/{entryId}/approve-client`
  - `GET /api/v1/admin/cms/approvals/pending`
- Admin portal: `/cms/approvals` queue + approve action on entry detail

### Scheduled publish + review due

- `scheduleEntry`, `listDueScheduledEntries`, `listDueReviewEntries`
- `runDueWorkflow` publishes due scheduled entries (respects approval gate)
- Background jobs: `cms.scheduled-publish`, `cms.review-due`
- Admin API:
  - `POST /api/v1/admin/cms/entries/{entryId}/schedule`
  - `POST /api/v1/admin/cms/workflow/run-due`
- Entry detail UI: schedule datetime + optional review-due fields

### Visual CMS editor

- `CmsVisualEditor` component — hero, stats, sections with JSON fallback
- Integrated on entry detail page with draft save via existing PATCH draft API
- Supports home, hub, corporate, contact and any payload with a `hero` object

### Database content default

- `CONTENT_SOURCE` / `VITE_CONTENT_SOURCE` default changed from `file` to `composite`
- Feature flag `cms.database_content` enabled by migration

### OpenAPI + codegen

New paths/schemas: approve-client, schedule, pending approvals, workflow run-due, dashboard field `pendingClientApprovalEntries`. Orval hooks regenerated.

---

## File map

| Area | Key paths |
|------|-----------|
| DB | `lib/db/migrations/0017_cms_part4.sql` |
| Storage | `lib/data/src/storage/s3-storage-provider.ts`, `create-storage-provider.ts` |
| CMS data | `drizzle-cms.store.ts`, `cms.repository.ts` |
| CMS services | `cms.service.ts`, `cms-jobs.ts`, `cms-media.service.ts` |
| API | `artifacts/api-server/src/routes/v1/admin-cms.ts`, `container.ts` |
| Content | `lib/content/src/loader/index.ts` (composite default) |
| Admin UI | `components/cms/cms-visual-editor.tsx`, `pages/cms/entry-detail.tsx`, `pages/cms/approvals.tsx` |

---

## Verification checklist

- [x] Migration 0017 + feature flag enabled
- [x] S3 storage provider + env factory
- [x] Client approval gate on publish + admin UI
- [x] Scheduled publish + due workflow job
- [x] Visual editor with draft save
- [x] Composite content source default
- [x] OpenAPI + Orval codegen
- [x] 634 tests passing
- [x] Typecheck pass

**Milestone 2.7 Part 4: COMPLETE**

**Next:** Cross-cutting spine (file upload pipeline, notification delivery, outbox handlers) per gap analysis, then M2.9/M2.10 hardening
