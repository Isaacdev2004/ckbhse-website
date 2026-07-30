# CKBHSE local dev stack (Supabase — no Docker)
#
# Usage (from repo root):
#   .\scripts\local-lms-test.ps1 -Action setup    # verify env + run migrations
#   .\scripts\local-lms-test.ps1 -Action migrate  # apply Drizzle migrations
#   .\scripts\local-lms-test.ps1 -Action api      # API on :5000
#   .\scripts\local-lms-test.ps1 -Action portal   # Client portal on :5183
#   .\scripts\local-lms-test.ps1 -Action learn    # Trainer portal on :5184

param(
  [ValidateSet('setup', 'migrate', 'api', 'portal', 'learn')]
  [string]$Action = 'setup'
)

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Ensure-Env {
  if (-not (Test-Path "$Root\.env")) {
    Copy-Item "$Root\.env.example" "$Root\.env"
    Write-Host "Created .env from .env.example"
    Write-Host "Set SUPABASE_DB_PASSWORD from Supabase dashboard, then re-run setup."
    exit 1
  }
}

function Test-SupabaseEnv {
  $envContent = Get-Content "$Root\.env" -Raw
  $hasUrl = $envContent -match 'SUPABASE_URL=https://'
  $hasPassword = $envContent -match '^SUPABASE_DB_PASSWORD=.+' -or $envContent -match '^DATABASE_URL=postgresql://'
  if (-not $hasUrl) {
    Write-Host "SUPABASE_URL is missing in .env — see .env.example"
    exit 1
  }
  if (-not $hasPassword) {
    Write-Host "Set SUPABASE_DB_PASSWORD in .env (Supabase → Settings → Database), then re-run."
    exit 1
  }
}

switch ($Action) {
  'setup' {
    Ensure-Env
    Test-SupabaseEnv
    Write-Host "Applying migrations to Supabase..."
    & $MyInvocation.MyCommand.Path -Action migrate
  }
  'migrate' {
    Ensure-Env
    Test-SupabaseEnv
    pnpm --filter @workspace/db run migrate
  }
  'api' {
    Ensure-Env
    pnpm --filter @workspace/api-server run dev
  }
  'portal' {
    pnpm --filter @workspace/client-portal run dev
  }
  'learn' {
    pnpm --filter @workspace/learning-portal run dev
  }
}
