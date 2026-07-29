# Implementation Phase 01.1 — Production Readiness Report

**Project:** CKBHSE Enterprise Digital Platform  
**Phase:** 01.1 — Production Readiness, Infrastructure Validation & Operational Hardening  
**Status:** Complete  
**Prior phase:** `docs/IMPLEMENTATION_PHASE_01_REPORT.md`  
**Verified at:** commit on `main` after Phase 01; live production boot and smoke tests on Windows, plus `pnpm run verify` (186 tests, build green).

---

## 1. Executive Summary

Phase 01 established the cross-cutting foundation. Phase 01.1 validates that foundation **operates correctly under production conditions** — not that the platform is ready for public launch.

**Verdict:** The API server is **operationally ready for continued feature development**. Production boot, configuration validation, health probes, structured logging, and security controls behave as designed. No application crash was observed during production testing; process exit code `4294967295` on Windows is external termination (`-1`), not an internal fault.

**Critical operational clarification:** Health endpoints are **`GET /api/healthz`** and **`GET /api/readyz`**. Requests to `/healthz` or `/readyz` at the site root correctly return **404**. Monitoring, load balancers, and smoke tests must use the `/api` prefix. Documentation that referenced bare paths has been corrected (see §10).

**Not ready for public launch** — and explicitly out of scope for this phase — are: wired top-level deployment for the full stack, database schema and migrations, persistence of enquiries, transactional email, external monitoring integration, and database-aware readiness. Those remain Document 05 Milestone 0/2 items.

---

## 2. Production Readiness Review

### 2.1 Startup sequence

| Step | Behaviour                                                | Verified                                        |
| ---- | -------------------------------------------------------- | ----------------------------------------------- |
| 1    | `env.ts` parses `process.env` through Zod at import time | Yes — invalid config exits before Express binds |
| 2    | `app.ts` constructs middleware stack                     | Yes — code review + tests                       |
| 3    | `index.ts` calls `app.listen(PORT)`                      | Yes — live boot                                 |
| 4    | Redacted `configSummary()` logged on success             | Yes — first log line after listen               |
| 5    | Request handling via `/api` router                       | Yes — smoke tests                               |

**Startup timing (local, post-build):** esbuild bundle ~2.6 s; process listening ~2.1 s after `node dist/index.mjs` (Windows, port 5099).

### 2.2 Environment loading and validation

- Variables are parsed once at module load (`artifacts/api-server/src/config/env.ts`).
- Production (`APP_ENV` or `NODE_ENV` = `production`) **requires** `COOKIE_SECRET` (≥32 characters) and `TRUST_PROXY=true`.
- Invalid configuration prints a Zod prettified error and **`process.exit(1)`** before listening.

**Live verification:**

```
Invalid environment configuration:
✖ COOKIE_SECRET is required in production
  → at COOKIE_SECRET
exit=1
```

### 2.3 Dependency initialization

| Dependency                      | Initialized at boot  | Notes                          |
| ------------------------------- | -------------------- | ------------------------------ |
| Express middleware              | Yes                  | Full stack wired in `app.ts`   |
| `@workspace/platform` container | Lazy on first import | In-memory adapters             |
| PostgreSQL / `lib/db`           | **No**               | Not imported by API routes yet |
| Email / storage vendors         | **No**               | Interfaces only                |

This is correct for Phase 01: the process starts without a database, and `/api/healthz` intentionally does not probe one.

### 2.4 Graceful shutdown

Implemented in `artifacts/api-server/src/index.ts`:

1. `SIGTERM` / `SIGINT` → `beginShutdown()` (sets lifecycle flag).
2. `/api/readyz` returns **503** `{"status":"shutting_down"}` while shutting down.
3. `server.close()` drains in-flight connections.
4. Forced exit after `SHUTDOWN_TIMEOUT_MS` (default 10 s) if drain fails.

**Recommendation:** Add an automated test that calls `beginShutdown()` and asserts `/api/readyz` → 503, with a test-only lifecycle reset helper. Behaviour is implemented and documented; live SIGTERM rehearsal was not performed in this phase.

### 2.5 Error handling during startup

