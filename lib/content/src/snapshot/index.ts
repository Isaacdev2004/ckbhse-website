export interface CmsSnapshotEntry {
  readonly contentType: string;
  readonly slug: string;
  readonly path: string;
  readonly title: string;
  readonly category: string | null;
  readonly segment: string | null;
  readonly seo: Record<string, unknown>;
  readonly payload: Record<string, unknown>;
}

export interface CmsContentSnapshot {
  readonly generatedAt: string;
  readonly locale: string;
  readonly entries: readonly CmsSnapshotEntry[];
}

export interface PublishedCmsRow {
  contentType: string;
  slug: string;
  path: string;
  title: string;
  category: string | null;
  segment: string | null;
  seo: unknown;
  payload: unknown;
}

export function buildContentSnapshot(
  rows: readonly PublishedCmsRow[],
  locale = 'en-GB',
): CmsContentSnapshot {
  const entries: CmsSnapshotEntry[] = rows.map((row) => ({
    contentType: row.contentType,
    slug: row.slug,
    path: row.path,
    title: row.title,
    category: row.category,
    segment: row.segment,
    seo: (row.seo ?? {}) as Record<string, unknown>,
    payload: row.payload as Record<string, unknown>,
  }));

  const hasKnowledge = entries.some((entry) => entry.path === '/knowledge');
  const hasResources = entries.some((entry) => entry.path === '/resources');
  if (hasKnowledge && !hasResources) {
    const knowledge = entries.find((entry) => entry.path === '/knowledge');
    if (knowledge) {
      entries.push({
        ...knowledge,
        slug: 'resources',
        path: '/resources',
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    locale,
    entries,
  };
}

export function indexSnapshotByPath(
  snapshot: CmsContentSnapshot,
): Map<string, CmsSnapshotEntry> {
  return new Map(snapshot.entries.map((entry) => [entry.path, entry]));
}

export function filterSnapshotByType(
  snapshot: CmsContentSnapshot,
  contentType: string,
): CmsSnapshotEntry[] {
  return snapshot.entries.filter((entry) => entry.contentType === contentType);
}
