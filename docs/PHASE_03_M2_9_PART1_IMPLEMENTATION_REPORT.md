# Phase 03 — M2.9 Part 1 Enterprise Hardening Implementation Report

**File scanning, security tests, E2E smoke, CI audit gate, DR rehearsal**

**Status:** COMPLETE  
**Date:** 2026-07-30  
**Baseline after cross-cutting spine:** 642 tests  
**After M2.9 Part 1:** 659 unit tests + 3 E2E smoke tests passing

---

## Summary

This milestone closes the deferred malware scanning hook on file upload completion, adds RBAC and tenant-isolation guards for the file pipeline, expands OpenAPI coverage for CMS Part 4 and file routes, introduces Playwright API smoke tests, and adds CI dependency auditing plus operational rehearsal scripts ahead of M2.10 GA.

---

## Delivered

### File content inspection on upload complete

Upload completion now reads a sample of the stored object and runs it through a pluggable scan provider before marking the upload `verified`.

**Flow (updated)**

1. `POST /api/v1/files` — create pending row + signed write URL
2. Client uploads bytes directly to object storage
3. `POST /api/v1/files/{uploadId}/complete` — verify object via `storage.head()`, scan sample via `FileScanProvider`, mark `verified` or `failed`
4. `GET /api/v1/files/{uploadId}/download` — only available when status is `verified`

**Provider**

| Component | Path |
|-----------|------|
| Interface + implementations | `lib/platform/src/files/scan-provider.ts` |
| Env selector | `FILE_SCAN_PROVIDER=content-inspection` (default) or `noop` (tests) |

Default `ContentInspectionScanProvider` blocks executable/HTML signatures and validates magic bytes against declared MIME type. Production can swap in ClamAV or a vendor API behind the same interface.

### Security test coverage

| Test | Path |
|------|------|
| Scan provider unit tests | `lib/platform/src/files/scan-provider.test.ts` |
| Service scan + verified download gate | `lib/services/src/files/file-upload.service.test.ts` |
| File RBAC seed | `lib/data/src/repositories/file-upload-rbac.test.ts` |
| File tenant isolation | `lib/data/src/repositories/file-upload-tenant-isolation.test.ts` |
| Files API auth | `artifacts/api-server/src/routes/v1/files.test.ts` |
| OpenAPI guards (CMS Part 4 + files) | `artifacts/api-server/src/openapi-coverage.test.ts` |

### E2E smoke foundation

| Component | Path |
|-----------|------|
| Playwright package | `e2e/` |
| Smoke spec | `e2e/tests/smoke.spec.ts` |
| Root script | `pnpm run test:e2e` |

Smoke tests exercise versioned health, unauthenticated session probe, and unauthenticated file upload over a live API server instance.

### CI and operational scripts

| Item | Path |
|------|------|
| Dependency audit gate | `.github/workflows/ci.yml` — `pnpm audit --audit-level=high` |
| E2E smoke job | `.github/workflows/ci.yml` — `e2e-smoke` after verify |
| DR rehearsal | `scripts/dr-rehearsal.mts` — health + optional DB probe |
| Security audit | `scripts/security-audit.mts` — audit + required env keys |

---

## Configuration

| Variable | Purpose |
|----------|---------|
| `FILE_SCAN_PROVIDER` | `content-inspection` (default) or `noop` |
| `DR_BASE_URL` | Base URL for DR rehearsal health check |
| `SECURITY_AUDIT_SKIP_ENV` | Skip env-key check in local/CI audit script |

---

## Deferred to M2.9 Part 2+ / M2.10

- External penetration test and load/soak testing
- Full accessibility audit across all five applications
- Orval migration for remaining staff/client portal pages
- ClamAV or cloud AV integration behind `FileScanProvider`
- Observability dashboards, tuned alert thresholds, on-call runbooks (skeleton in `docs/runbooks/`)
- Data retention and deletion automation (GDPR BRS §10)

**Next:** M2.10 GA launch checklist verification, documentation completion, support process sign-off
