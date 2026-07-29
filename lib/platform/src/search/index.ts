/**
 * Query, pagination and search contracts.
 *
 * Document 04 section 13.6 identifies permission-aware search as the
 * highest-severity risk in the platform: a search index is a denormalised copy
 * of everything, and one that filters *after* the query leaks totals and
 * pagination positions even when it hides titles.
 *
 * The contract here encodes that rule structurally. A `SearchRequest` carries no
 * tenant or permission fields at all, because callers must not be able to
 * supply them — the implementing repository derives both from the authorization
 * context. There is deliberately no way to express "search everything".
 */

import { AppError } from '../errors/index.js';

// --- Pagination --------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

/**
 * Offset pagination. Simple and jumpable, but drifts when rows are inserted
 * between requests, so it suits administrative tables rather than feeds.
 */
export interface OffsetPage {
  readonly kind: 'offset';
  readonly limit: number;
  readonly offset: number;
}

/**
 * Cursor pagination. Stable under concurrent writes, so it is the right default
 * for anything a user scrolls.
 */
export interface CursorPage {
  readonly kind: 'cursor';
  readonly limit: number;
  readonly cursor?: string;
}

export type PageRequest = OffsetPage | CursorPage;

export interface PageRequestInput {
  readonly limit?: number;
  readonly offset?: number;
  readonly cursor?: string;
}

/**
 * Clamp untrusted pagination input.
 *
 * An unbounded `limit` is a denial-of-service vector and an accidental
 * full-table scan, so the maximum is enforced here rather than trusted from the
 * caller. A negative offset is rejected outright rather than silently corrected,
 * because it usually indicates a client bug worth surfacing.
 */
export function toOffsetPage(input: PageRequestInput = {}): OffsetPage {
  const limit = clampLimit(input.limit);
  const offset = input.offset ?? 0;

  if (!Number.isInteger(offset) || offset < 0) {
    throw AppError.badRequest(
      'Pagination offset must be a non-negative integer',
    );
  }

  return { kind: 'offset', limit, offset };
}

export function toCursorPage(input: PageRequestInput = {}): CursorPage {
  return {
    kind: 'cursor',
    limit: clampLimit(input.limit),
    ...(input.cursor !== undefined ? { cursor: input.cursor } : {}),
  };
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(limit) || limit < 1) {
    throw AppError.badRequest('Pagination limit must be a positive integer');
  }

  return Math.min(limit, MAX_PAGE_SIZE);
}

/**
 * A page of results.
 *
 * `total` is optional and that is deliberate: for permission-filtered queries an
 * accurate total is itself a disclosure, and computing one often costs a second
 * full scan. Implementations return it only where both are acceptable.
 */
export interface Page<T> {
  readonly items: readonly T[];
  readonly hasMore: boolean;
  readonly nextCursor?: string;
  readonly total?: number;
}

export function emptyPage<T>(): Page<T> {
  return { items: [], hasMore: false };
}

// --- Sorting and filtering ---------------------------------------------------

export type SortDirection = 'asc' | 'desc';

export interface SortSpec<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

/**
 * Sort fields are validated against an allowlist rather than passed through.
 * Accepting an arbitrary column name lets a caller order by a field they cannot
 * read, which reveals its values through the ordering alone.
 */
export function toSortSpec<TField extends string>(
  input: { field?: string; direction?: string } | undefined,
  allowedFields: readonly TField[],
  fallback: SortSpec<TField>,
): SortSpec<TField> {
  if (!input?.field) return fallback;

  const field = allowedFields.find((allowed) => allowed === input.field);
  if (field === undefined) {
    throw AppError.badRequest(`Cannot sort by field: ${input.field}`);
  }

  const direction: SortDirection = input.direction === 'desc' ? 'desc' : 'asc';
  return { field, direction };
}

// --- Search ------------------------------------------------------------------

/**
 * A search request.
 *
 * Note what is absent: no organisation id, no permission list, no "include all"
 * escape hatch. Scope is always derived from the authorization context by the
 * repository, so no caller — including an internal one — can widen it.
 */
export interface SearchRequest<TFilters = Record<string, unknown>> {
  /** Free-text term. Empty means "filter only". */
  readonly term: string;
  readonly filters?: TFilters;
  readonly page: PageRequest;
  readonly sort?: SortSpec;
}

export interface SearchHit<T> {
  readonly item: T;
  /** Relevance, where the implementation provides one. */
  readonly score?: number;
}

export interface SearchResult<T> extends Page<SearchHit<T>> {
  /**
   * Results grouped by type, for the grouped presentation Document 04 section
   * 13.2 requires on the public site.
   */
  readonly groupCounts?: ReadonlyMap<string, number>;
}

/**
 * The interface every searchable repository implements.
 *
 * `TContext` is the authorization context; it is a required first parameter on
 * purpose, so a permission-unaware search cannot be written without noticing.
 */
export interface SearchableRepository<T, TContext, TFilters = never> {
  search(
    context: TContext,
    request: SearchRequest<TFilters>,
  ): Promise<SearchResult<T>>;
}

export function normaliseSearchTerm(term: string): string {
  return term.trim().replace(/\s+/g, ' ');
}

/**
 * Whether a request is worth executing. Single characters match most of the
 * table and cost a scan to discover that, so callers should return an empty
 * result instead.
 */
export function isSearchableTerm(term: string, minimumLength = 2): boolean {
  return normaliseSearchTerm(term).length >= minimumLength;
}