| Failure             | Outcome                       |
| ------------------- | ----------------------------- |
| Invalid env         | stderr message + exit 1       |
| Listen error        | logged + exit 1               |
| Uncaught exception  | fatal log + exit 1            |
| Unhandled rejection | error log (process continues) |

### 2.6 Recommendations

| #   | Recommendation                                                            | Priority                  |
| --- | ------------------------------------------------------------------------- | ------------------------- |
| R1  | Log application version / git SHA at startup for deploy correlation       | Minor                     |
| R2  | Rehearse SIGTERM drain in staging and measure time-to-drain               | Recommended before launch |
| R3  | Extend `/api/readyz` with database ping when `DATABASE_URL` is configured | Recommended before launch |

---

## 3. Health Check Validation

### 3.1 Endpoint reference

| Probe                | URL            | Method | Success | Body                         |
| -------------------- | -------------- | ------ | ------- | ---------------------------- |
| **Liveness**         | `/api/healthz` | GET    | 200     | `{"status":"ok"}`            |
| **Readiness**        | `/api/readyz`  | GET    | 200     | `{"status":"ready"}`         |
| Readiness (draining) | `/api/readyz`  | GET    | 503     | `{"status":"shutting_down"}` |

OpenAPI documents these as `/healthz` and `/readyz` **relative to** `servers[0].url: /api` — full paths are `/api/healthz` and `/api/readyz`.

### 3.2 Live smoke results (production mode, port 5099)

| Request            | Status  | Notes                                     |
| ------------------ | ------- | ----------------------------------------- |
| `GET /api/healthz` | **200** | `{"status":"ok"}`, `x-request-id` present |
| `GET /api/readyz`  | **200** | `{"status":"ready"}`                      |
| `GET /healthz`     | **404** | Expected — router mounted at `/api`       |
| `GET /readyz`      | **404** | Expected — do not point monitors here     |

### 3.3 Information exposed

Responses contain **only** a status enum. No version strings, build ids, dependency health, or stack details. Safe for unauthenticated probes.

### 3.4 Deployment configuration

| Location                                              | Path configured                | Correct |
| ----------------------------------------------------- | ------------------------------ | ------- |
| `artifacts/api-server/.replit-artifact/artifact.toml` | `/api/healthz`                 | Yes     |
| `artifacts/api-server/src/app.test.ts`                | `/api/healthz`, `/api/readyz`  | Yes     |
| `lib/api-spec/openapi.yaml`                           | `/healthz` under server `/api` | Yes     |

### 3.5 Documentation corrections applied

Bare `/healthz` and `/readyz` references in operational docs were updated to `/api/healthz` and `/api/readyz` in:

- `docs/DOCUMENT_03_5_ENGINEERING_STANDARDS.md` (smoke test guidance)
- `docs/DOCUMENT_03_ARCHITECTURE_REVIEW.md`
- `docs/DOCUMENT_05_ENTERPRISE_DELIVERY_ROADMAP.md`
- `docs/02-architecture-assessment.md`
- `replit.md` (new Production operations section)

---

## 4. Monitoring Readiness

### 4.1 Current state

| Capability         | Status  | Mechanism                                                      |
| ------------------ | ------- | -------------------------------------------------------------- |
| Application uptime | Ready   | `/api/healthz` liveness                                        |
| Traffic readiness  | Ready   | `/api/readyz` (+ 503 on drain)                                 |
| Request logging    | Ready   | `pino-http` — method, path, status, `responseTime`             |
| Error tracking     | Partial | Structured logs; no external APM yet                           |
| Performance timing | Ready   | `responseTime` on every request log line                       |
| Correlation ID     | Ready   | `x-request-id` header + `requestId` in logs and error envelope |
| Security events    | Ready   | `channel: "security"` — CORS, CSRF, rate limit, auth denial    |
| Audit events       | Partial | `channel: "audit"` — log sink only until DB table              |

### 4.2 Recommended integrations (not implemented)

| Service                         | Purpose                           | When                                |
| ------------------------------- | --------------------------------- | ----------------------------------- |
| **Sentry** or **OpenTelemetry** | Error aggregation, trace export   | Milestone 2 first production deploy |
| **Datadog / Grafana Cloud**     | Log drain, dashboards, alerting   | Same                                |
| **Uptime probe**                | External synthetic `/api/healthz` | Before public launch                |

