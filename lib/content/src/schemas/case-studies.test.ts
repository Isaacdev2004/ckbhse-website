import { describe, expect, it } from 'vitest';
import { caseStudyPageRegistry } from '../data/case-studies/index.js';
import { caseStudyPageSchema } from './case-studies.js';
import {
  filterCaseStudyCatalog,
  parseCaseStudyPath,
  resolveRelatedCaseStudies,
  toCaseStudyCatalogItem,
} from '../case-studies/catalog.js';

describe('caseStudyPageSchema', () => {
  it('validates all registered case study pages', () => {
    for (const page of caseStudyPageRegistry) {
      const result = caseStudyPageSchema.safeParse(page);
      expect(result.success, `${page.industry}/${page.slug}`).toBe(true);
    }
  });

  it('requires unique paths', () => {
    const paths = caseStudyPageRegistry.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('registers 8 case studies across eight industries', () => {
    expect(caseStudyPageRegistry).toHaveLength(8);
    const industries = new Set(caseStudyPageRegistry.map((p) => p.industry));
    expect(industries.size).toBe(8);
  });
});

describe('case study catalog', () => {
  it('filters by industry and search query', () => {
    const catalog = caseStudyPageRegistry.map(toCaseStudyCatalogItem);
    const construction = filterCaseStudyCatalog(catalog, {
      industry: 'construction',
    });
    expect(construction.length).toBe(1);
    expect(construction[0]?.industry).toBe('construction');

    const search = filterCaseStudyCatalog(catalog, { query: 'ISO' });
    expect(search.length).toBeGreaterThan(0);
  });

  it('parses case study paths', () => {
    expect(
      parseCaseStudyPath('/case-studies/construction/cdm-london-development'),
    ).toEqual({ industry: 'construction', slug: 'cdm-london-development' });
    expect(parseCaseStudyPath('/case-studies')).toBeNull();
  });

  it('resolves related case studies from metadata', () => {
    const page = caseStudyPageRegistry.find(
      (p) => p.slug === 'cdm-london-development',
    );
    expect(page).toBeDefined();
    const related = resolveRelatedCaseStudies(
      caseStudyPageRegistry,
      page!.relatedCaseStudies ?? [],
    );
    expect(related.length).toBeGreaterThan(0);
  });
});
