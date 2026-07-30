import { getSeoSiteConfig } from './config.js';
import { getSitemapUrl } from './sitemap.js';

export interface GenerateRobotsOptions {
  siteUrl?: string;
  environment?: string;
  allowAll?: boolean;
}

/** Generate robots.txt with sitemap reference and environment-aware directives. */
export function generateRobotsTxt(options: GenerateRobotsOptions = {}): string {
  const config = getSeoSiteConfig();
  const env = options.environment ?? process.env.NODE_ENV ?? 'production';
  const isProduction = env === 'production';
  const sitemapUrl = getSitemapUrl(options.siteUrl ?? config.siteUrl);

  if (!isProduction && options.allowAll !== true) {
    return [
      'User-agent: *',
      'Disallow: /',
      `# Non-production environment (${env}) — block crawlers by default`,
      `Sitemap: ${sitemapUrl}`,
      '',
    ].join('\n');
  }

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');
}
