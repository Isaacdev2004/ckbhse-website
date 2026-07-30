/**
 * Vercel expects a top-level output folder (often named "public" in project
 * settings). The Vite app builds to artifacts/ckbhse-website/dist/public — copy
 * it here after build so deployment succeeds regardless of dashboard overrides.
 */
import { cpSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'artifacts/ckbhse-website/dist/public');
const target = path.join(root, 'public');

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

console.log(`[vercel-stage-public] Staged ${source} → ${target}`);
