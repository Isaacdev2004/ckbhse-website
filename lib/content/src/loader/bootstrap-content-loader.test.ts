import { describe, expect, it } from 'vitest';
import { resolveContentLoader } from './bootstrap.js';

describe('resolveContentLoader', () => {
  it('returns composite loader when mode is composite and snapshot is provided', () => {
    const loader = resolveContentLoader({
      mode: 'composite',
      snapshot: {
        generatedAt: '2026-07-30T00:00:00.000Z',
        locale: 'en-GB',
        entries: [],
      },
    });
    expect(loader.constructor.name).toBe('CompositeContentLoader');
  });
});
