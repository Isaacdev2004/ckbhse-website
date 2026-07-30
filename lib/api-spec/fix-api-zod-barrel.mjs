/**
 * Orval regenerates lib/api-zod/src/index.ts with `export * from './generated/types'`,
 * which duplicates Zod schema names already exported from ./generated/api and breaks
 * tsc. Restore the hand-maintained barrel after every codegen run.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const indexPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../api-zod/src/index.ts',
);

writeFileSync(
  indexPath,
  `export * from './generated/api';
export { ErrorResponseErrorCode } from './generated/types/errorResponseErrorCode';
`,
  'utf8',
);
