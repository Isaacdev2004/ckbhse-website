import { describe, expect, it } from 'vitest';
import { industryPageRegistry } from '../data/industries/index.js';
import { industryPageSchema } from './industries.js';
import {
  filterIndustryCatalog,
  parseIndustryPath,
  toIndustryCatalogItem,
} from '../industries/catalog.js';

describe('industryPageSchema', () => {
  it('validates all registered industry pages', () => {
    for (const page of industryPageRegistry) {
      const result = industryPageSchema.safeParse(page);
      expect(result.success, page.slug).toBe(true);
    }
  });

  it('requires unique paths', () => {
    const paths = industryPageRegistry.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('registers 12 industry sectors', () => {
    expect(industryPageRegistry).toHaveLength(12);
    const sectors = new Set(industryPageRegistry.map((p) => p.sector));
    expect(sectors.size).toBeGreaterThan(1);
  });
});

describe('industry catalog', () => {
  it('filters by sector and search query', () => {
    const catalog = industryPageRegistry.map(toIndustryCatalogItem);
    const built = filterIndustryCatalog(catalog, {
      sector: 'built-environment',
    });
    expect(built.length).toBeGreaterThan(0);
    expect(built.every((i) => i.sector === 'built-environment')).toBe(true);

    const search = filterIndustryCatalog(catalog, { query: 'CDM' });
    expect(search.length).toBeGreaterThan(0);
  });

  it('filters by regulatory theme', () => {
    const catalog = industryPageRegistry.map(toIndustryCatalogItem);
    const filtered = filterIndustryCatalog(catalog, {
      regulatoryTheme: 'cdm',
    });
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('parses industry paths', () => {
    expect(parseIndustryPath('/industries/construction')).toEqual({
      slug: 'construction',
    });
    expect(parseIndustryPath('/industries')).toBeNull();
  });
});