Probe configuration example:

```
GET https://<host>/api/healthz  → expect 200, body.status == "ok"
GET https://<host>/api/readyz   → expect 200, body.status == "ready"
Alert on: 5xx rate, p95 latency, readyz 503 outside deploy window
```

---

## 5. Logging Validation

### 5.1 Production startup log (redacted summary)

```json
{
  "level": 30,
  "nodeEnv": "production",
  "appEnv": "production",
  "port": 5099,
  "logLevel": "info",
  "trustProxy": true,
  "corsOrigins": 2,
  "bodyLimit": "100kb",
  "rateLimit": "300/60000ms",
  "cookieSecretConfigured": true,
  "databaseConfigured": false,
  "msg": "Server listening"
}
```

### 5.2 Request log shape

```json
{
  "req": { "id": 1, "method": "GET", "url": "/api/healthz" },
  "res": { "statusCode": 200 },
  "responseTime": 49,
  "msg": "request completed"
}
```

### 5.3 Field checklist

| Field          | Present            | Location                                                                      |
| -------------- | ------------------ | ----------------------------------------------------------------------------- |
| Timestamp      | Yes                | Pino `time`                                                                   |
| Request ID     | Yes                | `req.requestId`, error envelope, `x-request-id` header                        |
| Correlation ID | Same as request ID | No separate `correlationId` field — acceptable for single-service phase       |
| Severity       | Yes                | Pino `level`                                                                  |
| Route          | Yes                | `req.method`, `req.url` (query stripped)                                      |
| Execution time | Yes                | `responseTime`                                                                |
| Error context  | Yes                | `code`, `status`, `requestId` on expected errors; `err` + stack on unexpected |

### 5.4 Sensitive data handling

Pino redact paths include: `authorization`, `cookie`, `set-cookie`, `password`, `token`, `*.secret`.  
`configSummary()` reports **presence** of secrets, never values.

### 5.5 Findings

| Finding                                       | Category          |
| --------------------------------------------- | ----------------- |
| JSON logs in production (no pretty transport) | Ready             |
| Query strings stripped from logged URLs       | Ready             |
| Separate security/audit channels              | Ready             |
| No distributed trace id beyond `x-request-id` | Minor Improvement |

---

## 6. Security Validation

### 6.1 Controls verified

| Control              | Implementation                                                                  | Verified                                     |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| **CSRF**             | Double-submit cookie; fail-closed when any request cookie lacks matching header | Vitest (`middleware.test.ts`)                |
| **Cookies**          | `httpOnly` session-ready defaults; `secure` in production; `sameSite: lax`      | Config review                                |
| **CORS**             | Explicit allowlist via `CORS_ORIGINS`; credentials enabled                      | Vitest + live (allowed origin 200, evil 403) |
| **Rate limiting**    | Global 300/min; auth limiter defined for future credential routes               | Code review                                  |
| **Security headers** | Helmet CSP `default-src 'none'`, HSTS in production, `X-Powered-By` disabled    | Vitest                                       |
| **Input validation** | Zod env at boot; Zod/OpenAPI on health responses; body size limit               | Tests + review                               |
| **Secrets**          | `COOKIE_SECRET` required in production; not logged                              | Live boot failure test                       |

### 6.2 CSRF note

Safe methods (`GET`, `HEAD`, `OPTIONS`) skip verification. Requests with **no cookies** skip verification (correct for anonymous public writes). Requests with **any cookie** on an unsafe method require a matching `x-csrf-token` header.

The earlier production observation (403 on cookie-bearing POST without token) matches Vitest coverage. Manual PowerShell probes may not send cookies in a way `cookie-parser` receives; rely on automated tests for CSRF proof.

### 6.3 Common misconfiguration

| Mistake                                                          | Symptom                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Setting `CORS_ALLOWED_ORIGINS` instead of **`CORS_ORIGINS`**     | Allowlist empty (`corsOrigins: 0` in startup log); browser gets 403 |
| Monitoring `/healthz` instead of **`/api/healthz`**              | False-negative 404 alerts                                           |
| Production without **`TRUST_PROXY=true`** behind a load balancer | Boot failure (intentional) or wrong client IPs for rate limiting    |

