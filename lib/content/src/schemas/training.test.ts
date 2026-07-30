import { describe, expect, it } from 'vitest';
import { trainingPageRegistry } from '../data/training/index.js';
import { coursePageSchema } from './training.js';
import {
  filterTrainingCatalog,
  parseTrainingPath,
  resolveRelatedCourses,
  toTrainingCatalogItem,
} from '../training/catalog.js';

describe('coursePageSchema', () => {
  it('validates all registered course pages', () => {
    for (const page of trainingPageRegistry) {
      const result = coursePageSchema.safeParse(page);
      expect(result.success, `${page.category}/${page.slug}`).toBe(true);
    }
  });

  it('requires unique paths', () => {
    const paths = trainingPageRegistry.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('registers 29 courses across six categories', () => {
    expect(trainingPageRegistry).toHaveLength(29);
    const categories = new Set(trainingPageRegistry.map((p) => p.category));
    expect(categories.size).toBe(6);
  });
});

describe('training catalog', () => {
  it('filters by category and search query', () => {
    const catalog = trainingPageRegistry.map(toTrainingCatalogItem);
    const hs = filterTrainingCatalog(catalog, {
      category: 'health-safety',
    });
    expect(hs.length).toBe(10);
    expect(hs.every((c) => c.category === 'health-safety')).toBe(true);

    const search = filterTrainingCatalog(catalog, { query: 'IOSH' });
    expect(search.length).toBeGreaterThan(0);
  });

  it('filters by delivery method and pathway level', () => {
    const catalog = trainingPageRegistry.map(toTrainingCatalogItem);
    const online = filterTrainingCatalog(catalog, { deliveryMethod: 'online' });
    expect(online.length).toBeGreaterThan(0);
    expect(online.every((c) => c.deliveryMethods.includes('online'))).toBe(
      true,
    );

    const leadership = filterTrainingCatalog(catalog, {
      pathwayLevel: 'leadership',
    });
    expect(leadership.length).toBeGreaterThan(0);
  });

  it('parses training paths', () => {
    expect(
      parseTrainingPath('/training/health-safety/iosh-managing-safely'),
    ).toEqual({
      category: 'health-safety',
      slug: 'iosh-managing-safely',
    });
    expect(parseTrainingPath('/training')).toBeNull();
  });

  it('resolves related courses from metadata', () => {
    const page = trainingPageRegistry.find(
      (p) => p.slug === 'iosh-managing-safely',
    );
    expect(page).toBeDefined();
    const related = resolveRelatedCourses(
      trainingPageRegistry,
      page!.relatedCourses ?? [],
    );
    expect(related.length).toBeGreaterThan(0);
  });
});
