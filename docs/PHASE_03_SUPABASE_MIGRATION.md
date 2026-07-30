# Phase 03 — Supabase Migration

**Status:** COMPLETE (configuration) — migrations pending database password  
**Date:** 2026-07-30

---

## Summary

The platform database target is now **Supabase** (`woszwytfhdtouesqccmf`). Local Docker Compose and localhost PostgreSQL defaults have been removed.

---

## Changes

| Area | Change |
|------|--------|
| **Removed** | `docker-compose.yml` |
| **Connection** | `lib/db/src/connection.ts` — SSL, pool limits, Supabase URL builder |
| **Runtime** | `lib/db/src/index.ts` — uses transaction pooler by default |
| **Migrations** | `lib/db/src/migrate.ts` — direct Supabase connection, auto-loads `.env` |
| **Env** | `.env.example` — `SUPABASE_URL`, `SUPABASE_DB_PASSWORD`, optional pooler host |
| **API config** | `databaseConfig.configured` accepts Supabase env vars |
| **Scripts** | `local-lms-test.ps1` — no Docker; migrate against Supabase |
| **DR probe** | `scripts/dr-rehearsal.mts` — Supabase SSL via `@workspace/db` |
| **Journal fix** | `0005_audit` added to Drizzle migration journal |
| **Docs** | `docs/SUPABASE_SETUP.md` |

---

## Required action (you)

1. Open [Supabase Database Settings](https://supabase.com/dashboard/project/woszwytfhdtouesqccmf/settings/database)
2. Set `SUPABASE_DB_PASSWORD` in `.env`
3. Run: `pnpm --filter @workspace/db run migrate`

---

## Connection model

| Use | Endpoint |
|-----|----------|
| API (`getPool`) | Transaction pooler `:6543?pgbouncer=true` |
| Migrations | Direct `db.woszwytfhdtouesqccmf.supabase.co:5432` |

Set `SUPABASE_POOLER_HOST` if your project's pooler region is not `eu-west-2`.
