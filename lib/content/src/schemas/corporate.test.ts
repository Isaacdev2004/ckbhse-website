import { describe, expect, it } from 'vitest';
import { corporatePageRegistry } from '../data/corporate/index.js';
import { corporatePageSchema } from './corporate.js';

describe('corporatePageSchema', () => {
  it('validates all registered corporate pages', () => {
    for (const page of corporatePageRegistry) {
      const result = corporatePageSchema.safeParse(page);
      expect(result.success, page.slug).toBe(true);
    }
  });

  it('requires unique paths and slugs', () => {
    const slugs = corporatePageRegistry.map((p) => p.slug);
    const paths = corporatePageRegistry.map((p) => p.path);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
