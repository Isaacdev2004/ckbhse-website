import { describe, expect, it } from 'vitest';
import { servicePageRegistry } from '../data/services/index.js';
import { servicePageSchema } from './services.js';
import {
  filterServiceCatalog,
  parseServicePath,
  toCatalogItem,
} from '../services/catalog.js';

describe('servicePageSchema', () => {
  it('validates all registered service pages', () => {
    for (const page of servicePageRegistry) {
      const result = servicePageSchema.safeParse(page);
      expect(result.success, `${page.category}/${page.slug}`).toBe(true);
    }
  });

  it('requires unique paths', () => {
    const paths = servicePageRegistry.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('registers 38 services across six categories', () => {
    expect(servicePageRegistry).toHaveLength(38);
    const categories = new Set(servicePageRegistry.map((p) => p.category));
    expect(categories.size).toBe(6);
  });
});

describe('service catalog', () => {
  it('filters by category and search query', () => {
    const catalog = servicePageRegistry.map(toCatalogItem);
    const hs = filterServiceCatalog(catalog, {
      category: 'health-safety',
    });
    expect(hs.length).toBe(8);
    expect(hs.every((s) => s.category === 'health-safety')).toBe(true);

    const search = filterServiceCatalog(catalog, { query: 'ISO' });
    expect(search.length).toBeGreaterThan(0);
    expect(
      search.some(
        (s) =>
          s.title.toLowerCase().includes('iso') ||
          s.summary.toLowerCase().includes('iso'),
      ),
    ).toBe(true);
  });

  it('parses service paths', () => {
    expect(
      parseServicePath('/services/health-safety/risk-assessments'),
    ).toEqual({
      category: 'health-safety',
      slug: 'risk-assessments',
    });
    expect(parseServicePath('/services')).toBeNull();
  });
});
