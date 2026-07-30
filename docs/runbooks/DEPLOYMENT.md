# Deployment runbook (Vercel + Render + Supabase)

Production topology:

- **Public website** → [Vercel](https://vercel.com) (`artifacts/ckbhse-website`)
- **API** → [Render](https://render.com) (`artifacts/api-server`)
- **Database** → [Supabase](https://supabase.com) Postgres (migrations in `lib/db/migrations`)

The site expects **same-origin `/api/*`**. Vercel rewrites `/api/*` to the Render API so cookies and CSRF stay on one browser origin.

---

## 1. Prerequisites

- GitHub repository (push this monorepo)
- Supabase project with connection string / password
- Node **24+** and **pnpm 9+** locally for migrations and smoke tests

---

## 2. Supabase (database)

1. Create a Supabase project (EU region recommended for UK data).
2. Copy **Project URL**, **database password**, and note the **project ref** (subdomain).
3. From your machine (with `.env` filled in):

```bash
pnpm install
pnpm --filter @workspace/db run migrate
```

4. Confirm tables exist in Supabase SQL editor (`auth.users`, `platform.organizations`, etc.).

**Production env mapping:**

| Variable | Example |
|----------|---------|
| `SUPABASE_URL` | `https://abcdefgh.supabase.co` |
| `SUPABASE_DB_PASSWORD` | your DB password |
| `PLATFORM_ORGANIZATION_ID` | UUID from seed / `platform.organizations` |

---

## 3. Render (API)

1. New **Web Service** → connect GitHub repo.
2. Use **`render.yaml`** at repo root (Blueprint) **or** set manually:
   - **Build:** `pnpm install --frozen-lockfile && pnpm run build:api`
   - **Start:** `node artifacts/api-server/dist/index.cjs`
   - **Health check path:** `/api/readyz`
3. **Environment** (required):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `APP_ENV` | `production` |
| `TRUST_PROXY` | `true` |
| `COOKIE_SECRET` | random string ≥ 32 chars |
| `SUPABASE_URL` | your Supabase URL |
| `SUPABASE_DB_PASSWORD` | DB password |
| `PLATFORM_ORGANIZATION_ID` | platform org UUID |
| `SITE_URL` | `https://your-domain.co.uk` (no trailing slash) |

4. Optional: `SMTP_*`, `STORAGE_*`, `SENTRY_DSN`, `TURNSTILE_*` (see `.env.example`).
5. Deploy and note the public URL, e.g. `https://ckbhse-api.onrender.com`.
6. Smoke test:
   - `GET https://<render-host>/api/healthz` → `{ "status": "ok" }`
   - `GET https://<render-host>/api/readyz` → `{ "status": "ready" }` (503 if DB down)

---

## 4. Vercel (public website)

1. Import GitHub repo in Vercel.
2. **Root directory:** repository root (uses root `vercel.json`).
3. **Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `SITE_URL` | `https://your-domain.co.uk` |

4. **Before first deploy:** edit `vercel.json` and replace `YOUR_RENDER_API_HOST` with your Render hostname (no `https://`):

```json
"destination": "https://ckbhse-api.onrender.com/api/:path*"
```

5. Deploy. Confirm:
   - Homepage loads
   - `https://your-domain.co.uk/api/healthz` returns JSON (proxied to Render)
   - Contact form submits (needs SMTP on Render for email)

6. **Custom domain:** add in Vercel → update `SITE_URL` on Render and Vercel → redeploy both.

---

## 5. Post-deploy checklist

- [ ] Migrations applied to production Supabase
- [ ] `/api/readyz` returns `ready`
- [ ] Login works on admin/staff portals (if deployed separately)
- [ ] Legal pages render (`/legal/privacy`, etc.)
- [ ] Cookie banner + analytics only after consent (if configured)
- [ ] Rotate any credentials that were ever committed or shared in chat
- [ ] Create production admin user (do not rely on dev seed password in production)

---

## 6. Admin / staff / client portals (optional)

These live under `artifacts/admin-portal`, `staff-portal`, `client-portal`. They are **not** included in the default Vercel config. Options:

- Separate Vercel projects with their own `vercel.json` and the same `/api` rewrite, or
- Serve from subpaths on one domain (requires additional build/routing work).

For GA, deploy admin at e.g. `admin.your-domain.co.uk` with the same API rewrite pattern.

---

## 7. Local production smoke test

```bash
pnpm run build:website
pnpm run build:api
NODE_ENV=production node artifacts/api-server/dist/index.mjs
# In another terminal, serve static site or use vite preview
```

---

## 8. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| API 503 on readyz | Wrong Supabase password or network from Render |
| Login fails, cookies missing | `SITE_URL` mismatch or missing `TRUST_PROXY=true` |
| CORS errors | Should not occur with same-origin rewrite; check `vercel.json` rewrite |
| 403 on admin dashboard | User lacks `super_admin` or tenant permissions |
| Contact form 500 | SMTP not configured on Render |
