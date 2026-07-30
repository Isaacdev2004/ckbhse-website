import {
  FileContentLoader,
  DatabaseContentLoader,
  CompositeContentLoader,
} from '@workspace/content/loader';
import { buildContentSnapshot } from '@workspace/content/snapshot';
import { describe, expect, it } from 'vitest';

function snapshotFromFileLoader() {
  const fileLoader = new FileContentLoader();
  const home = fileLoader.getHomePage();
  const resources = fileLoader.getResourcesHubPage();
  return buildContentSnapshot([
    {
      contentType: 'home',
      slug: 'home',
      path: '/',
      title: home.hero.title,
      category: null,
      segment: null,
      seo: home.seo as Record<string, unknown>,
      payload: home as Record<string, unknown>,
    },
    {
      contentType: 'hub',
      slug: 'knowledge',
      path: '/knowledge',
      title: 'Knowledge',
      category: null,
      segment: null,
      seo: resources.seo as Record<string, unknown>,
      payload: resources as Record<string, unknown>,
    },
  ]);
}

describe('DatabaseContentLoader', () => {
  it('serves home page content from a CMS snapshot', () => {
    const fileLoader = new FileContentLoader();
    const loader = new DatabaseContentLoader(snapshotFromFileLoader());
    expect(loader.getHomePage().hero.title).toBe(fileLoader.getHomePage().hero.title);
    expect(loader.getResourcesHubPage().seo.title).toBeTruthy();
  });
});

describe('CompositeContentLoader', () => {
  it('falls back to files when database snapshot is incomplete', () => {
    const fileLoader = new FileContentLoader();
    const emptySnapshot = buildContentSnapshot([]);
    const composite = new CompositeContentLoader(
      new DatabaseContentLoader(emptySnapshot),
      fileLoader,
    );

    expect(composite.getHomePage().hero.title).toBe(fileLoader.getHomePage().hero.title);
  });
});
