import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  emptyPage,
  isSearchableTerm,
  normaliseSearchTerm,
  toCursorPage,
  toOffsetPage,
  toSortSpec,
} from './index.js';

describe('toOffsetPage', () => {
  it('applies the default page size', () => {
    expect(toOffsetPage()).toEqual({
      kind: 'offset',
      limit: DEFAULT_PAGE_SIZE,
      offset: 0,
    });
  });

  it('clamps an oversized limit rather than trusting it', () => {
    // An unbounded limit is both a denial-of-service vector and an accidental
    // full-table scan.
    expect(toOffsetPage({ limit: 10_000 }).limit).toBe(MAX_PAGE_SIZE);
  });

  it('rejects a non-positive limit', () => {
    expect(() => toOffsetPage({ limit: 0 })).toThrowError(
      expect.objectContaining({ code: 'bad_request' }),
    );
    expect(() => toOffsetPage({ limit: -5 })).toThrowError(
      expect.objectContaining({ code: 'bad_request' }),
    );
  });

  it('rejects a fractional limit', () => {
    expect(() => toOffsetPage({ limit: 2.5 })).toThrowError(
      expect.objectContaining({ code: 'bad_request' }),
    );
  });

  it('rejects a negative offset rather than silently correcting it', () => {
    expect(() => toOffsetPage({ offset: -1 })).toThrowError(
      expect.objectContaining({ code: 'bad_request' }),
    );
  });
});

describe('toCursorPage', () => {
  it('omits the cursor when none is supplied', () => {
    expect(toCursorPage()).toEqual({
      kind: 'cursor',
      limit: DEFAULT_PAGE_SIZE,
    });
  });

  it('carries the cursor through and clamps the limit', () => {
    expect(toCursorPage({ cursor: 'abc', limit: 500 })).toEqual({
      kind: 'cursor',
      limit: MAX_PAGE_SIZE,
      cursor: 'abc',
    });
  });
});

describe('toSortSpec', () => {
  const allowed = ['createdAt', 'severity'] as const;
  const fallback = { field: 'createdAt', direction: 'desc' } as const;

  it('falls back when no field is requested', () => {
    expect(toSortSpec(undefined, allowed, fallback)).toEqual(fallback);
    expect(toSortSpec({}, allowed, fallback)).toEqual(fallback);
  });

  it('accepts an allowlisted field', () => {
    expect(
      toSortSpec({ field: 'severity', direction: 'asc' }, allowed, fallback),
    ).toEqual({ field: 'severity', direction: 'asc' });
  });

  it('rejects a field outside the allowlist', () => {
    // Ordering by an unreadable column reveals its values through the ordering
    // alone, so the allowlist is a disclosure control, not just validation.
    expect(() =>
      toSortSpec({ field: 'passwordHash' }, allowed, fallback),
    ).toThrowError(expect.objectContaining({ code: 'bad_request' }));
  });

  it('defaults an unrecognised direction to ascending', () => {
    expect(
      toSortSpec(
        { field: 'severity', direction: 'sideways' },
        allowed,
        fallback,
      ).direction,
    ).toBe('asc');
  });
});

describe('search terms', () => {
  it('collapses whitespace', () => {
    expect(normaliseSearchTerm('  fire   risk  ')).toBe('fire risk');
  });

  it('rejects terms too short to be worth a scan', () => {
    expect(isSearchableTerm('a')).toBe(false);
    expect(isSearchableTerm('   ')).toBe(false);
    expect(isSearchableTerm('fire')).toBe(true);
  });
});

describe('emptyPage', () => {
  it('reports no results and no continuation', () => {
    expect(emptyPage()).toEqual({ items: [], hasMore: false });
  });
});
