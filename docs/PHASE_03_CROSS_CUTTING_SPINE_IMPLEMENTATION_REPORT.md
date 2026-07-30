# Phase 03 — Cross-Cutting Platform Spine Implementation Report

**File uploads, notification delivery, outbox handlers, unified storage**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after M2.7 Part 4:** 634 tests  
**After spine:** 642 tests passing, typecheck pass

---

## Summary

This milestone replaces the `/api/v1/files` placeholder with a production pre-signed upload pipeline, wires notification channel providers into the composition root, adds a generic outbox handler for async notification delivery, and unifies storage access through the data layer factory used by CMS, reporting, and file services.

---

## Delivered

### File upload pipeline

Uses existing `file_uploads` table from M2.1 foundation schema.

**Flow**

1. `POST /api/v1/files` — create pending row + signed write URL
2. Client uploads bytes directly to object storage
3. `POST /api/v1/files/{uploadId}/complete` — verify object via `storage.head()`, mark uploaded
4. `GET /api/v1/files/{uploadId}/download` — issue signed read URL with attachment filename

**Layers**

| Layer | Path |
|-------|------|
| Domain | `lib/domain/src/files/index.ts` |
| Store | `lib/data/src/stores/drizzle-file-upload.store.ts` |
| Repository | `lib/data/src/repositories/file-upload.repository.ts` |
| Service | `lib/services/src/files/file-upload.service.ts` |
| API | `artifacts/api-server/src/routes/v1/files.ts` |

**Guards**

- Auth required on all file routes
- RBAC: `DOCUMENT_MANAGE` or `EVIDENCE_UPLOAD` for writes; `DOCUMENT_READ` (+ manage/upload) for reads
- Tenant-scoped storage keys via `buildTenantKey(org, domain, uploadId, generatedFilename)`
- Allowed MIME types whitelist, 50 MB cap, generated stored filenames (no user path segments)
- Size verification on complete

### Notification providers

| Provider | Channel | Behaviour |
|----------|---------|-----------|
| `EmailNotificationChannelProvider` | `email` | Sends via configured `EmailProvider` when `notification.data.recipientEmail` is set |
| `InAppNotificationChannelProvider` | `in_app` | In-memory store for dev/tests; listable per user |

Registered in `createContainer()` through `createDefaultNotificationProviders()`.

### Outbox handlers

- New event: `notification.dispatch` (`OUTBOX_EVENT_NOTIFICATION_DISPATCH`)
- Handler: `createNotificationDispatchHandler` — parses payload, calls `NotificationDispatcher`
- Wired alongside existing `notification.contact_request.created` handler in `container.ts`

**Payload fields:** `type`, `recipientUserId`, `recipientOrganizationId`, `priority`, `subject`, `body`, `channels[]`, optional `recipientEmail`, `actionPath`, `idempotencyKey`

Domains can enqueue notification delivery asynchronously by writing this outbox event in a transaction.

### Unified production storage wiring

- `createStorageProvider()` (from M2.7 Part 4) is the single factory for local/S3 backends
- Data layer exposes one `storage` instance consumed by:
  - `FileUploadService`
  - `CmsMediaService`
  - Reporting export / BI services
- API container uses `dataLayer.storage` when database is configured (not `InMemoryStorageProvider`)

---

## API surface (OpenAPI + Orval)

| Method | Path | Operation |
|--------|------|-----------|
| POST | `/v1/files` | `initiateFileUpload` |
| POST | `/v1/files/{uploadId}/complete` | `completeFileUpload` |
| GET | `/v1/files/{uploadId}/download` | `getFileDownloadGrant` |

---

## Env vars (storage — unchanged from Part 4)

| Variable | Purpose |
|----------|---------|
| `STORAGE_PROVIDER` | `local` or `s3` |
| `S3_BUCKET`, `S3_REGION`, credentials | Production object storage |
| `STORAGE_ROOT`, `STORAGE_BASE_URL` | Local dev filesystem |

---

## Verification checklist

- [x] Pre-signed upload initiate / complete / download API
- [x] Tenant-scoped keys + RBAC on file repository
- [x] Email + in-app notification providers registered
- [x] `notification.dispatch` outbox handler
- [x] Container storage unified via data layer
- [x] OpenAPI + Orval codegen
- [x] 642 tests passing
- [x] Typecheck pass

**Cross-cutting spine: COMPLETE**

**Next:** M2.9/M2.10 hardening (E2E, pen test, GA), Orval migration for remaining portal pages, malware scanning hook on upload complete
