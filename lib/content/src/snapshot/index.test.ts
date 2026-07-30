import { buildContentSnapshot } from '@workspace/content/snapshot';
import { describe, expect, it } from 'vitest';

describe('buildContentSnapshot', () => {
  it('adds /resources alias when /knowledge hub is present', () => {
    const snapshot = buildContentSnapshot([
      {
        contentType: 'hub',
        slug: 'knowledge',
        path: '/knowledge',
        title: 'Knowledge',
        category: null,
        segment: null,
        seo: { title: 'Knowledge' },
        payload: { hero: { title: 'Knowledge' } },
      },
    ]);

    expect(snapshot.entries.map((entry) => entry.path)).toEqual([
      '/knowledge',
      '/resources',
    ]);
  });
});
