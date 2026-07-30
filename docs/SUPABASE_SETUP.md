# Supabase setup

This project uses **Supabase** as its database. There is no local Docker or PostgreSQL setup.

**Project:** [woszwytfhdtouesqccmf](https://supabase.com/dashboard/project/woszwytfhdtouesqccmf)  
**API URL:** `https://woszwytfhdtouesqccmf.supabase.co`

---

## 1. Get your database password

1. Open [Supabase Dashboard → Settings → Database](https://supabase.com/dashboard/project/woszwytfhdtouesqccmf/settings/database).
2. Copy or reset the **database password**.

---

## 2. Configure `.env`

Copy `.env.example` to `.env` if you have not already:

```powershell
Copy-Item .env.example .env
```

Set at minimum:

```env
SUPABASE_URL=https://woszwytfhdtouesqccmf.supabase.co
SUPABASE_DB_PASSWORD=your-password-here
PLATFORM_ORGANIZATION_ID=00000000-0000-4000-8000-000000000001
COOKIE_SECRET=generate-a-32-char-or-longer-secret
```

The app builds connection strings automatically:

| Purpose | Connection |
|---------|------------|
| **API runtime** | Transaction pooler (port 6543, `pgbouncer=true`) |
| **Migrations** | Direct connection (`db.woszwytfhdtouesqccmf.supabase.co:5432`) |

If your pooler region differs from `eu-west-2`, set `SUPABASE_POOLER_HOST` from the Supabase connection string panel.

You can also paste full URLs from the dashboard:

```env
DATABASE_URL=...transaction pooler URI...
DATABASE_MIGRATE_URL=...direct URI...
```

---

## 3. Run migrations

```powershell
pnpm --filter @workspace/db run migrate
```

Or use the helper script:

```powershell
.\scripts\local-lms-test.ps1 -Action setup
```

This applies all Drizzle SQL migrations (`lib/db/migrations/`) to your Supabase database.

---

## 4. Start the API

```powershell
pnpm --filter @workspace/api-server run dev
```

Verify:

```powershell
curl http://localhost:5000/api/v1/health
curl http://localhost:5000/api/v1/system/health
```

---

## Connection notes

- **SSL** is enabled automatically for `*.supabase.co` hosts.
- **Pool size** defaults to `5` per process (`DATABASE_POOL_MAX` to override). Supabase free tier has tight connection limits — keep this low.
- **Do not use `drizzle-kit push`** against Supabase; always use versioned migrations.
- Supabase Auth / Storage / Realtime are **not** used yet — only hosted Postgres. The app keeps its existing auth layer.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `password authentication failed` | Reset password in Supabase dashboard; update `.env` |
| `Tenant or user not found` on pooler | Set correct `SUPABASE_POOLER_HOST` for your region |
| Migration hangs | Use `DATABASE_MIGRATE_URL` with the **direct** connection (port 5432), not the pooler |
| `PLATFORM_ORGANIZATION_ID is required` | Set the UUID in `.env` whenever the database is configured |

---

## Removed local Postgres

`docker-compose.yml` has been removed. All environments target Supabase.
