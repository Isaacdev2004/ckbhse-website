import { getSeoSiteConfig } from './config.js';
import { normalizePath } from './slug.js';

export interface CanonicalOptions {
  siteUrl?: string;
  basePath?: string;
}

/** Build an absolute canonical URL for a public route path. */
export function buildCanonicalUrl(
  path: string,
  options: CanonicalOptions = {},
): string {
  const config = getSeoSiteConfig();
  const siteUrl = (options.siteUrl ?? config.siteUrl).replace(/\/$/, '');
  const basePath = normalizeBasePath(options.basePath ?? '/');
  const normalised = normalizePath(path);

  if (normalised === '/') {
    return basePath === '/' ? siteUrl : `${siteUrl}${basePath}`;
  }

  const suffix = basePath === '/' ? normalised : `${basePath}${normalised}`;
  return `${siteUrl}${suffix}`;
}

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') {
    return '/';
  }
  const withLeading = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return withLeading.replace(/\/$/, '');
}

/** Resolve canonical from explicit override or computed from path. */
export function resolveCanonicalUrl(
  path: string,
  explicitCanonical?: string,
  options: CanonicalOptions = {},
): string {
  if (explicitCanonical) {
    return explicitCanonical;
  }
  return buildCanonicalUrl(path, options);
}
