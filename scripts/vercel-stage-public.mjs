/**
 * Stage all frontends for Vercel static hosting:
 * - public/              ← public website
 * - public/admin/        ← admin portal (base /admin/)
 * - public/staff/          ← staff portal (base /staff/)
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'public');

const apps = [
  {
    name: 'website',
    source: path.join(root, 'artifacts/ckbhse-website/dist/public'),
    dest: target,
  },
  {
    name: 'admin-portal',
    source: path.join(root, 'artifacts/admin-portal/dist'),
    dest: path.join(target, 'admin'),
  },
  {
    name: 'staff-portal',
    source: path.join(root, 'artifacts/staff-portal/dist'),
    dest: path.join(target, 'staff'),
  },
];

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const app of apps) {
  cpSync(app.source, app.dest, { recursive: true });
  console.log(`[vercel-stage-public] Staged ${app.name} → ${app.dest}`);
}