---

## 7. Deployment Review

### 7.1 Build process

| Artifact       | Command                                             | Output                                                  | Verified          |
| -------------- | --------------------------------------------------- | ------------------------------------------------------- | ----------------- |
| API server     | `pnpm --filter @workspace/api-server run build`     | `artifacts/api-server/dist/index.mjs` (~1.9 MB bundled) | Yes               |
| Public website | `pnpm --filter @workspace/ckbhse-website run build` | `dist/public/` static assets                            | Yes (prior build) |
| Workspace      | `pnpm run build`                                    | typecheck + recursive build                             | Yes               |

### 7.2 Production startup

**Local / generic:**

```bash
pnpm --filter @workspace/api-server run build
# .env at repo root or exported variables
pnpm --filter @workspace/api-server run start
# equivalent to:
node --env-file-if-exists=../../.env --enable-source-maps ./dist/index.mjs
```

**Replit API service** (`artifacts/api-server/.replit-artifact/artifact.toml`):

- Build: `pnpm --filter @workspace/api-server run build`
- Run: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- Port: `8080`
- Startup health: `/api/healthz`

**Gap:** Root `.replit` declares `deploymentTarget = "autoscale"` but has **no top-level `build` or `run` command** for the full platform (website + API). API deployment is configured per-artifact; full-stack edge routing remains a Milestone 0 deliverable.

### 7.3 Static assets

The website is a Vite SPA. Production output is static files under `artifacts/ckbhse-website/dist/public/`. In development, Vite proxies `/api` to the API server (`API_PROXY_TARGET`, default `http://localhost:5000`). In production, the edge must route `/api/*` to the Node process and other paths to the static bundle (Document 04 §2.4).

### 7.4 Assumptions

- Single origin with path prefixes (`/`, `/api`, future portals).
- TLS terminates at the edge; Node sees `TRUST_PROXY=true`.
- Session cookies remain first-party (no cross-origin portal subdomains in Phase 01).
- Health probes originate from the load balancer without an `Origin` header (CORS not applicable to probes).

---

## 8. Environment Configuration Audit

### 8.1 Required vs optional (API server)

| Variable                                            | Development                 | Production                          | Validated |
| --------------------------------------------------- | --------------------------- | ----------------------------------- | --------- |
| `NODE_ENV`                                          | default `development`       | `production`                        | Yes       |
| `APP_ENV`                                           | optional                    | optional (falls back to `NODE_ENV`) | Yes       |
| `PORT`                                              | default `5000`              | default `5000`                      | Yes       |
| `COOKIE_SECRET`                                     | optional                    | **required**, min 32                | Yes       |
| `TRUST_PROXY`                                       | default false               | **must be true**                    | Yes       |
| `CORS_ORIGINS`                                      | default empty (same-origin) | comma-separated allowlist           | Yes       |
| `DATABASE_URL`                                      | optional for API            | optional for API                    | Yes       |
| `LOG_LEVEL`                                         | default `info`              | default `info`                      | Yes       |
| `RATE_LIMIT_*`, `BODY_LIMIT`, `SHUTDOWN_TIMEOUT_MS` | defaults                    | defaults                            | Yes       |
| `COOKIE_DOMAIN`                                     | optional                    | optional                            | Yes       |

### 8.2 `.env.example` alignment

`.env.example` matches the Zod schema with accurate comments. **Correction applied in this phase:** operational docs now stress the exact name `CORS_ORIGINS`.

### 8.3 Frontend variables (website)

| Variable           | Purpose                        |
| ------------------ | ------------------------------ |
| `BASE_PATH`        | Sub-path serving (default `/`) |
| `API_PROXY_TARGET` | Dev-only `/api` proxy target   |
| `PORT`             | Vite dev server (default 5180) |

---

## 9. Operational Documentation

### 9.1 Local production build and API startup

```bash
# From repository root
pnpm install
pnpm --filter @workspace/api-server run build

# Create .env (see .env.example). Minimum for production boot:
#   NODE_ENV=production
#   APP_ENV=production
#   COOKIE_SECRET=<32+ random bytes>
#   TRUST_PROXY=true
#   PORT=5000
#   CORS_ORIGINS=http://localhost:5180   # if browser calls API cross-origin

pnpm --filter @workspace/api-server run start
```

