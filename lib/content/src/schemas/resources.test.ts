import { describe, expect, it } from 'vitest';
import { resourcePageRegistry } from '../data/resources/index.js';
import { resourcePageSchema } from './resources.js';
import {
  filterResourceCatalog,
  parseResourcePath,
  resolveRelatedResources,
  toResourceCatalogItem,
} from '../resources/catalog.js';

describe('resourcePageSchema', () => {
  it('validates all registered resource pages', () => {
    for (const page of resourcePageRegistry) {
      const result = resourcePageSchema.safeParse(page);
      expect(result.success, `${page.type}/${page.slug}`).toBe(true);
    }
  });

  it('requires unique paths', () => {
    const paths = resourcePageRegistry.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('registers 33 resources across seven types', () => {
    expect(resourcePageRegistry).toHaveLength(33);
    const types = new Set(resourcePageRegistry.map((p) => p.type));
    expect(types.size).toBe(7);
  });
});

describe('resource catalog', () => {
  it('filters by type and search query', () => {
    const catalog = resourcePageRegistry.map(toResourceCatalogItem);
    const articles = filterResourceCatalog(catalog, { type: 'articles' });
    expect(articles.length).toBe(10);
    expect(articles.every((c) => c.type === 'articles')).toBe(true);

    const search = filterResourceCatalog(catalog, { query: 'CDM' });
    expect(search.length).toBeGreaterThan(0);
  });

  it('filters by industry, author, year, and reading time', () => {
    const catalog = resourcePageRegistry.map(toResourceCatalogItem);
    const construction = filterResourceCatalog(catalog, {
      industry: 'construction',
    });
    expect(construction.length).toBeGreaterThan(0);

    const author = filterResourceCatalog(catalog, { author: 'CKBHSE' });
    expect(author.length).toBeGreaterThan(0);

    const year = filterResourceCatalog(catalog, { year: 2024 });
    expect(year.length).toBeGreaterThan(0);

    const short = filterResourceCatalog(catalog, { readingTime: 'short' });
    expect(short.every((c) => parseInt(c.readingTime, 10) <= 5)).toBe(true);
  });

  it('filters downloadable and featured resources', () => {
    const catalog = resourcePageRegistry.map(toResourceCatalogItem);
    const downloads = filterResourceCatalog(catalog, {
      downloadableOnly: true,
    });
    expect(downloads.length).toBeGreaterThan(0);
    expect(downloads.every((c) => c.downloadable)).toBe(true);

    const featured = filterResourceCatalog(catalog, { featuredOnly: true });
    expect(featured.length).toBeGreaterThan(0);
  });

  it('parses resource paths', () => {
    expect(
      parseResourcePath('/resources/articles/understanding-cdm-2015'),
    ).toEqual({
      type: 'articles',
      slug: 'understanding-cdm-2015',
    });
    expect(parseResourcePath('/resources')).toBeNull();
  });

  it('resolves related resources from metadata', () => {
    const page = resourcePageRegistry.find(
      (p) => p.slug === 'understanding-cdm-2015',
    );
    expect(page).toBeDefined();
    const related = resolveRelatedResources(
      resourcePageRegistry,
      page!.relatedResources ?? [],
    );
    expect(related.length).toBeGreaterThan(0);
  });
});
