import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDb } from '@workspace/db';
import { DrizzleCmsStore } from '@workspace/data/stores/cms';
import { buildContentSnapshot } from '@workspace/content/snapshot';

const outputPath =
  process.env.CMS_SNAPSHOT_PATH ??
  resolve(process.cwd(), '.cms-snapshot.json');
const locale = process.env.CMS_SNAPSHOT_LOCALE ?? 'en-GB';

async function main() {
  const store = new DrizzleCmsStore(getDb());
  const rows = await store.listPublishedEntries(locale);
  const snapshot = buildContentSnapshot(rows, locale);
  writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(
    `[build-cms-snapshot] Wrote ${snapshot.entries.length} entries to ${outputPath}`,
  );
}

main().catch((error) => {
  console.error('[build-cms-snapshot] Failed:', error);
  process.exitCode = 1;
});