### 9.2 Verify running

```bash
curl -s http://localhost:5000/api/healthz   # {"status":"ok"}
curl -s http://localhost:5000/api/readyz    # {"status":"ready"}
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/healthz   # 404 expected
```

Check response header `x-request-id` is present.

### 9.3 Website (static)

```bash
pnpm --filter @workspace/ckbhse-website run build
pnpm --filter @workspace/ckbhse-website run serve   # serves dist/public
```

Use the Vite dev server with `/api` proxy only for development.

### 9.4 Troubleshooting

| Symptom                                  | Likely cause                         | Fix                                                |
| ---------------------------------------- | ------------------------------------ | -------------------------------------------------- |
| Process exits immediately on boot        | Invalid env                          | Read stderr; compare to `.env.example`             |
| `COOKIE_SECRET is required`              | Missing secret in production         | Generate 32+ byte secret                           |
| `TRUST_PROXY must be enabled`            | Production behind proxy without flag | Set `TRUST_PROXY=true`                             |
| Monitor shows 404 on `/healthz`          | Wrong path                           | Use **`/api/healthz`**                             |
| Browser CORS 403                         | Origin not allowlisted               | Add to `CORS_ORIGINS`                              |
| CSRF 403 on POST                         | Cookie without `x-csrf-token`        | Prime token via GET; echo header                   |
| `corsOrigins: 0` with origins configured | Wrong env var name                   | Use **`CORS_ORIGINS`**, not `CORS_ALLOWED_ORIGINS` |

### 9.5 Shutdown

Send `SIGTERM` or `SIGINT`. Instance should:

1. Log `Shutting down`
2. Return 503 on `/api/readyz`
3. Complete in-flight requests
4. Log `Shutdown complete` and exit 0

If drain exceeds 10 s, process exits 1 with a force message.

### 9.6 Quick verification pipeline

```bash
pnpm run verify    # format, lint, typecheck, 186 tests
pnpm run build     # includes typecheck + artifact builds
```

---

## 10. Smoke Test Checklist

Reusable after every deploy (API-only until website is co-deployed):

| #   | Check               | Command / action                           | Pass criteria                                                     |
| --- | ------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| 1   | Application starts  | Deploy / `node dist/index.mjs`             | Process listens; no exit 1                                        |
| 2   | Startup log sane    | First log line                             | `msg: "Server listening"`, `cookieSecretConfigured: true` in prod |
| 3   | Liveness            | `GET /api/healthz`                         | 200, `{"status":"ok"}`                                            |
| 4   | Readiness           | `GET /api/readyz`                          | 200, `{"status":"ready"}`                                         |
| 5   | Wrong path rejected | `GET /healthz`                             | 404 (confirms monitor path)                                       |
| 6   | Correlation         | Any API response                           | `x-request-id` header set                                         |
| 7   | CORS allowlist      | `GET /api/healthz` + allowed `Origin`      | 200 + `access-control-allow-origin`                               |
| 8   | CORS deny           | `GET /api/healthz` + unknown `Origin`      | 403                                                               |
| 9   | Security headers    | `GET /api/healthz`                         | CSP, nosniff, no `X-Powered-By`                                   |
| 10  | CSRF enforced       | `POST` + session cookie, no CSRF header    | 403 (Vitest; run `pnpm --filter @workspace/api-server test`)      |
| 11  | Error envelope      | `GET /api/nope`                            | 404 structured `{ error: { code, message, requestId } }`          |
| 12  | Auth initializes    | N/A until Milestone 3                      | Anonymous context only today                                      |
| 13  | OpenAPI contract    | `pnpm --filter @workspace/api-server test` | `contract.test.ts` passes                                         |
| 14  | Static assets       | Website build + serve                      | `index.html` served (when co-deployed)                            |
| 15  | Graceful shutdown   | SIGTERM during idle                        | `/api/readyz` → 503; clean exit (staging rehearsal)               |

Automated coverage today: rows 3–11 and 13 via Vitest (`35` API server tests).

---

## 11. Launch Readiness Assessment

### 11.1 Ready (continue feature development)

