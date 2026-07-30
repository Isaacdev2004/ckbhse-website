import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CmsContentSnapshot } from '../snapshot/index.js';
import { CompositeContentLoader } from './composite-content-loader.js';
import { DatabaseContentLoader } from './database-content-loader.js';
import {
  configureContentLoader,
  FileContentLoader,
  type ContentSource,
} from './index.js';

export type ContentSourceMode = 'file' | 'database' | 'composite';

export function resolveContentLoader(options: {
  mode: ContentSourceMode;
  snapshot?: CmsContentSnapshot;
}): ContentSource {
  const fileLoader = new FileContentLoader();
  if (options.mode === 'file' || !options.snapshot) {
    return fileLoader;
  }

  const databaseLoader = new DatabaseContentLoader(options.snapshot);
  if (options.mode === 'database') {
    return databaseLoader;
  }

  return new CompositeContentLoader(databaseLoader, fileLoader);
}

export function loadSnapshotFromFile(snapshotPath: string): CmsContentSnapshot {
  const raw = readFileSync(resolve(snapshotPath), 'utf8');
  return JSON.parse(raw) as CmsContentSnapshot;
}

export function bootstrapContentLoaderFromEnv(
  env: Record<string, string | undefined> = process.env,
) {
  const mode = (env.CONTENT_SOURCE ??
    env.VITE_CONTENT_SOURCE ??
    'composite') as ContentSourceMode;

  if (mode === 'file') {
    configureContentLoader(new FileContentLoader());
    return;
  }

  const snapshotPath =
    env.CMS_SNAPSHOT_PATH ??
    env.VITE_CMS_SNAPSHOT_PATH ??
    resolve(process.cwd(), '.cms-snapshot.json');

  try {
    const snapshot = loadSnapshotFromFile(snapshotPath);
    configureContentLoader(resolveContentLoader({ mode, snapshot }));
  } catch {
    configureContentLoader(new FileContentLoader());
  }
}
