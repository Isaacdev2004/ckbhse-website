/** Normalise a path segment or slug to lowercase kebab-case. */
export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normalise a public route path — leading slash, no trailing slash (except `/`). */
export function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/';
  }
  const cleaned = path.split('#')[0]?.split('?')[0] ?? path;
  const withLeading = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return withLeading.replace(/\/+$/, '') || '/';
}
