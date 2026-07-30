import { buildCanonicalUrl } from './canonical.js';
import { getSeoSiteConfig } from './config.js';
import { getIndexableRoutes } from './routes.js';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?:
    'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface GenerateSitemapOptions {
  siteUrl?: string;
  basePath?: string;
  lastmod?: string;
}

export function generateSitemapEntries(
  options: GenerateSitemapOptions = {},
): SitemapEntry[] {
  const lastmod = options.lastmod ?? new Date().toISOString().slice(0, 10);

  return getIndexableRoutes().map((route) => ({
    loc: buildCanonicalUrl(route.path, {
      ...(options.siteUrl ? { siteUrl: options.siteUrl } : {}),
      ...(options.basePath ? { basePath: options.basePath } : {}),
    }),
    lastmod,
    changefreq: route.path === '/' ? 'weekly' : 'monthly',
    priority: route.path === '/' ? 1 : 0.8,
  }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function generateSitemapXml(
  options: GenerateSitemapOptions = {},
): string {
  const entries = generateSitemapEntries(options);
  const body = entries
    .map((entry) => {
      const parts = ['  <url>', `    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) {
        parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      if (entry.changefreq) {
        parts.push(
          `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        );
      }
      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      parts.push('  </url>');
      return parts.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function getSitemapUrl(siteUrl?: string): string {
  const config = getSeoSiteConfig();
  const base = (siteUrl ?? config.siteUrl).replace(/\/$/, '');
  return `${base}/sitemap.xml`;
}