| Area                                     | Evidence                                         |
| ---------------------------------------- | ------------------------------------------------ |
| Production API boot with validated env   | Live boot + failure test                         |
| Health endpoints at correct paths        | Smoke + tests                                    |
| Structured logging with request ID       | Production logs                                  |
| Security headers, CORS, rate limit, CSRF | Tests + review                                   |
| Graceful shutdown design                 | Code review                                      |
| Error envelope consistency               | Tests + OpenAPI contract test                    |
| Build and verify pipeline                | `pnpm run verify` + `pnpm run build`             |
| Operational docs                         | This report + `replit.md` §Production operations |

### 11.2 Minor Improvement

| Item                                    | Notes                                                |
| --------------------------------------- | ---------------------------------------------------- |
| Separate `correlationId` vs `requestId` | Not needed until multi-service; document equivalence |
| Startup version/build stamp             | Aids incident correlation                            |
| Automated shutdown test                 | Implement with test-only lifecycle reset             |
| Root `.replit` platform deploy          | API artifact.toml is sufficient for API-only         |

### 11.3 Recommended Before Public Launch (Document 05 M2)

| Item                                        | Why                                                                |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Wire full edge deployment (static + API)    | No public URL without it                                           |
| External monitoring + alerting              | Detect outages without users                                       |
| Database + migrations + enquiry persistence | Stop losing leads                                                  |
| Email provider adapter                      | Transactional mail                                                 |
| `/api/readyz` database check                | Orchestrator should not route to DB-less instance once DB required |
| Backup restore rehearsal                    | Launch gate A11                                                    |
| Playwright / axe / secret scanning in CI    | Document 05 M0                                                     |

### 11.4 Blocking (for public launch only — not for Phase 02 foundation work)

| Blocker                                            | Phase |
| -------------------------------------------------- | ----- |
| No production deployment of website + API together | M0/M2 |
| Contact form discards submissions                  | M2    |
| No SEO metadata / prerendering                     | M1    |
| No authentication                                  | M3    |

**None of these block continuing Milestone 0/1 engineering** on schema, public site, or enquiry slice in a development/staging environment.

---

## 12. Files Changed in Phase 01.1

| File                                                            | Change                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| `docs/IMPLEMENTATION_PHASE_01_1_PRODUCTION_READINESS_REPORT.md` | **Created** — this report                                   |
| `replit.md`                                                     | Added Production operations section; pointer to this report |
| `docs/DOCUMENT_03_5_ENGINEERING_STANDARDS.md`                   | Smoke paths → `/api/healthz`, `/api/readyz`                 |
| `docs/DOCUMENT_03_ARCHITECTURE_REVIEW.md`                       | Endpoint paths corrected                                    |
| `docs/DOCUMENT_05_ENTERPRISE_DELIVERY_ROADMAP.md`               | Endpoint paths corrected                                    |
| `docs/02-architecture-assessment.md`                            | Endpoint paths corrected                                    |

No domain logic, schema, or feature code was added.

---

## 13. Verification Summary

| Gate                                      | Result                           |
| ----------------------------------------- | -------------------------------- |
| Production boot (valid env)               | Pass                             |
| Production boot (missing `COOKIE_SECRET`) | Pass — exit 1 with clear message |
| `GET /api/healthz`                        | Pass — 200                       |
| `GET /api/readyz`                         | Pass — 200                       |
| Root `/healthz`, `/readyz`                | Pass — 404 as designed           |
| CORS allow / deny                         | Pass                             |
| `pnpm run verify`                         | Pass — 186 tests                 |
| `pnpm run build`                          | Pass                             |
| Monitoring docs vs actual paths           | Corrected                        |

---

## 14. Recommendations Before Phase 02

1. **Use `/api/healthz` and `/api/readyz` in all monitors** — never bare paths.
2. **Wire Milestone 0 deployment** — edge routes for static site + API; confirm Replit or target host.
3. **Author first migrations** — organisations, users, enquiries; then add DB check to `/api/readyz`.
4. **Select email provider** — blocks enquiry slice.
5. **Keep smoke checklist (§10)** as a post-deploy gate until CI smoke automation exists.
6. **Proceed to Public Website implementation (Document 05 M1)** with confidence that the API foundation behaves correctly in production mode.

---

_End of report._
