// Runs as the root `preinstall` hook. Replaces a `sh -c` one-liner that could
// never execute on Windows, where the team develops.
//
// 1. Removes competing lockfiles so a stray `npm install` cannot take hold.
// 2. Refuses to continue unless the invoking package manager is pnpm.

import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

for (const lockfile of ['package-lock.json', 'yarn.lock']) {
  rmSync(path.join(repoRoot, lockfile), { force: true });
}

const userAgent = process.env['npm_config_user_agent'] ?? '';

// Empty user agent means we were not invoked by a package manager at all (for
// example a direct `node scripts/enforce-pnpm.mjs`), which is not worth failing.
if (userAgent && !userAgent.startsWith('pnpm/')) {
  console.error(
    `This workspace requires pnpm. Detected "${userAgent.split(' ')[0]}".\n` +
      'Install pnpm (https://pnpm.io/installation) and run `pnpm install`.',
  );
  process.exit(1);
}
