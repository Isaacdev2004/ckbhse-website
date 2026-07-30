/* eslint-disable no-console -- build script progress output */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bootstrapContentLoaderFromEnv } from '@workspace/content/loader/bootstrap';
import { resolveSeoSiteConfig } from '@workspace/seo/config';
import { generateRobotsTxt } from '@workspace/seo/robots';
import { getPrerenderRoutes } from '@workspace/seo/routes';
import { generateSitemapXml } from '@workspace/seo/sitemap';
import { prerenderHtmlShells } from '@workspace/seo/prerender';
import { prerenderFullPages } from './prerender-full.ts';

const distDir = join(import.meta.dirname, '..', 'dist', 'public');
const basePath = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '') || '/';

bootstrapContentLoaderFromEnv(process.env);
resolveSeoSiteConfig(process.env);

console.log('[postbuild-seo] Generating sitemap.xml…');
writeFileSync(
  join(distDir, 'sitemap.xml'),
  generateSitemapXml({ basePath }),
  'utf8',
);

console.log('[postbuild-seo] Generating robots.txt…');
writeFileSync(
  join(distDir, 'robots.txt'),
  generateRobotsTxt({ environment: process.env.NODE_ENV ?? 'production' }),
  'utf8',
);

console.log('[postbuild-seo] Prerendering HTML shells with route metadata…');
prerenderHtmlShells({
  distDir,
  basePath: basePath === '/' ? undefined : basePath,
  routes: getPrerenderRoutes(),
});

if (process.env.PRERENDER_FULL === '1') {
  console.log('[postbuild-seo] Running full Puppeteer prerender…');
  await prerenderFullPages({ distDir, basePath });
} else {
  console.log(
    '[postbuild-seo] Skipping full body prerender (set PRERENDER_FULL=1 to enable).',
  );
}

console.log('[postbuild-seo] Complete.');
